"use client";

import { useEffect, useRef } from "react";

import { getJuice } from "@/lib/actionJuice";
import { useGameStore } from "@/store/useGameStore";

export function HeatHud() {
  const status = useGameStore((state) => state.status);
  const slingshotFlash = useGameStore((state) => state.slingshotFlash);
  const overtakeFlash = useGameStore((state) => state.overtakeFlash);

  const gapRef = useRef<HTMLParagraphElement>(null);
  const draftRef = useRef<HTMLDivElement>(null);
  const goRef = useRef<HTMLDivElement>(null);
  const warnRef = useRef<HTMLDivElement>(null);

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
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (status !== "PLAYING" && status !== "PAUSED") {
    return null;
  }

  return (
    <>
      <div
        ref={goRef}
        className="pointer-events-none absolute top-20 right-3 z-20 opacity-0 sm:top-24 sm:right-6"
      >
        <p className="font-bengali text-2xl font-bold text-[#f6e6c2] drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)] sm:text-3xl">
          যাও!
        </p>
      </div>

      <div className="pointer-events-none absolute right-3 bottom-28 z-20 flex max-w-[32vw] flex-col items-end gap-1 sm:right-6 sm:bottom-32">
        <p
          ref={gapRef}
          className="font-bengali text-right text-[0.72rem] text-[#f6e6c2]/85"
        >
          নৌকা শিকার · কুঠার · হাতুড়ি
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
