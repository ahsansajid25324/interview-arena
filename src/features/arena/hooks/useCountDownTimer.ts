import { useCallback, useEffect, useRef, useState } from "react";

interface UseCountdownTimerProps {
  initialSeconds: number;
  isPaused: boolean;
  onExpire: () => void;
}

export function useCountdownTimer({
  initialSeconds,
  isPaused,
  onExpire,
}: UseCountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [prevInitialSeconds, setPrevInitialSeconds] = useState(initialSeconds);
  const onExpireRef = useRef(onExpire);
  const expiredRef = useRef(false);

  if (prevInitialSeconds !== initialSeconds) {
    setPrevInitialSeconds(initialSeconds);
    setSecondsLeft(initialSeconds);
  }

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    expiredRef.current = false;
  }, [initialSeconds]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!expiredRef.current) {
            expiredRef.current = true;
            queueMicrotask(() => onExpireRef.current());
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const resetTimer = useCallback(
    (newSeconds = initialSeconds) => {
      expiredRef.current = false;
      setSecondsLeft(newSeconds);
    },
    [initialSeconds],
  );

  const formattedTime = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(
    secondsLeft % 60,
  ).padStart(2, "0")}`;

  return {
    secondsLeft,
    formattedTime,
    isWarning: secondsLeft <= 30 && secondsLeft > 10,
    isCritical: secondsLeft <= 10,
    resetTimer,
  };
}