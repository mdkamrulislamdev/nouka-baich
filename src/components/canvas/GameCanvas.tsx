"use client";

import { Canvas } from "@react-three/fiber";
import { type ReactNode } from "react";

import { ChaseCamera } from "@/components/canvas/ChaseCamera";
import { SceneLighting } from "@/components/canvas/SceneLighting";
import { FOG } from "@/components/canvas/sceneConfig";
import { useGameDpr } from "@/hooks/useGameDpr";

type GameCanvasProps = {
  children?: ReactNode;
};

export function GameCanvas({ children }: GameCanvasProps) {
  const dpr = useGameDpr();

  return (
    <div className="absolute inset-0 h-full w-full">
      <Canvas
        shadows
        dpr={dpr}
        frameloop="always"
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
        }}
        resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
        style={{ display: "block", width: "100%", height: "100%" }}
        fallback={
          <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
            WebGL is required to play Nouka Baich 3D.
          </div>
        }
        onCreated={({ gl }) => {
          gl.setClearColor(FOG.color);
          gl.toneMappingExposure = 1.08;
        }}
      >
        <ChaseCamera />
        <SceneLighting />
        {children}
      </Canvas>
    </div>
  );
}
