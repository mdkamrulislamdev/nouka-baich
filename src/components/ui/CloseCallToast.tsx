"use client";

import { useEffect, useState } from "react";

import { SCORE } from "@/components/canvas/sceneConfig";
import { useGameStore } from "@/store/useGameStore";

const FLASH_MS = 1600;

export function CloseCallToast() {
  const status = useGameStore((state) => state.status);
  const closeCallFlash = useGameStore((state) => state.closeCallFlash);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (closeCallFlash === 0) {
      return;
    }

    setVisible(true);
    const timer = window.setTimeout(() => {
      setVisible(false);
    }, FLASH_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [closeCallFlash]);

  if ((status !== "PLAYING" && status !== "PAUSED") || !visible) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-24 z-20 flex justify-center px-4 sm:top-28">
      <div className="animate-pulse rounded-sm border border-[#e4c36a] bg-[#9b1c1c]/88 px-5 py-2.5 text-center shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-[2px]">
        <p className="font-bengali text-lg font-bold text-[#f6e6c2]">
          খুব কাছে!
        </p>
        <p className="text-[0.65rem] tracking-[0.28em] text-[#e4c36a] uppercase">
          Close Call! +{SCORE.nearMissBonus}
        </p>
      </div>
    </div>
  );
}
