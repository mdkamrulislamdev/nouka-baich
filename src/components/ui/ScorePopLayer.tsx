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
    <div className="pointer-events-none absolute top-24 right-3 z-20 flex max-w-[42vw] flex-col items-end sm:top-28 sm:right-5">
      <div key={flash} className="score-pop text-right">
        <p className="font-bengali text-sm tracking-wide text-[#e4c36a]">
          {label}
        </p>
        {amount > 0 ? (
          <p className="font-mono text-2xl font-bold text-[#f6e6c2] tabular-nums sm:text-3xl">
            +{amount.toLocaleString()}
          </p>
        ) : null}
      </div>
    </div>
  );
}
