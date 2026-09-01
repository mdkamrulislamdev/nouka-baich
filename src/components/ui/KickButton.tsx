"use client";

import { requestKick } from "@/lib/kickCombat";
import { useKickInput } from "@/hooks/useKickInput";
import { useGameStore } from "@/store/useGameStore";

export function KickButton() {
  useKickInput();

  const status = useGameStore((state) => state.status);
  const kickInRange = useGameStore((state) => state.kickInRange);
  const kickReady = useGameStore((state) => state.kickReady);

  if (status !== "PLAYING") {
    return null;
  }

  return (
    <div className="pointer-events-none absolute right-4 bottom-6 z-20 sm:right-8 sm:bottom-8">
      <button
        type="button"
        aria-label="Kick nearby boat"
        disabled={!kickReady}
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!kickReady) {
            return;
          }
          requestKick();
        }}
        className={`kick-button pointer-events-auto flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 shadow-[0_10px_28px_rgba(0,0,0,0.45)] backdrop-blur-[2px] transition focus-visible:ring-2 focus-visible:ring-[#e4c36a] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45 sm:h-28 sm:w-28 ${
          kickInRange
            ? "kick-button-armed border-[#e4c36a] bg-[#9b1c1c]/92"
            : "border-[#e4c36a]/55 bg-[#1a0c08]/78"
        }`}
      >
        <span className="font-bengali text-xl font-bold text-[#f6e6c2] sm:text-2xl">
          লাথি
        </span>
        <span className="mt-0.5 text-[0.62rem] tracking-[0.22em] text-[#e4c36a] uppercase">
          Kick
        </span>
        <span className="mt-1 text-[0.55rem] tracking-[0.16em] text-[#f6e6c2]/70 uppercase">
          {kickInRange ? "In range" : "Space / K"}
        </span>
      </button>
    </div>
  );
}
