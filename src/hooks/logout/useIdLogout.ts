import { useEffect, useRef } from "react";

export function useBankIdleLogout(timeoutMs = 10000 * 60 * 1000, isBusy = false) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    if (isBusy) return;

    timer.current = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("session-expired"));
    }, timeoutMs);
  };

  useEffect(() => {
    resetTimer();

    const handleActivity = () => resetTimer();
    const handleVisibility = () => resetTimer();

    const events = ["mousemove", "click", "keydown", "wheel", "touchstart"];
    events.forEach((ev) => window.addEventListener(ev, handleActivity));
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleActivity));
      document.removeEventListener("visibilitychange", handleVisibility);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [timeoutMs, isBusy]);
}
