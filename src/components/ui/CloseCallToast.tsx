"use client";

import { SCORE } from "@/components/canvas/sceneConfig";
import { useGameStore } from "@/store/useGameStore";

export function CloseCallToast() {
  const status = useGameStore((state) => state.status);
  const closeCallFlash = useGameStore((state) => state.closeCallFlash);
  const closeCallBonus = useGameStore((state) => Math.floor(state.closeCallBonus));
  const nearMissCombo = useGameStore((state) => state.nearMissCombo);

  if (
    (status !== "PLAYING" && status !== "PAUSED") ||
    closeCallFlash === 0
  ) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-24 z-20 flex justify-center px-4 sm:top-28">
      <div
        key={closeCallFlash}
        className="close-call-toast rounded-sm border border-[#e4c36a] bg-[#9b1c1c]/88 px-5 py-2.5 text-center shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-[2px]"
      >
        <p className="font-bengali text-lg font-bold text-[#f6e6c2]">
          খুব কাছে!
        </p>
        <p className="text-[0.65rem] tracking-[0.28em] text-[#e4c36a] uppercase">
          Close Call! +{closeCallBonus.toLocaleString()}
          {nearMissCombo > 1 ? ` · x${nearMissCombo} combo` : ""}
        </p>
      </div>
    </div>
  );
}
