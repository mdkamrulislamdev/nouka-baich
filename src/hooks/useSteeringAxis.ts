"use client";

import { useKeyboardSteering } from "@/hooks/useKeyboardSteering";
import { usePointerSteering } from "@/hooks/usePointerSteering";

export function useSteeringAxis(): () => number {
  const getKeyboardAxis = useKeyboardSteering();
  const pointer = usePointerSteering();

  return () => {
    const keyboard = getKeyboardAxis();
    if (Math.abs(keyboard) > 0.001) {
      return keyboard;
    }
    if (pointer.isPressed()) {
      return pointer.getAxis();
    }
    return 0;
  };
}
