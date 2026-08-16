"use client";

import { useEffect, useRef } from "react";

const LEFT_CODES = new Set(["ArrowLeft", "KeyA"]);
const RIGHT_CODES = new Set(["ArrowRight", "KeyD"]);

function isSteerKey(code: string): boolean {
  return LEFT_CODES.has(code) || RIGHT_CODES.has(code);
}

export function useKeyboardSteering(): () => number {
  const axisRef = useRef(0);
  const leftRef = useRef(false);
  const rightRef = useRef(false);

  useEffect(() => {
    const syncAxis = () => {
      axisRef.current = Number(rightRef.current) - Number(leftRef.current);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!isSteerKey(event.code)) {
        return;
      }

      event.preventDefault();

      if (LEFT_CODES.has(event.code)) {
        leftRef.current = true;
      }
      if (RIGHT_CODES.has(event.code)) {
        rightRef.current = true;
      }

      syncAxis();
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (LEFT_CODES.has(event.code)) {
        leftRef.current = false;
      }
      if (RIGHT_CODES.has(event.code)) {
        rightRef.current = false;
      }

      syncAxis();
    };

    const onBlur = () => {
      leftRef.current = false;
      rightRef.current = false;
      axisRef.current = 0;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  return () => axisRef.current;
}
