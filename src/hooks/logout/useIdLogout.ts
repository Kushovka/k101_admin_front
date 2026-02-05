import { useEffect, useRef } from "react";

export function useBankIdleLogout(
  timeoutMs = 10000 * 60 * 1000,
  isBusy = false,
) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const startTimer = () => {
    clearTimer();
    timer.current = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("session-expired"));
    }, timeoutMs);
  };

  useEffect(() => {
    // ⛔ во время загрузки — НИКАКИХ таймеров
    if (isBusy) {
      clearTimer();
      return;
    }

    // ✅ пользователь свободен — запускаем idle таймер
    startTimer();

    const handleActivity = () => startTimer();
    const handleVisibility = () => startTimer();

    const events = ["mousemove", "click", "keydown", "wheel", "touchstart"];
    events.forEach((ev) => window.addEventListener(ev, handleActivity));
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearTimer();
      events.forEach((ev) => window.removeEventListener(ev, handleActivity));
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [timeoutMs, isBusy]);
}
