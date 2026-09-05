"use client";

import { useGameStore } from "@/store/useGameStore";

export function ScorePopLayer() {
  const status = useGameStore((state) => state.status);
  const flash = useGameStore((state) => state.scorePopFlash);
  const amount = useGameStore((state) => state.scorePopAmount);
  const label = useGameStore((state) => state.scorePopLabel);

  if ((status !== "PLAYING" && status !== "PAUSED") || flash === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-[42%] z-20 flex justify-center px-4">
      <div key={flash} className="score-pop text-center">
        <p className="text-[0.7rem] tracking-[0.32em] text-[#e4c36a] uppercase">
          {label}
        </p>
        {amount > 0 ? (
          <p className="font-mono text-4xl font-bold text-[#f6e6c2] tabular-nums sm:text-5xl">
            +{amount.toLocaleString()}
          </p>
        ) : null}
      </div>
    </div>
  );
}
