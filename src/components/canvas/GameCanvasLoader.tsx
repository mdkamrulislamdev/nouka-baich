"use client";

import dynamic from "next/dynamic";

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
