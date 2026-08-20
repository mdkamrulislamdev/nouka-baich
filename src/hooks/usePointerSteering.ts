"use client";

import { useEffect, useRef } from "react";

import { STEER } from "@/components/canvas/sceneConfig";

/** Ignore tiny press jitter until the player actually drags. */
const ACTIVATE_DRAG_PX = 8;

export function usePointerSteering(): {
  getAxis: () => number;
  isActive: () => boolean;
} {
  const axisRef = useRef(0);
  const activeRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const originXRef = useRef(0);
  const lastMoveAtRef = useRef(0);

  useEffect(() => {
    const reset = () => {
      pointerIdRef.current = null;
      activeRef.current = false;
      axisRef.current = 0;
      lastMoveAtRef.current = 0;
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

      // Don't steal focus from UI buttons/settings inside overlays.
      if (target.closest("button, a, input, [role='button']")) {
        return;
      }

      pointerIdRef.current = event.pointerId;
      originXRef.current = event.clientX;
      // Press alone must not lock out keyboard — wait for a real drag.
      activeRef.current = false;
      axisRef.current = 0;
      lastMoveAtRef.current = performance.now();

      if (target instanceof Element) {
        try {
          target.setPointerCapture(event.pointerId);
        } catch {
          // Some hosts reject capture; window listeners still work.
        }
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerIdRef.current) {
        return;
      }

      const deltaX = event.clientX - originXRef.current;
      lastMoveAtRef.current = performance.now();

      if (!activeRef.current) {
        if (Math.abs(deltaX) < ACTIVATE_DRAG_PX) {
          return;
        }
        activeRef.current = true;
      }

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

    const onLostCapture = (event: PointerEvent) => {
      if (event.pointerId === pointerIdRef.current) {
        reset();
      }
    };

    const onVisibility = () => {
      if (document.visibilityState !== "visible") {
        reset();
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("lostpointercapture", onLostCapture);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("lostpointercapture", onLostCapture);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return {
    getAxis: () => axisRef.current,
    isActive: () => {
      // Safety: drop a stale drag if moves stop mid-gesture (common on mobile).
      if (
        activeRef.current &&
        lastMoveAtRef.current > 0 &&
        performance.now() - lastMoveAtRef.current > 2500
      ) {
        activeRef.current = false;
        axisRef.current = 0;
        pointerIdRef.current = null;
        return false;
      }
      return activeRef.current;
    },
  };
}
