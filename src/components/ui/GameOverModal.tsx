"use client";

import { useEffect, useState } from "react";

import { replayRun, returnToMenu } from "@/lib/gameSession";
import { submitLeaderboardScore } from "@/lib/leaderboard";
import { useGameStore } from "@/store/useGameStore";

const postedRuns = new Set<string>();

export function GameOverModal() {
  const status = useGameStore((state) => state.status);
  const runOutcome = useGameStore((state) => state.runOutcome);
  const gameMode = useGameStore((state) => state.gameMode);
  const podiumPlace = useGameStore((state) => state.podiumPlace);
  const score = useGameStore((state) => Math.floor(state.score));
  const highScore = useGameStore((state) => state.highScore);
  const distance = useGameStore((state) => Math.floor(state.distance));
  const level = useGameStore((state) => state.level);
  const isNewHighScore = useGameStore((state) => state.isNewHighScore);

  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    if (status !== "GAMEOVER") {
      return;
    }
    const delay = runOutcome === "crash" ? 900 : 200;
    const timer = window.setTimeout(() => {
      setShowCard(true);
    }, delay);
    return () => {
      window.clearTimeout(timer);
      setShowCard(false);
    };
  }, [status, runOutcome]);

  useEffect(() => {
    if (status !== "GAMEOVER") {
      return;
    }
    const state = useGameStore.getState();
    const finalScore = Math.floor(state.score);
    if (finalScore < 1) {
      return;
    }
    const key = `${state.gameMode}:${finalScore}:${Math.floor(state.distance)}:${state.level}:${state.runOutcome}`;
    if (postedRuns.has(key)) {
      return;
    }
    postedRuns.add(key);
    void submitLeaderboardScore({
      name: state.playerName,
      score: finalScore,
      mode: state.gameMode,
    });
  }, [status, score, gameMode]);

  if (status !== "GAMEOVER" || !showCard) {
    return null;
  }

  const finished = runOutcome === "finish";
  const festival = gameMode === "festival";
  const place = podiumPlace;
  const placeCopy =
    place === 1
      ? { bn: "স্বর্ণ", en: "1st · Gold" }
      : place === 2
        ? { bn: "রৌপ্য", en: "2nd · Silver" }
        : place === 3
          ? { bn: "ব্রোঞ্জ", en: "3rd · Bronze" }
          : { bn: "চতুর্থ", en: "4th" };

  return (
    <div className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center bg-[#1a0c08]/60 px-4 backdrop-blur-[2px]">
      <div className="relative w-full max-w-md overflow-hidden rounded-sm border border-[#e4c36a]/70 bg-linear-to-b from-[#4a1414]/94 via-[#2a1a12]/95 to-[#132416]/94 px-8 py-9 shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:px-10">
        <div className="pointer-events-none absolute inset-3 border border-[#e4c36a]/30" />

        <div className="relative flex flex-col items-center text-center">
          <p className="font-bengali text-[0.7rem] tracking-[0.32em] text-[#e4c36a] uppercase">
            {festival
              ? "উৎসব হিট"
              : finished
                ? "লক্ষ্য পূর্ণ"
                : "প্রতিযোগিতা শেষ"}
          </p>
          <h2 className="font-bengali mt-2 text-3xl font-bold text-[#f6e6c2]">
            {festival && finished
              ? placeCopy.bn
              : finished
                ? "ফিনিশ!"
                : "নৌকা ডুবেছে"}
          </h2>
          <p className="mt-1 text-[0.65rem] tracking-[0.32em] text-[#e4c36a]/80 uppercase">
            {festival && finished
              ? placeCopy.en
              : finished
                ? "Race Complete"
                : festival
                  ? "Sank · DNF"
                  : "Game Over"}
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
            onClick={replayRun}
            className="font-bengali mt-8 min-w-44 rounded-sm border border-[#e4c36a] bg-[#9b1c1c] px-8 py-3 text-lg font-semibold tracking-wide text-[#f6e6c2] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition hover:bg-[#b32626] focus-visible:ring-2 focus-visible:ring-[#e4c36a] focus-visible:outline-none"
          >
            {gameMode === "festival"
              ? "আবার হিট"
              : gameMode === "sprint"
                ? "আবার স্প্রিন্ট"
                : "আবার খেলুন"}
          </button>
          <p className="mt-2 text-[0.65rem] tracking-[0.28em] text-[#e4c36a]/80 uppercase">
            Replay
          </p>

          <button
            type="button"
            onClick={returnToMenu}
            className="font-bengali mt-5 min-w-44 rounded-sm border border-[#e4c36a]/55 bg-[#1a0c08]/60 px-8 py-2.5 text-base font-semibold tracking-wide text-[#e4c36a] transition hover:border-[#e4c36a] hover:bg-[#1a0c08]/90 focus-visible:ring-2 focus-visible:ring-[#e4c36a] focus-visible:outline-none"
          >
            মূল মেনু
          </button>
          <p className="mt-2 text-[0.65rem] tracking-[0.28em] text-[#e4c36a]/80 uppercase">
            Main Menu
          </p>
        </div>
      </div>
    </div>
  );
}
