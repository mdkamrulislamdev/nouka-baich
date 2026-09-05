"use client";

import { useEffect, useRef } from "react";

import { FESTIVAL } from "@/components/canvas/sceneConfig";
import { getJuice } from "@/lib/actionJuice";
import { getPowers } from "@/lib/powerUps";
import { useGameStore } from "@/store/useGameStore";

export function HeatHud() {
  const status = useGameStore((state) => state.status);
  const gameMode = useGameStore((state) => state.gameMode);
  const heatTimeLeft = useGameStore((state) => state.heatTimeLeft);
  const slingshotFlash = useGameStore((state) => state.slingshotFlash);
  const overtakeFlash = useGameStore((state) => state.overtakeFlash);
  const logBreakCharges = useGameStore((state) => state.logBreakCharges);

  const gapRef = useRef<HTMLParagraphElement>(null);
  const draftRef = useRef<HTMLDivElement>(null);
  const goRef = useRef<HTMLDivElement>(null);
  const warnRef = useRef<HTMLDivElement>(null);
  const hasteRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const ramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const juice = getJuice();
      if (gapRef.current) {
        if (juice.rivalGap > 0.4) {
          gapRef.current.textContent = `${juice.rivalNameEn} +${juice.rivalGap.toFixed(0)}m`;
        } else if (juice.rivalGap > 0) {
          gapRef.current.textContent = "NECK AND NECK";
        } else {
          gapRef.current.textContent = "TAKE THE LEAD";
        }
      }
      if (draftRef.current) {
        draftRef.current.style.opacity = juice.drafting ? "1" : "0";
        draftRef.current.textContent =
          juice.draftHeat >= 1 ? "SLINGSHOT — STEER OUT" : "DRAFTING";
      }
      if (goRef.current) {
        goRef.current.style.opacity = juice.runElapsed < juice.goUntil ? "1" : "0";
      }
      if (warnRef.current) {
        warnRef.current.style.opacity = juice.npcKickWarn ? "1" : "0";
      }
      const powers = getPowers();
      if (hasteRef.current) {
        hasteRef.current.style.opacity = powers.hasteLeft > 0 ? "1" : "0";
        hasteRef.current.textContent =
          powers.hasteLeft > 0 ? `SPEED+ · ${powers.hasteLeft.toFixed(1)}s` : "SPEED+";
      }
      if (dragRef.current) {
        dragRef.current.style.opacity = powers.dragLeft > 0 ? "1" : "0";
        dragRef.current.textContent =
          powers.dragLeft > 0 ? `SLOW · ${powers.dragLeft.toFixed(1)}s` : "SLOW";
      }
      if (ramRef.current) {
        ramRef.current.style.opacity = powers.ramLeft > 0 ? "1" : "0";
        ramRef.current.textContent =
          powers.ramLeft > 0
            ? `RAM MAX · ${powers.ramLeft.toFixed(1)}s`
            : "RAM";
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (status !== "PLAYING" && status !== "PAUSED") {
    return null;
  }

  const seconds = Math.ceil(heatTimeLeft);
  const urgent = gameMode === "festival" && seconds <= 15;

  return (
    <>
      <div
        ref={goRef}
        className="pointer-events-none absolute inset-x-0 top-[28%] z-20 flex justify-center opacity-0"
      >
        <p className="font-bengali text-6xl font-bold text-[#f6e6c2] drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)] sm:text-7xl">
          যাও!
        </p>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-28 z-20 flex flex-col items-center gap-1 px-4 sm:bottom-32">
        {gameMode === "festival" ? (
          <p
            className={`font-mono text-lg font-semibold tabular-nums ${
              urgent ? "text-[#ffb08a]" : "text-[#e4c36a]"
            }`}
          >
            {Math.max(0, seconds)}s · {FESTIVAL.duration}s heat
          </p>
        ) : null}
        <p
          ref={gapRef}
          className="text-[0.65rem] tracking-[0.22em] text-[#f6e6c2]/85 uppercase"
        >
          Hunt the boat ahead
        </p>
        <div
          ref={warnRef}
          className="rounded-sm border border-[#ff8a8a]/90 bg-[#9b1c1c]/90 px-3 py-1 text-[0.62rem] tracking-[0.18em] text-[#f6e6c2] uppercase opacity-0"
        >
          Incoming kick — steer away
        </div>
        <div
          ref={draftRef}
          className="rounded-sm border border-[#7ad0ff]/80 bg-[#0d3a4a]/85 px-3 py-1 text-[0.62rem] tracking-[0.22em] text-[#7ad0ff] uppercase opacity-0"
        >
          DRAFTING
        </div>
        <div
          ref={hasteRef}
          className="rounded-sm border border-[#3dffc0]/85 bg-[#06382c]/88 px-3 py-1 text-[0.62rem] tracking-[0.18em] text-[#7affd8] uppercase opacity-0"
        >
          SPEED+
        </div>
        <div
          ref={dragRef}
          className="rounded-sm border border-[#b47aff]/85 bg-[#2a1644]/88 px-3 py-1 text-[0.62rem] tracking-[0.18em] text-[#d4a6ff] uppercase opacity-0"
        >
          SLOW
        </div>
        <div
          ref={ramRef}
          className="rounded-sm border border-[#ff3d6e]/90 bg-[#4a1020]/90 px-3 py-1 text-[0.62rem] tracking-[0.18em] text-[#ff7a9a] uppercase opacity-0"
        >
          RAM
        </div>
        {logBreakCharges > 0 ? (
          <div className="rounded-sm border border-[#ffb347]/85 bg-[#6b2a08]/88 px-3 py-1 text-[0.62rem] tracking-[0.2em] text-[#ffd36a] uppercase">
            AXE · {logBreakCharges}
          </div>
        ) : null}
        {overtakeFlash > 0 ? (
          <span key={`o-${overtakeFlash}`} className="action-chip">
            Passed!
          </span>
        ) : null}
        {slingshotFlash > 0 ? (
          <span key={`s-${slingshotFlash}`} className="action-chip">
            Slingshot!
          </span>
        ) : null}
      </div>
    </>
  );
}
