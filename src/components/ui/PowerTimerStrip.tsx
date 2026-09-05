"use client";

import { useEffect, useRef } from "react";

import { PICKUP_LABELS } from "@/lib/pickupLabels";
import { getPowers } from "@/lib/powerUps";
import { useGameStore } from "@/store/useGameStore";

function formatSeconds(value: number): string {
  return `${value.toFixed(1)}s`;
}

export function PowerTimerStrip() {
  const logBreakCharges = useGameStore((state) => state.logBreakCharges);
  const rockBreakCharges = useGameStore((state) => state.rockBreakCharges);

  const hasteRef = useRef<HTMLDivElement>(null);
  const hasteTimeRef = useRef<HTMLSpanElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragTimeRef = useRef<HTMLSpanElement>(null);
  const ramRef = useRef<HTMLDivElement>(null);
  const ramTimeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const powers = getPowers();
      if (hasteRef.current && hasteTimeRef.current) {
        const on = powers.hasteLeft > 0;
        hasteRef.current.style.display = on ? "flex" : "none";
        if (on) {
          hasteTimeRef.current.textContent = formatSeconds(powers.hasteLeft);
        }
      }
      if (dragRef.current && dragTimeRef.current) {
        const on = powers.dragLeft > 0;
        dragRef.current.style.display = on ? "flex" : "none";
        if (on) {
          dragTimeRef.current.textContent = formatSeconds(powers.dragLeft);
        }
      }
      if (ramRef.current && ramTimeRef.current) {
        const on = powers.ramLeft > 0;
        ramRef.current.style.display = on ? "flex" : "none";
        if (on) {
          ramTimeRef.current.textContent = formatSeconds(powers.ramLeft);
        }
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="mt-1.5 flex flex-wrap items-stretch justify-center gap-1.5">
      <div
        ref={ramRef}
        className="min-w-[5.2rem] flex-col items-center rounded-sm border border-[#ff3d6e]/90 bg-[#4a1020]/92 px-2 py-1"
        style={{ display: "none" }}
      >
        <span className="font-bengali text-[0.72rem] leading-none font-bold text-[#ff7a9a]">
          {PICKUP_LABELS.ram}
        </span>
        <span
          ref={ramTimeRef}
          className="font-mono text-lg font-bold leading-none text-[#ffd0da] tabular-nums"
        >
          0.0s
        </span>
      </div>
      <div
        ref={hasteRef}
        className="min-w-[4.6rem] flex-col items-center rounded-sm border border-[#3dffc0]/85 bg-[#06382c]/92 px-2 py-1"
        style={{ display: "none" }}
      >
        <span className="font-bengali text-[0.72rem] leading-none font-bold text-[#7affd8]">
          {PICKUP_LABELS.haste}
        </span>
        <span
          ref={hasteTimeRef}
          className="font-mono text-lg font-bold leading-none text-[#c8fff0] tabular-nums"
        >
          0.0s
        </span>
      </div>
      <div
        ref={dragRef}
        className="min-w-[4.6rem] flex-col items-center rounded-sm border border-[#b47aff]/85 bg-[#2a1644]/92 px-2 py-1"
        style={{ display: "none" }}
      >
        <span className="font-bengali text-[0.72rem] leading-none font-bold text-[#d4a6ff]">
          {PICKUP_LABELS.drag}
        </span>
        <span
          ref={dragTimeRef}
          className="font-mono text-lg font-bold leading-none text-[#eed9ff] tabular-nums"
        >
          0.0s
        </span>
      </div>
      {logBreakCharges > 0 ? (
        <div className="min-w-[4.6rem] flex flex-col items-center rounded-sm border border-[#ffb347]/85 bg-[#6b2a08]/92 px-2 py-1">
          <span className="font-bengali text-[0.72rem] leading-none font-bold text-[#ffd36a]">
            {PICKUP_LABELS.breaker}
          </span>
          <span className="font-mono text-lg font-bold leading-none text-[#ffe7b0] tabular-nums">
            {logBreakCharges}
          </span>
        </div>
      ) : null}
      {rockBreakCharges > 0 ? (
        <div className="min-w-[4.6rem] flex flex-col items-center rounded-sm border border-[#c5d0dc]/85 bg-[#243044]/92 px-2 py-1">
          <span className="font-bengali text-[0.72rem] leading-none font-bold text-[#c5d0dc]">
            {PICKUP_LABELS.crusher}
          </span>
          <span className="font-mono text-lg font-bold leading-none text-[#e8eef4] tabular-nums">
            {rockBreakCharges}
          </span>
        </div>
      ) : null}
    </div>
  );
}
