"use client";

import { SettingsButton } from "@/components/ui/SettingsModal";
import { useGameStore } from "@/store/useGameStore";

type HudStatProps = {
  label: string;
  bangla: string;
  value: string;
};

function HudStat({ label, bangla, value }: HudStatProps) {
  return (
    <div className="flex min-w-0 flex-col items-center px-2 sm:px-3">
      <span className="font-bengali text-[0.6rem] leading-none text-[#e4c36a]/90">
        {bangla}
      </span>
      <span className="mt-1 text-[0.62rem] tracking-[0.18em] text-[#f6e6c2]/70 uppercase">
        {label}
      </span>
      <span className="mt-0.5 font-mono text-sm font-semibold text-[#f6e6c2] tabular-nums sm:text-base">
        {value}
      </span>
    </div>
  );
}

export function GameHud() {
  const status = useGameStore((state) => state.status);
  const speed = useGameStore((state) => Math.round(state.speed));
  const distance = useGameStore((state) => Math.floor(state.distance));
  const score = useGameStore((state) => Math.floor(state.score));
  const level = useGameStore((state) => state.level);
  const highScore = useGameStore((state) => state.highScore);

  if (status !== "PLAYING" && status !== "PAUSED") {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-3 pt-3 sm:px-5">
      <div className="mx-auto flex max-w-3xl items-stretch justify-between gap-1 rounded-sm border border-[#e4c36a]/55 bg-[#1a0c08]/72 px-2 py-2 shadow-[0_8px_28px_rgba(0,0,0,0.35)] backdrop-blur-[3px] sm:gap-2 sm:px-4">
        <HudStat bangla="স্কোর" label="Score" value={score.toLocaleString()} />
        <div className="w-px self-stretch bg-[#e4c36a]/25" />
        <HudStat bangla="গতি" label="Speed" value={`${speed}`} />
        <div className="w-px self-stretch bg-[#e4c36a]/25" />
        <HudStat bangla="দূরত্ব" label="Distance" value={`${distance}m`} />
        <div className="w-px self-stretch bg-[#e4c36a]/25" />
        <HudStat bangla="স্তর" label="Level" value={`${level}`} />
        <div className="w-px self-stretch bg-[#e4c36a]/25" />
        <HudStat bangla="সেরা" label="Best" value={highScore.toLocaleString()} />
        <div className="hidden items-center sm:flex">
          <SettingsButton />
        </div>
      </div>
      <div className="mt-2 flex justify-end sm:hidden">
        <SettingsButton />
      </div>
    </div>
  );
}
