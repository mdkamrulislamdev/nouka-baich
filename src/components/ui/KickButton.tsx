"use client";

import { requestKick, type KickIntent } from "@/lib/kickCombat";
import { useKickInput } from "@/hooks/useKickInput";
import { useGameStore } from "@/store/useGameStore";

function KickPad({
  side,
  armed,
  ready,
  bangla,
  label,
  hint,
}: {
  side: KickIntent;
  armed: boolean;
  ready: boolean;
  bangla: string;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={!ready}
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!ready) {
          return;
        }
        requestKick(side);
      }}
      className={`kick-button pointer-events-auto flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 shadow-[0_10px_28px_rgba(0,0,0,0.45)] backdrop-blur-[2px] transition focus-visible:ring-2 focus-visible:ring-[#e4c36a] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45 sm:h-24 sm:w-24 ${
        armed
          ? "kick-button-armed border-[#e4c36a] bg-[#9b1c1c]/92"
          : "border-[#e4c36a]/55 bg-[#1a0c08]/78"
      }`}
    >
      <span className="font-bengali text-lg font-bold text-[#f6e6c2] sm:text-xl">
        {bangla}
      </span>
      <span className="mt-0.5 text-[0.58rem] tracking-[0.18em] text-[#e4c36a] uppercase">
        {label}
      </span>
      <span className="mt-1 text-[0.5rem] tracking-[0.14em] text-[#f6e6c2]/70 uppercase">
        {armed ? "In range" : hint}
      </span>
    </button>
  );
}

export function KickButton() {
  useKickInput();

  const status = useGameStore((state) => state.status);
  const kickInRangeLeft = useGameStore((state) => state.kickInRangeLeft);
  const kickInRangeRight = useGameStore((state) => state.kickInRangeRight);
  const kickReady = useGameStore((state) => state.kickReady);

  if (status !== "PLAYING") {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-x-4 bottom-6 z-20 flex items-end justify-between sm:inset-x-8 sm:bottom-8">
      <KickPad
        side={-1}
        armed={kickInRangeLeft}
        ready={kickReady}
        bangla="বাম"
        label="Left Kick"
        hint="Q"
      />
      <KickPad
        side={1}
        armed={kickInRangeRight}
        ready={kickReady}
        bangla="ডান"
        label="Right Kick"
        hint="E"
      />
    </div>
  );
}
