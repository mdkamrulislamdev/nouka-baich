"use client";

import { useEffect, useRef } from "react";

/**
 * Touch/mouse steering for the river canvas.
 * Maps finger/cursor X across the playfield to a -1..1 steer axis while pressed.
 * Releases immediately on up/cancel — never leaves a stuck "active" lock.
 */
export function usePointerSteering(): {
  /** Current steer axis, or 0 when not pressing. */
  getAxis: () => number;
  /** True only while a primary pointer is currently down on the canvas. */
  isPressed: () => boolean;
} {
  const axisRef = useRef(0);
  const pressedRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);

  useEffect(() => {
    const reset = () => {
      pointerIdRef.current = null;
      pressedRef.current = false;
      axisRef.current = 0;
    };

    const axisFromClientX = (clientX: number, canvas: Element): number => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 1) {
        return 0;
      }
      // Map full canvas width to -1..1 with a soft dead-zone in the center.
      const normalized = ((clientX - rect.left) / rect.width) * 2 - 1;
      const dead = 0.06;
      if (Math.abs(normalized) < dead) {
        return 0;
      }
      const signed =
        Math.sign(normalized) *
        Math.min(1, (Math.abs(normalized) - dead) / (1 - dead));
      return signed;
    };

    const onPointerDown = (event: PointerEvent) => {
      if (pointerIdRef.current !== null) {
        return;
      }
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const canvas = target.closest("[data-game-canvas]");
      if (!canvas) {
        return;
      }
      if (target.closest("button, a, input, [role='button']")) {
        return;
      }

      pointerIdRef.current = event.pointerId;
      pressedRef.current = true;
      axisRef.current = axisFromClientX(event.clientX, canvas);

      try {
        target.setPointerCapture(event.pointerId);
      } catch {
        // Capture is optional.
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerIdRef.current || !pressedRef.current) {
        return;
      }
      const target = event.target;
      const canvas =
        (target instanceof Element &&
          target.closest("[data-game-canvas]")) ||
        document.querySelector("[data-game-canvas]");
      if (!(canvas instanceof Element)) {
        return;
      }
      axisRef.current = axisFromClientX(event.clientX, canvas);
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

    // Capture phase so we still clear even if something stops propagation.
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("pointermove", onPointerMove, true);
    window.addEventListener("pointerup", onPointerUp, true);
    window.addEventListener("pointercancel", onPointerUp, true);
    window.addEventListener("lostpointercapture", onLostCapture, true);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("pointermove", onPointerMove, true);
      window.removeEventListener("pointerup", onPointerUp, true);
      window.removeEventListener("pointercancel", onPointerUp, true);
      window.removeEventListener("lostpointercapture", onLostCapture, true);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return {
    getAxis: () => (pressedRef.current ? axisRef.current : 0),
    isPressed: () => pressedRef.current,
  };
}
