"use client";

import { audio } from "@/lib/audio";
import { useGameStore } from "@/store/useGameStore";

function ToggleRow({
  label,
  bangla,
  on,
  onToggle,
}: {
  label: string;
  bangla: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-sm border border-[#e4c36a]/35 bg-[#1a0c08]/40 px-4 py-3 text-left transition hover:border-[#e4c36a]/70"
    >
      <span>
        <span className="font-bengali block text-sm text-[#f6e6c2]">{bangla}</span>
        <span className="text-[0.65rem] tracking-[0.18em] text-[#e4c36a]/80 uppercase">
          {label}
        </span>
      </span>
      <span
        className={`rounded-sm border px-3 py-1 text-[0.7rem] tracking-[0.16em] uppercase ${
          on
            ? "border-[#e4c36a] bg-[#9b1c1c] text-[#f6e6c2]"
            : "border-[#e4c36a]/40 text-[#e4c36a]/70"
        }`}
      >
        {on ? "On" : "Off"}
      </span>
    </button>
  );
}

export function SettingsModal() {
  const open = useGameStore((state) => state.settingsOpen);
  const musicMuted = useGameStore((state) => state.musicMuted);
  const sfxMuted = useGameStore((state) => state.sfxMuted);
  const graphicsQuality = useGameStore((state) => state.graphicsQuality);

  if (!open) {
    return null;
  }

  return (
    <div className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center bg-[#1a0c08]/70 px-4 backdrop-blur-[2px]">
      <div className="relative w-full max-w-sm rounded-sm border border-[#e4c36a]/70 bg-linear-to-b from-[#4a1414]/95 via-[#2a1a12]/96 to-[#132416]/95 px-6 py-7 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <p className="font-bengali text-center text-xl font-bold text-[#f6e6c2]">
          সেটিংস
        </p>
        <p className="mt-1 text-center text-[0.65rem] tracking-[0.28em] text-[#e4c36a]/80 uppercase">
          Settings
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <ToggleRow
            bangla="সঙ্গীত"
            label="Music"
            on={!musicMuted}
            onToggle={() => {
              const next = !musicMuted;
              useGameStore.getState().setMusicMuted(next);
              audio.setMusicMuted(next);
            }}
          />
          <ToggleRow
            bangla="শব্দ"
            label="Sound FX"
            on={!sfxMuted}
            onToggle={() => {
              const next = !sfxMuted;
              useGameStore.getState().setSfxMuted(next);
              audio.setSfxMuted(next);
            }}
          />
          <ToggleRow
            bangla="উচ্চ গ্রাফিক্স"
            label="High Graphics"
            on={graphicsQuality === "high"}
            onToggle={() => {
              const next = graphicsQuality === "high" ? "low" : "high";
              useGameStore.getState().setGraphicsQuality(next);
              useGameStore.getState().setAdaptiveLow(false);
            }}
          />
        </div>

        <button
          type="button"
          onClick={() => useGameStore.getState().setSettingsOpen(false)}
          className="font-bengali mt-6 w-full rounded-sm border border-[#e4c36a] bg-[#9b1c1c] px-4 py-2.5 font-semibold text-[#f6e6c2] transition hover:bg-[#b32626]"
        >
          বন্ধ করুন
        </button>
      </div>
    </div>
  );
}

export function SettingsButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => useGameStore.getState().setSettingsOpen(true)}
      className={`pointer-events-auto rounded-sm border border-[#e4c36a]/70 bg-[#1a0c08]/80 px-3 py-1.5 text-[0.65rem] tracking-[0.2em] text-[#e4c36a] uppercase transition hover:bg-[#9b1c1c] hover:text-[#f6e6c2] ${className}`}
    >
      Settings
    </button>
  );
}
