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
    <div className="pointer-events-none absolute top-40 left-3 z-20 max-w-[42vw] sm:top-44 sm:left-5">
      <div
        key={sinkFlash}
        className="close-call-toast rounded-sm border border-[#7ad0ff] bg-[#0d3a4a]/90 px-3 py-2 text-left shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
      >
        <p className="font-bengali text-sm font-bold text-[#f6e6c2]">
          সরে গেল!
        </p>
        <p className="text-[0.58rem] tracking-[0.18em] text-[#7ad0ff] uppercase">
          Boat shoved! +{sinkBonus.toLocaleString()}
          {sinkCombo > 1 ? ` · x${sinkCombo}` : ""}
        </p>
      </div>
    </div>
  );
}
