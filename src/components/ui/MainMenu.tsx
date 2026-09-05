"use client";

import { useEffect, useState } from "react";

import { beginFestivalRun, beginRun, beginSprintRun } from "@/lib/gameSession";
import { DIFFICULTY_PRESETS, SPRINT, type Difficulty } from "@/components/canvas/sceneConfig";
import { SettingsButton } from "@/components/ui/SettingsModal";
import {
  PLAYER_NAME_MAX,
  fetchLeaderboard,
  modeLabel,
  sanitizePlayerName,
  type LeaderboardEntry,
} from "@/lib/leaderboard";
import { useGameStore } from "@/store/useGameStore";

const DIFFICULTY_OPTIONS: Difficulty[] = ["easy", "medium", "hard"];

function AlpanaCorner({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 88 88"
      className={className}
      aria-hidden
      fill="none"
    >
      <circle cx="18" cy="18" r="7" stroke="#e4c36a" strokeWidth="1.6" />
      <circle cx="18" cy="18" r="14" stroke="#e4c36a" strokeWidth="1.1" />
      <path
        d="M18 4v8M18 24v8M4 18h8M24 18h8"
        stroke="#e4c36a"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M32 8c18 4 40 18 48 48"
        stroke="#c5a24a"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="68" cy="20" r="3.2" fill="#1f6b3a" />
      <circle cx="20" cy="68" r="3.2" fill="#9b1c1c" />
    </svg>
  );
}

