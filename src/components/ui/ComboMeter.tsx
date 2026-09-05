"use client";

import { useEffect, useRef } from "react";

import { getJuice } from "@/lib/actionJuice";
import { useGameStore } from "@/store/useGameStore";

export function ComboMeter() {
  const status = useGameStore((state) => state.status);
  const combo = useGameStore((state) => state.feverCombo);
  const barRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const juice = getJuice();
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${juice.feverHeat})`;
      }
      if (ringRef.current) {
        ringRef.current.style.opacity = juice.strokeHot ? "1" : "0.28";
        ringRef.current.style.transform = juice.strokeHot
          ? "scale(1.08)"
          : "scale(1)";
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (status !== "PLAYING" && status !== "PAUSED") {
    return null;
  }

  const hot = combo >= 4;

  return (
    <div className="pointer-events-none absolute top-24 left-3 z-20 sm:top-28 sm:left-5">
      <div className="flex flex-col items-start">
        <div
          ref={ringRef}
          className="stroke-beat flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 border-[#e4c36a] bg-[#1a0c08]/78 shadow-[0_8px_28px_rgba(0,0,0,0.4)]"
        >
          <span className="text-[0.58rem] tracking-[0.22em] text-[#e4c36a] uppercase">
            Fever
          </span>
          <span
            className={`font-mono text-3xl font-bold tabular-nums ${
              hot ? "text-[#ffd36a]" : "text-[#f6e6c2]"
            }`}
          >
            x{combo}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-sm bg-[#1a0c08]/70">
          <div
            ref={barRef}
            className="h-full origin-left bg-linear-to-r from-[#9b1c1c] to-[#e4c36a]"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
        <p className="mt-1 text-[0.55rem] tracking-[0.2em] text-[#e4c36a]/80 uppercase">
          Tap oars on the catch
        </p>
      </div>
    </div>
  );
}
