"use client";

import { useEffect } from "react";

import { requestKick, type KickIntent } from "@/lib/kickCombat";
import { useGameStore } from "@/store/useGameStore";

function intentFromCode(code: string): KickIntent | null {
  if (code === "KeyQ" || code === "Comma") {
    return -1;
  }
  if (code === "KeyE" || code === "Period") {
    return 1;
  }
  if (code === "Space" || code === "KeyK") {
    return 0;
  }
  return null;
}

/**
 * Q / , = left kick, E / . = right kick, Space / K = nearest side.
 */
export function useKickInput(): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const intent = intentFromCode(event.code);
      if (intent === null || event.repeat) {
        return;
      }

      const { status, settingsOpen } = useGameStore.getState();
      if (status !== "PLAYING" || settingsOpen) {
        return;
      }

      event.preventDefault();
      requestKick(intent);
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);
}
