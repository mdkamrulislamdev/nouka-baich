"use client";

import { useEffect } from "react";

import { requestKick } from "@/lib/kickCombat";
import { useGameStore } from "@/store/useGameStore";

const KICK_CODES = new Set(["Space", "KeyK"]);

/**
 * Space / K triggers a kick while playing. The on-screen Kick button
 * calls `requestKick` directly so this hook only covers the keyboard.
 */
export function useKickInput(): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!KICK_CODES.has(event.code) || event.repeat) {
        return;
      }

      const { status, settingsOpen } = useGameStore.getState();
      if (status !== "PLAYING" || settingsOpen) {
        return;
      }

      event.preventDefault();
      requestKick();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);
}
