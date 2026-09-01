"use client";

import { useGameStore } from "@/store/useGameStore";

export function SinkToast() {
  const status = useGameStore((state) => state.status);
  const sinkFlash = useGameStore((state) => state.sinkFlash);
  const sinkBonus = useGameStore((state) => Math.floor(state.sinkBonus));
  const sinkCombo = useGameStore((state) => state.sinkCombo);

  if ((status !== "PLAYING" && status !== "PAUSED") || sinkFlash === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-36 z-20 flex justify-center px-4 sm:top-40">
      <div
        key={sinkFlash}
        className="close-call-toast rounded-sm border border-[#7ad0ff] bg-[#0d3a4a]/90 px-5 py-2.5 text-center shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-[2px]"
      >
        <p className="font-bengali text-lg font-bold text-[#f6e6c2]">
          ডুবে গেল!
        </p>
        <p className="text-[0.65rem] tracking-[0.28em] text-[#7ad0ff] uppercase">
          Boat sunk! +{sinkBonus.toLocaleString()}
          {sinkCombo > 1 ? ` · x${sinkCombo} combo` : ""}
        </p>
      </div>
    </div>
  );
}
