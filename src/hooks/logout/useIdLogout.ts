import { useEffect, useRef } from "react";

export function useBankIdleLogout(timeoutMs = 10 * 60 * 1000) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("session-expired"));
    }, timeoutMs);
  };

  const handleActivity = () => {
    resetTimer();
  };

  useEffect(() => {
    resetTimer();

    const events = ["mousemove", "click", "keydown", "wheel", "touchstart"];
    events.forEach((ev) => window.addEventListener(ev, handleActivity));

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        // вкладка ушла в фон — считаем как неактивность
        resetTimer();
      } else {
        // вернулся — считаем как активность
        resetTimer();
      }
    });

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleActivity));
      if (timer.current) clearTimeout(timer.current);
    };
  }, [timeoutMs]);
}
