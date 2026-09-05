"use client";

import { useEffect, useState } from "react";

import { beginFestivalRun, beginRun, beginSprintRun } from "@/lib/gameSession";
import { DIFFICULTY_PRESETS, SPRINT, type Difficulty } from "@/components/canvas/sceneConfig";
import { audio } from "@/lib/audio";
import {
  PLAYER_NAME_MAX,
  fetchLeaderboard,
  modeLabel,
  sanitizePlayerName,
  type LeaderboardEntry,
} from "@/lib/leaderboard";
import { useGameStore } from "@/store/useGameStore";

const DIFFICULTY_OPTIONS: Difficulty[] = ["easy", "medium", "hard"];

type MenuTab = "play" | "scores" | "settings";

function AlpanaCorner({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 88 88" className={className} aria-hidden fill="none">
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

function TabButton({
  id,
  label,
  bangla,
  active,
  onClick,
}: {
  id: MenuTab;
  label: string;
  bangla: string;
  active: boolean;
  onClick: (id: MenuTab) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={`flex min-w-0 flex-1 flex-col items-center rounded-sm border px-2 py-2 transition focus-visible:ring-2 focus-visible:ring-[#e4c36a] focus-visible:outline-none ${
        active
          ? "border-[#e4c36a] bg-[#9b1c1c] text-[#f6e6c2]"
          : "border-[#e4c36a]/35 bg-[#1a0c08]/55 text-[#e4c36a] hover:border-[#e4c36a]"
      }`}
    >
      <span className="font-bengali text-sm font-semibold">{bangla}</span>
      <span className="text-[0.55rem] tracking-[0.16em] uppercase">{label}</span>
    </button>
  );
}

function SectionTitle({ bangla, label }: { bangla: string; label: string }) {
  return (
    <div className="mb-3 text-center">
      <p className="font-bengali text-lg font-bold text-[#f6e6c2]">{bangla}</p>
      <p className="text-[0.6rem] tracking-[0.28em] text-[#e4c36a]/80 uppercase">
        {label}
      </p>
    </div>
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
  const musicMuted = useGameStore((state) => state.musicMuted);
  const sfxMuted = useGameStore((state) => state.sfxMuted);
  const graphicsQuality = useGameStore((state) => state.graphicsQuality);
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [tab, setTab] = useState<MenuTab>("play");

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
  }, [status, highScore, tab]);

  if (status !== "MENU") {
    return null;
  }

  const playDisabled = !assetsReady;

  return (
    <div className="pointer-events-auto absolute inset-0 z-20 touch-auto overflow-y-auto overscroll-contain bg-[#1a0c08]/92">
      <div className="mx-auto flex min-h-full w-full max-w-lg flex-col px-4 py-5 sm:py-8">
        <div className="relative overflow-hidden rounded-sm border border-[#e4c36a]/70 bg-linear-to-b from-[#4a1414] via-[#2a1a12] to-[#132416] px-5 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:px-8 sm:py-8">
          <div className="pointer-events-none absolute inset-3 border border-[#e4c36a]/35" />
          <AlpanaCorner className="pointer-events-none absolute top-2 left-2 h-12 w-12" />
          <AlpanaCorner className="pointer-events-none absolute top-2 right-2 h-12 w-12 rotate-90" />

          <header className="relative text-center">
            <p className="font-bengali text-[0.65rem] tracking-[0.32em] text-[#e4c36a] uppercase">
              পদ্মা · মেঘনা · যমুনা
            </p>
            <h1 className="font-bengali mt-2 text-4xl leading-tight font-bold text-[#f6e6c2] sm:text-5xl">
              নৌকা বাইচ
            </h1>
            <p className="mt-1 text-xs tracking-[0.36em] text-[#e4c36a] uppercase">
              Nouka Baich 3D
            </p>
            <p className="font-mono mt-3 text-sm tracking-[0.12em] text-[#f6e6c2]">
              Best {highScore.toLocaleString()}
            </p>
          </header>

          <nav
            className="relative mt-5 flex gap-2"
            aria-label="Menu sections"
          >
            <TabButton
              id="play"
              bangla="খেলুন"
              label="Play"
              active={tab === "play"}
              onClick={setTab}
            />
            <TabButton
              id="scores"
              bangla="স্কোর"
              label="Scores"
              active={tab === "scores"}
              onClick={setTab}
            />
            <TabButton
              id="settings"
              bangla="সেটিংস"
              label="Settings"
              active={tab === "settings"}
              onClick={setTab}
            />
          </nav>

          <div className="relative mt-5">
            {tab === "play" ? (
              <section>
                <SectionTitle bangla="দৌড় বেছে নিন" label="Choose a race" />
                <p
                  className="text-center text-[0.65rem] tracking-[0.18em] text-[#e4c36a]/90 uppercase"
                  aria-live="polite"
                >
                  {assetsReady
                    ? "Ready · river warmed"
                    : `Loading river · ${assetProgress}%`}
                </p>
                {!assetsReady ? (
                  <div
                    className="mx-auto mt-2 h-1 w-40 overflow-hidden rounded-sm bg-[#1a0c08]/70"
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

                <div className="mt-5 flex flex-col gap-2">
                  <p className="text-center text-[0.6rem] tracking-[0.24em] text-[#e4c36a]/80 uppercase">
                    Difficulty
                  </p>
                  <div className="flex justify-center gap-2">
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
                  <p className="text-center text-[0.58rem] tracking-[0.16em] text-[#e4c36a]/65 uppercase">
                    {DIFFICULTY_PRESETS[difficulty].labelEn}
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    type="button"
                    disabled={playDisabled}
                    onClick={() => beginFestivalRun()}
                    className="font-bengali w-full rounded-sm border border-[#e4c36a] bg-[#9b1c1c] px-6 py-3 text-lg font-semibold text-[#f6e6c2] transition hover:bg-[#b32626] focus-visible:ring-2 focus-visible:ring-[#e4c36a] focus-visible:outline-none disabled:cursor-wait disabled:opacity-55"
                  >
                    উৎসব হিট · ১০০সে
                  </button>
                  <p className="text-center text-[0.62rem] tracking-[0.16em] text-[#e4c36a]/80 uppercase">
                    Festival Heat · 100s score attack · kicks, passes, close calls
                  </p>
                  <button
                    type="button"
                    disabled={playDisabled}
                    onClick={() => beginRun()}
                    className="font-bengali w-full rounded-sm border border-[#e4c36a]/70 bg-[#1a0c08]/70 px-6 py-3 text-lg font-semibold text-[#f6e6c2] transition hover:border-[#e4c36a] focus-visible:ring-2 focus-visible:ring-[#e4c36a] focus-visible:outline-none disabled:cursor-wait disabled:opacity-55"
                  >
                    অনন্ত দৌড়
                  </button>
                  <p className="text-center text-[0.62rem] tracking-[0.16em] text-[#e4c36a]/80 uppercase">
                    Endless River · survive as far as you can
                  </p>
                  <button
                    type="button"
                    disabled={playDisabled}
                    onClick={() => beginSprintRun()}
                    className="font-bengali w-full rounded-sm border border-[#1f6b3a] bg-[#132416] px-6 py-3 text-lg font-semibold text-[#e4c36a] transition hover:border-[#e4c36a] focus-visible:ring-2 focus-visible:ring-[#e4c36a] focus-visible:outline-none disabled:cursor-wait disabled:opacity-55"
                  >
                    স্প্রিন্ট · {SPRINT.targetDistance}মি
                  </button>
                  <p className="text-center text-[0.62rem] tracking-[0.16em] text-[#e4c36a]/80 uppercase">
                    Sprint · reach the finish line
                  </p>
                </div>

                <p className="font-bengali mt-6 text-center text-sm leading-relaxed text-[#f0d9b0]/85">
                  কুড়াল দিয়ে কার্ট ভাঙো। পা দিয়ে অন্য নৌকা ঠেলো। ধাক্কা লাগলে ডুবে যাবে।
                </p>
                <p className="mt-2 text-center text-[0.62rem] tracking-[0.12em] text-[#e4c36a]/70 uppercase">
                  Q / E kick · collect orbs · hull hits sink you
                </p>
              </section>
            ) : null}

            {tab === "scores" ? (
              <section>
                <SectionTitle bangla="লিডারবোর্ড" label="Leaderboard" />
                <div className="rounded-sm border border-[#e4c36a]/45 bg-[#1a0c08]/50 px-4 py-3 text-center">
                  <p className="text-[0.6rem] tracking-[0.24em] text-[#e4c36a]/80 uppercase">
                    Your high score
                  </p>
                  <p className="font-mono mt-1 text-3xl font-semibold text-[#f6e6c2] tabular-nums">
                    {highScore.toLocaleString()}
                  </p>
                </div>

                <label className="mt-4 flex flex-col gap-1 text-left">
                  <span className="text-[0.6rem] tracking-[0.2em] text-[#e4c36a]/80 uppercase">
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

                <p className="mt-5 text-center text-[0.55rem] tracking-[0.16em] text-[#e4c36a]/65 uppercase">
                  Global · Festival · Endless · Sprint
                </p>
                {board.length === 0 ? (
                  <p className="mt-3 text-center text-[0.75rem] text-[#f0d9b0]/70">
                    No scores yet — take the river.
                  </p>
                ) : (
                  <ol className="mt-3 flex flex-col gap-1.5">
                    {board.map((entry, index) => (
                      <li
                        key={`${entry.name}-${entry.mode}-${entry.score}-${entry.at}`}
                        className="flex items-baseline justify-between gap-2 rounded-sm border border-[#e4c36a]/20 bg-[#1a0c08]/40 px-3 py-2 text-[#f6e6c2]"
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
              </section>
            ) : null}

            {tab === "settings" ? (
              <section>
                <SectionTitle bangla="সেটিংস" label="Settings" />
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const next = !musicMuted;
                      useGameStore.getState().setMusicMuted(next);
                      audio.setMusicMuted(next);
                    }}
                    className="flex w-full items-center justify-between rounded-sm border border-[#e4c36a]/35 bg-[#1a0c08]/40 px-4 py-3 text-left transition hover:border-[#e4c36a]/70"
                  >
                    <span>
                      <span className="font-bengali block text-sm text-[#f6e6c2]">
                        সঙ্গীত
                      </span>
                      <span className="text-[0.65rem] tracking-[0.18em] text-[#e4c36a]/80 uppercase">
                        Music
                      </span>
                    </span>
                    <span
                      className={`rounded-sm border px-3 py-1 text-[0.7rem] tracking-[0.16em] uppercase ${
                        !musicMuted
                          ? "border-[#e4c36a] bg-[#9b1c1c] text-[#f6e6c2]"
                          : "border-[#e4c36a]/40 text-[#e4c36a]/70"
                      }`}
                    >
                      {!musicMuted ? "On" : "Off"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !sfxMuted;
                      useGameStore.getState().setSfxMuted(next);
                      audio.setSfxMuted(next);
                    }}
                    className="flex w-full items-center justify-between rounded-sm border border-[#e4c36a]/35 bg-[#1a0c08]/40 px-4 py-3 text-left transition hover:border-[#e4c36a]/70"
                  >
                    <span>
                      <span className="font-bengali block text-sm text-[#f6e6c2]">
                        শব্দ
                      </span>
                      <span className="text-[0.65rem] tracking-[0.18em] text-[#e4c36a]/80 uppercase">
                        Sound FX
                      </span>
                    </span>
                    <span
                      className={`rounded-sm border px-3 py-1 text-[0.7rem] tracking-[0.16em] uppercase ${
                        !sfxMuted
                          ? "border-[#e4c36a] bg-[#9b1c1c] text-[#f6e6c2]"
                          : "border-[#e4c36a]/40 text-[#e4c36a]/70"
                      }`}
                    >
                      {!sfxMuted ? "On" : "Off"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = graphicsQuality === "high" ? "low" : "high";
                      useGameStore.getState().setGraphicsQuality(next);
                      useGameStore.getState().setAdaptiveLow(false);
                    }}
                    className="flex w-full items-center justify-between rounded-sm border border-[#e4c36a]/35 bg-[#1a0c08]/40 px-4 py-3 text-left transition hover:border-[#e4c36a]/70"
                  >
                    <span>
                      <span className="font-bengali block text-sm text-[#f6e6c2]">
                        উচ্চ গ্রাফিক্স
                      </span>
                      <span className="text-[0.65rem] tracking-[0.18em] text-[#e4c36a]/80 uppercase">
                        High Graphics
                      </span>
                    </span>
                    <span
                      className={`rounded-sm border px-3 py-1 text-[0.7rem] tracking-[0.16em] uppercase ${
                        graphicsQuality === "high"
                          ? "border-[#e4c36a] bg-[#9b1c1c] text-[#f6e6c2]"
                          : "border-[#e4c36a]/40 text-[#e4c36a]/70"
                      }`}
                    >
                      {graphicsQuality === "high" ? "On" : "Off"}
                    </span>
                  </button>
                </div>
                <p className="mt-4 text-center text-[0.6rem] tracking-[0.14em] text-[#e4c36a]/65 uppercase">
                  Difficulty lives on the Play tab
                </p>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
