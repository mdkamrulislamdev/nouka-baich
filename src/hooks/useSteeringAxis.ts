"use client";

import { useKeyboardSteering } from "@/hooks/useKeyboardSteering";
import { usePointerSteering } from "@/hooks/usePointerSteering";

export function useSteeringAxis(): () => number {
  const getKeyboardAxis = useKeyboardSteering();
  const pointer = usePointerSteering();

  return () => {
    if (pointer.isActive()) {
      return pointer.getAxis();
    }

    return getKeyboardAxis();
  };
}
