"use client";

import { useEffect, useRef } from "react";

import { STEER } from "@/components/canvas/sceneConfig";

export function usePointerSteering(): {
  getAxis: () => number;
  isActive: () => boolean;
} {
  const axisRef = useRef(0);
  const activeRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const originXRef = useRef(0);

  useEffect(() => {
    const reset = () => {
      pointerIdRef.current = null;
      activeRef.current = false;
      axisRef.current = 0;
    };

    const onPointerDown = (event: PointerEvent) => {
      if (pointerIdRef.current !== null) {
        return;
      }

      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      const target = event.target;
      if (
        !(target instanceof Element) ||
        !target.closest("[data-game-canvas]")
      ) {
        return;
      }

      pointerIdRef.current = event.pointerId;
      originXRef.current = event.clientX;
      activeRef.current = true;
      axisRef.current = 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerIdRef.current) {
        return;
      }

      const deltaX = event.clientX - originXRef.current;
      axisRef.current = Math.max(
        -1,
        Math.min(1, deltaX / STEER.dragPixelsForFullSteer),
      );
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId !== pointerIdRef.current) {
        return;
      }

      reset();
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("blur", reset);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("blur", reset);
    };
  }, []);

  return {
    getAxis: () => axisRef.current,
    isActive: () => activeRef.current,
  };
}
