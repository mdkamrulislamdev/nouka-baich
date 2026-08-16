"use client";

import { beginRun } from "@/lib/gameSession";
import { useGameStore } from "@/store/useGameStore";

export function GameOverModal() {
  const status = useGameStore((state) => state.status);
  const score = useGameStore((state) => state.score);
  const highScore = useGameStore((state) => state.highScore);
  const distance = useGameStore((state) => Math.floor(state.distance));
  const level = useGameStore((state) => state.level);
  const isNewHighScore = useGameStore((state) => state.isNewHighScore);

  if (status !== "GAMEOVER") {
    return null;
  }

  return (
    <div className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center bg-[#1a0c08]/60 px-4 backdrop-blur-[2px]">
      <div className="relative w-full max-w-md overflow-hidden rounded-sm border border-[#e4c36a]/70 bg-linear-to-b from-[#4a1414]/94 via-[#2a1a12]/95 to-[#132416]/94 px-8 py-9 shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:px-10">
        <div className="pointer-events-none absolute inset-3 border border-[#e4c36a]/30" />

        <div className="relative flex flex-col items-center text-center">
          <p className="font-bengali text-[0.7rem] tracking-[0.32em] text-[#e4c36a] uppercase">
            প্রতিযোগিতা শেষ
          </p>
          <h2 className="font-bengali mt-2 text-3xl font-bold text-[#f6e6c2]">
            নৌকা ডুবেছে
          </h2>
          <p className="mt-1 text-[0.65rem] tracking-[0.32em] text-[#e4c36a]/80 uppercase">
            Game Over
          </p>

          {isNewHighScore ? (
            <div className="mt-5 rounded-sm border border-[#e4c36a] bg-[#9b1c1c]/80 px-4 py-1.5 text-[0.7rem] tracking-[0.22em] text-[#f6e6c2] uppercase">
              নতুন সেরা · New Best
            </div>
          ) : null}

          <p className="font-bengali mt-6 text-sm text-[#e4c36a]">স্কোর</p>
          <p className="font-mono text-5xl font-semibold text-[#f6e6c2] tabular-nums">
            {score}
          </p>

          <div className="mt-5 grid w-full grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[0.6rem] tracking-[0.16em] text-[#e4c36a]/80 uppercase">
                Distance
              </p>
              <p className="font-mono text-sm text-[#f6e6c2] tabular-nums">
                {distance}m
              </p>
            </div>
            <div>
              <p className="text-[0.6rem] tracking-[0.16em] text-[#e4c36a]/80 uppercase">
                Level
              </p>
              <p className="font-mono text-sm text-[#f6e6c2] tabular-nums">
                {level}
              </p>
            </div>
            <div>
              <p className="text-[0.6rem] tracking-[0.16em] text-[#e4c36a]/80 uppercase">
                Best
              </p>
              <p className="font-mono text-sm text-[#f6e6c2] tabular-nums">
                {highScore}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={beginRun}
            className="font-bengali mt-8 min-w-44 rounded-sm border border-[#e4c36a] bg-[#9b1c1c] px-8 py-3 text-lg font-semibold tracking-wide text-[#f6e6c2] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition hover:bg-[#b32626] focus-visible:ring-2 focus-visible:ring-[#e4c36a] focus-visible:outline-none"
          >
            আবার খেলুন
          </button>
          <p className="mt-2 text-[0.65rem] tracking-[0.28em] text-[#e4c36a]/80 uppercase">
            Replay
          </p>
        </div>
      </div>
    </div>
  );
}
