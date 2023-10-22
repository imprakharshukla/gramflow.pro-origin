"use client";

import { useEffect, useState } from "react";

export default function useLongPress(callback = () => {}, ms = 300) {
  const [startLongPress, setStartLongPress] = useState(false);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (startLongPress) {
      const id = setTimeout(callback, ms);
      setTimerId(id);
    } else {
      if (timerId) {
        clearTimeout(timerId);
        setTimerId(undefined);
      }
    }

    return () => {
      if (timerId) {
        clearTimeout(timerId);
        setTimerId(undefined);
      }
    };
  }, [callback, ms, startLongPress, timerId]);

  return {
    onMouseDown: () => setStartLongPress(true),
    onMouseUp: () => setStartLongPress(false),
    onMouseLeave: () => setStartLongPress(false),
    onTouchStart: () => setStartLongPress(true),
    onTouchEnd: () => setStartLongPress(false),
  };
}