export function MainMenu() {
  const status = useGameStore((state) => state.status);
  const assetsReady = useGameStore((state) => state.assetsReady);
  const assetProgress = useGameStore((state) => state.assetProgress);
  const difficulty = useGameStore((state) => state.difficulty);
  const setDifficulty = useGameStore((state) => state.setDifficulty);
  const highScore = useGameStore((state) => state.highScore);
  const playerName = useGameStore((state) => state.playerName);
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (status !== "MENU") {
      return;
    }
    let cancelled = false;
    void fetchLeaderboard().then((entries) => {
      if (!cancelled) {
        setBoard(entries);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [status, highScore]);

  if (status !== "MENU") {
    return null;
  }

  const playDisabled = !assetsReady;

  return (
    <div className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center bg-[#1a0c08]/92 px-4">
      <div className="relative max-h-[92dvh] w-full max-w-lg overflow-y-auto overflow-x-hidden rounded-sm border border-[#e4c36a]/70 bg-linear-to-b from-[#4a1414] via-[#2a1a12] to-[#132416] px-8 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:px-12 sm:py-10">
        <div className="pointer-events-none absolute inset-3 border border-[#e4c36a]/35" />
        <div className="pointer-events-none absolute inset-5 border border-[#1f6b3a]/40" />

        <AlpanaCorner className="absolute top-2 left-2 h-16 w-16" />
        <AlpanaCorner className="absolute top-2 right-2 h-16 w-16 rotate-90" />
        <AlpanaCorner className="absolute bottom-2 left-2 h-16 w-16 -rotate-90" />
        <AlpanaCorner className="absolute right-2 bottom-2 h-16 w-16 rotate-180" />

        <div className="relative flex flex-col items-center text-center">
          <p className="font-bengali text-[0.7rem] tracking-[0.35em] text-[#e4c36a] uppercase">
            পদ্মা · মেঘনা · যমুনা
          </p>
          <h1 className="font-bengali mt-3 text-4xl leading-tight font-bold text-[#f6e6c2] sm:text-5xl">
            নৌকা বাইচ
          </h1>
          <p className="mt-2 text-xs tracking-[0.42em] text-[#e4c36a] uppercase">
            Nouka Baich 3D
          </p>
          <div className="mt-5 h-px w-24 bg-linear-to-r from-transparent via-[#e4c36a] to-transparent" />

          <div className="mt-5 w-full max-w-xs rounded-sm border border-[#e4c36a]/45 bg-[#1a0c08]/50 px-4 py-3">
            <p className="text-[0.6rem] tracking-[0.28em] text-[#e4c36a]/80 uppercase">
              High Score · সেরা
            </p>
            <p className="font-mono mt-1 text-3xl font-semibold text-[#f6e6c2] tabular-nums">
              {highScore.toLocaleString()}
            </p>
          </div>

          <label className="mt-4 flex w-full max-w-xs flex-col gap-1 text-left">
            <span className="text-[0.6rem] tracking-[0.22em] text-[#e4c36a]/80 uppercase">
              Rower name
            </span>
            <input
              type="text"
              maxLength={PLAYER_NAME_MAX}
              value={playerName}
              onChange={(event) =>
                useGameStore.getState().setPlayerName(event.target.value)
              }
              onBlur={() =>
                useGameStore
                  .getState()
                  .setPlayerName(sanitizePlayerName(playerName))
              }
              className="rounded-sm border border-[#e4c36a]/50 bg-[#1a0c08]/70 px-3 py-2 text-sm text-[#f6e6c2] outline-none focus-visible:ring-2 focus-visible:ring-[#e4c36a]"
              autoComplete="nickname"
              spellCheck={false}
            />
          </label>

          <div className="mt-4 w-full max-w-xs rounded-sm border border-[#e4c36a]/35 bg-[#1a0c08]/40 px-3 py-3 text-left">
            <p className="text-center text-[0.6rem] tracking-[0.22em] text-[#e4c36a]/85 uppercase">
              Global Leaderboard
            </p>
            <p className="mt-1 text-center text-[0.55rem] tracking-[0.14em] text-[#e4c36a]/60 uppercase">
              All modes · Festival · Endless · Sprint
            </p>
            {board.length === 0 ? (
              <p className="mt-3 text-center text-[0.7rem] text-[#f0d9b0]/70">
                No scores yet — take the river.
              </p>
            ) : (
              <ol className="mt-3 flex flex-col gap-1.5">
                {board.map((entry, index) => (
                  <li
                    key={`${entry.name}-${entry.mode}-${entry.score}-${entry.at}`}
                    className="flex items-baseline justify-between gap-2 text-[#f6e6c2]"
                  >
                    <span className="min-w-0 truncate text-sm">
                      <span className="font-mono mr-2 text-[#e4c36a]/80 tabular-nums">
                        {index + 1}.
                      </span>
                      {entry.name}
                      <span className="ml-1.5 text-[0.55rem] tracking-[0.12em] text-[#e4c36a]/65 uppercase">
                        {modeLabel(entry.mode)}
                      </span>
                    </span>
                    <span className="font-mono shrink-0 text-sm tabular-nums">
                      {entry.score.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <p className="font-bengali mt-5 max-w-xs text-sm leading-relaxed text-[#f0d9b0]/85">
            নদীর মাঝে শক্তি কুড়াও — কুড়াল দিয়ে কার্ট ভাঙো। পা দিয়ে অন্য নৌকা ঠেলো। ধাক্কা লাগলে ডুবে যাবে।
          </p>
          <p className="mt-2 max-w-xs text-[0.65rem] tracking-[0.14em] text-[#e4c36a]/75 uppercase">
            Grab axe orbs in open water to smash logs · kick with your feet · steer away when rivals kick back
          </p>

          <p
            className="mt-5 text-[0.65rem] tracking-[0.22em] text-[#e4c36a]/90 uppercase"
            aria-live="polite"
          >
            {assetsReady
              ? "Ready · river warmed"
              : `Loading river · ${assetProgress}%`}
          </p>
          {!assetsReady ? (
            <div
              className="mt-2 h-1 w-40 overflow-hidden rounded-sm bg-[#1a0c08]/70"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={assetProgress}
            >
              <div
                className="h-full bg-[#e4c36a] transition-[width] duration-200"
                style={{ width: `${assetProgress}%` }}
              />
            </div>
          ) : null}

          <div className="mt-6 flex flex-col items-center gap-2">
            <p className="text-[0.65rem] tracking-[0.28em] text-[#e4c36a]/80 uppercase">
              Difficulty
            </p>
            <div className="flex gap-2">
              {DIFFICULTY_OPTIONS.map((option) => {
                const preset = DIFFICULTY_PRESETS[option];
                const active = difficulty === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setDifficulty(option)}
                    className={`font-bengali rounded-sm border px-3 py-1.5 text-sm transition focus-visible:ring-2 focus-visible:ring-[#e4c36a] focus-visible:outline-none ${
                      active
                        ? "border-[#e4c36a] bg-[#9b1c1c] text-[#f6e6c2]"
                        : "border-[#e4c36a]/45 bg-[#1a0c08]/60 text-[#e4c36a]/85 hover:border-[#e4c36a]"
                    }`}
                  >
                    {preset.labelBn}
                  </button>
                );
              })}
            </div>
            <p className="text-[0.6rem] tracking-[0.18em] text-[#e4c36a]/65 uppercase">
              {DIFFICULTY_PRESETS[difficulty].labelEn}
            </p>
          </div>

          <div className="mt-8 flex w-full max-w-xs flex-col gap-3 sm:max-w-sm">
            <button
              type="button"
              disabled={playDisabled}
              onClick={() => beginFestivalRun()}
              className="font-bengali min-w-44 rounded-sm border border-[#e4c36a] bg-[#9b1c1c] px-8 py-3 text-lg font-semibold tracking-wide text-[#f6e6c2] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition hover:bg-[#b32626] focus-visible:ring-2 focus-visible:ring-[#e4c36a] focus-visible:outline-none disabled:cursor-wait disabled:opacity-55"
            >
              উৎসব হিট · ৯০সে
            </button>
            <p className="text-[0.65rem] tracking-[0.28em] text-[#e4c36a]/80 uppercase">
              Festival Heat · 90s podium
            </p>
            <button
              type="button"
              disabled={playDisabled}
              onClick={() => beginRun()}
              className="font-bengali min-w-44 rounded-sm border border-[#e4c36a]/70 bg-[#1a0c08]/70 px-8 py-3 text-lg font-semibold tracking-wide text-[#f6e6c2] transition hover:border-[#e4c36a] hover:bg-[#1a0c08]/90 focus-visible:ring-2 focus-visible:ring-[#e4c36a] focus-visible:outline-none disabled:cursor-wait disabled:opacity-55"
            >
              অনন্ত দৌড়
            </button>
            <p className="text-[0.65rem] tracking-[0.28em] text-[#e4c36a]/80 uppercase">
              Endless River
            </p>
            <button
              type="button"
              disabled={playDisabled}
              onClick={() => beginSprintRun()}
              className="font-bengali min-w-44 rounded-sm border border-[#1f6b3a] bg-[#132416] px-8 py-3 text-lg font-semibold tracking-wide text-[#e4c36a] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:border-[#e4c36a] hover:bg-[#1a3020] focus-visible:ring-2 focus-visible:ring-[#e4c36a] focus-visible:outline-none disabled:cursor-wait disabled:opacity-55"
            >
              স্প্রিন্ট · {SPRINT.targetDistance}মি
            </button>
            <p className="text-[0.65rem] tracking-[0.28em] text-[#e4c36a]/80 uppercase">
              Sprint to the Finish
            </p>
          </div>
          <SettingsButton className="mt-5" />
        </div>
      </div>
    </div>
  );
}
