"use client";

import { useEffect, useState } from "react";

import { FESTIVAL } from "@/components/canvas/sceneConfig";
import { replayRun, returnToMenu } from "@/lib/gameSession";
import { heatGrade } from "@/lib/festivalScore";
import {
  fetchLeaderboard,
  submitLeaderboardScore,
  topForMode,
  type LeaderboardEntry,
} from "@/lib/leaderboard";
import { useGameStore } from "@/store/useGameStore";

const postedRuns = new Set<string>();

export function GameOverModal() {
  const status = useGameStore((state) => state.status);
  const runOutcome = useGameStore((state) => state.runOutcome);
  const gameMode = useGameStore((state) => state.gameMode);
  const score = useGameStore((state) => Math.floor(state.score));
  const highScore = useGameStore((state) => state.highScore);
  const festivalBest = useGameStore((state) => state.festivalBest);
  const distance = useGameStore((state) => Math.floor(state.distance));
  const level = useGameStore((state) => state.level);
  const heatTimeLeft = useGameStore((state) => state.heatTimeLeft);
  const isNewHighScore = useGameStore((state) => state.isNewHighScore);

  const [showCard, setShowCard] = useState(false);
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);

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
    }).then((entries) => {
      setBoard(entries);
    });
  }, [status, score, gameMode]);

  useEffect(() => {
    if (status !== "GAMEOVER") {
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
  }, [status, score]);

  if (status !== "GAMEOVER" || !showCard) {
    return null;
  }

  const finished = runOutcome === "finish";
  const festival = gameMode === "festival";
  const lasted = festival
    ? Math.max(0, Math.round(FESTIVAL.duration - heatTimeLeft))
    : 0;
  const grade = heatGrade(score, finished);
  const festivalBoard = topForMode(board, "festival", 5);
  const globalBest = festivalBoard[0]?.score ?? score;

  return (
    <div className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center overflow-y-auto bg-[#1a0c08]/60 px-4 py-6 backdrop-blur-[2px]">
      <div className="relative w-full max-w-md overflow-hidden rounded-sm border border-[#e4c36a]/70 bg-linear-to-b from-[#4a1414]/94 via-[#2a1a12]/95 to-[#132416]/94 px-8 py-9 shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:px-10">
        <div className="pointer-events-none absolute inset-3 border border-[#e4c36a]/30" />

        <div className="relative flex flex-col items-center text-center">
          <p className="font-bengali text-[0.7rem] tracking-[0.32em] text-[#e4c36a] uppercase">
            {festival
              ? "উৎসব হিট · ১০০সে"
              : finished
                ? "লক্ষ্য পূর্ণ"
                : "প্রতিযোগিতা শেষ"}
          </p>
          <h2 className="font-bengali mt-2 text-3xl font-bold text-[#f6e6c2]">
            {festival
              ? grade.bn
              : finished
                ? "ফিনিশ!"
                : "নৌকা ডুবেছে"}
          </h2>
          <p className="mt-1 text-[0.65rem] tracking-[0.32em] text-[#e4c36a]/80 uppercase">
            {festival
              ? grade.en
              : finished
                ? "Race Complete"
                : "Game Over"}
          </p>

          {isNewHighScore ? (
            <div className="mt-5 rounded-sm border border-[#e4c36a] bg-[#9b1c1c]/80 px-4 py-1.5 text-[0.7rem] tracking-[0.22em] text-[#f6e6c2] uppercase">
              নতুন সেরা · New Best
            </div>
          ) : null}

          <p className="font-bengali mt-6 text-sm text-[#e4c36a]">এই দৌড়</p>
          <p className="font-mono text-5xl font-semibold text-[#f6e6c2] tabular-nums">
            {score.toLocaleString()}
          </p>
          {festival ? (
            <p className="mt-2 text-[0.62rem] tracking-[0.18em] text-[#e4c36a]/75 uppercase">
              {finished
                ? `Lasted ${FESTIVAL.duration}s · +${FESTIVAL.surviveBonus} survive`
                : `Sank at ${lasted}s / ${FESTIVAL.duration}s`}
            </p>
          ) : null}

          {festival ? (
            <div className="mt-5 grid w-full grid-cols-2 gap-2 text-center">
              <div className="rounded-sm border border-[#e4c36a]/30 bg-[#1a0c08]/40 px-2 py-2">
                <p className="text-[0.55rem] tracking-[0.16em] text-[#e4c36a]/80 uppercase">
                  Your best
                </p>
                <p className="font-mono text-lg text-[#f6e6c2] tabular-nums">
                  {festivalBest.toLocaleString()}
                </p>
              </div>
              <div className="rounded-sm border border-[#e4c36a]/30 bg-[#1a0c08]/40 px-2 py-2">
                <p className="text-[0.55rem] tracking-[0.16em] text-[#e4c36a]/80 uppercase">
                  Global best
                </p>
                <p className="font-mono text-lg text-[#f6e6c2] tabular-nums">
                  {globalBest.toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
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
          )}

          {festival ? (
            <div className="mt-5 w-full text-left">
              <p className="text-center text-[0.55rem] tracking-[0.2em] text-[#e4c36a]/80 uppercase">
                Current top · Festival
              </p>
              {festivalBoard.length === 0 ? (
                <p className="mt-2 text-center text-[0.7rem] text-[#f0d9b0]/70">
                  First on the board.
                </p>
              ) : (
                <ol className="mt-2 flex flex-col gap-1">
                  {festivalBoard.map((entry, index) => (
                    <li
                      key={`${entry.name}-${entry.score}-${entry.at}`}
                      className="flex items-baseline justify-between gap-2 text-sm text-[#f6e6c2]"
                    >
                      <span className="min-w-0 truncate">
                        <span className="font-mono mr-2 text-[#e4c36a]/80 tabular-nums">
                          {index + 1}.
                        </span>
                        {entry.name}
                      </span>
                      <span className="font-mono shrink-0 tabular-nums">
                        {entry.score.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ) : null}

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
