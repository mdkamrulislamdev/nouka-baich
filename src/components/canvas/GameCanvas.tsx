"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, type ReactNode, useEffect } from "react";
import { PCFShadowMap } from "three";

import { CollisionSystem } from "@/components/canvas/obstacles/CollisionSystem";
import { ChaseCamera } from "@/components/canvas/ChaseCamera";
import { ProgressionSystem } from "@/components/canvas/ProgressionSystem";
import { ScoreEngine } from "@/components/canvas/ScoreEngine";
import { BoatController } from "@/components/canvas/boat/BoatController";
import { PlayerBoat } from "@/components/canvas/boat/PlayerBoat";
import { PlaceholderBoat } from "@/components/canvas/boat/PlaceholderBoat";
import { SceneLighting } from "@/components/canvas/SceneLighting";
import { ScrollingWorld } from "@/components/canvas/world/ScrollingWorld";
import { CAMERA, getAtmosphere } from "@/components/canvas/sceneConfig";
import { useGameDpr } from "@/hooks/useGameDpr";
import { useGameStore } from "@/store/useGameStore";

type GameCanvasProps = {
  children?: ReactNode;
};

export function GameCanvas({ children }: GameCanvasProps) {
  const dpr = useGameDpr();

  useEffect(() => {
    useGameStore.getState().startGame();
  }, []);

  return (
    <div className="absolute inset-0 h-full w-full touch-none" data-game-canvas>
      <Canvas
        shadows={{ type: PCFShadowMap }}
        dpr={dpr}
        frameloop="always"
        camera={{
          fov: CAMERA.fov,
          near: CAMERA.near,
          far: CAMERA.far,
          position: CAMERA.position,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
        }}
        resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          touchAction: "none",
        }}
        fallback={
          <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
            WebGL is required to play Nouka Baich 3D.
          </div>
        }
        onCreated={({ gl, camera }) => {
          gl.setClearColor(getAtmosphere(1).horizon);
          gl.toneMappingExposure = 0.78;
          camera.lookAt(...CAMERA.lookAt);
        }}
      >
        <ChaseCamera />
        <SceneLighting />
        <ScrollingWorld />
        <BoatController>
          <Suspense fallback={<PlaceholderBoat />}>
            <PlayerBoat />
          </Suspense>
        </BoatController>
        <CollisionSystem />
        <ScoreEngine />
        <ProgressionSystem />
        {children}
      </Canvas>
    </div>
  );
}
