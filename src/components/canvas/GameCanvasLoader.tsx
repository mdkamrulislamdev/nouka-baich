"use client";

import dynamic from "next/dynamic";

import { CanvasErrorBoundary } from "@/components/canvas/CanvasErrorBoundary";

// Kick GLTF preloads as soon as the client bundle parses (before Play).
import "@/lib/gltf";

const GameCanvasDynamic = dynamic(
  () =>
    import("@/components/canvas/GameCanvas").then((mod) => mod.GameCanvas),
  {
    ssr: false,
    loading: () => (
      <div
        className="absolute inset-0 bg-[#1a0c08]"
        aria-hidden
      />
    ),
  },
);

/**
 * Client-only R3F canvas. Loaded on first paint so WebGL + models warm
 * while the player reads the menu — Play should not wait on cold compile.
 * Error boundary keeps the DOM menu visible if WebGL throws.
 */
export function GameCanvasLoader() {
  return (
    <CanvasErrorBoundary>
      <GameCanvasDynamic />
    </CanvasErrorBoundary>
  );
}
