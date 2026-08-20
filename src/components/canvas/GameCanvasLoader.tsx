"use client";

import dynamic from "next/dynamic";

// Kick GLTF preloads as soon as the client bundle parses (before Play).
import "@/lib/gltf";

/**
 * Client-only R3F canvas. Loaded on first paint so WebGL + models warm
 * while the player reads the menu — Play should not wait on cold compile.
 */
export const GameCanvasLoader = dynamic(
  () =>
    import("@/components/canvas/GameCanvas").then((mod) => mod.GameCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-background" aria-hidden />
    ),
  },
);
