"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, type ReactNode } from "react";
import { PCFShadowMap } from "three";

import { CollisionSystem } from "@/components/canvas/obstacles/CollisionSystem";
import { AssetWarmup } from "@/components/canvas/AssetWarmup";
import { ChaseCamera } from "@/components/canvas/ChaseCamera";
import { ProgressionSystem } from "@/components/canvas/ProgressionSystem";
import { QualityScaler } from "@/components/canvas/QualityScaler";
import { RaceSystem } from "@/components/canvas/RaceSystem";
import { ScoreEngine } from "@/components/canvas/ScoreEngine";
import { SfxSystem } from "@/components/canvas/SfxSystem";
import { BoatController } from "@/components/canvas/boat/BoatController";
import { PlaceholderBoat } from "@/components/canvas/boat/PlaceholderBoat";
import { PlayerBoat } from "@/components/canvas/boat/PlayerBoat";
import { SceneLighting } from "@/components/canvas/SceneLighting";
import { ScenePostProcessing } from "@/components/canvas/ScenePostProcessing";
import { WeatherSystem } from "@/components/canvas/WeatherSystem";
import { WaterWake } from "@/components/canvas/fx/WaterWake";
import { OarSplashes } from "@/components/canvas/fx/OarSplashes";
import { ScrollingWorld } from "@/components/canvas/world/ScrollingWorld";
import { getAtmosphere } from "@/components/canvas/sceneConfig";
import { useGameDpr } from "@/hooks/useGameDpr";
import { useGameStore } from "@/store/useGameStore";
import "@/lib/gltf";

type GameCanvasProps = {
  children?: ReactNode;
};

export function GameCanvas({ children }: GameCanvasProps) {
  const dpr = useGameDpr();
  const graphicsQuality = useGameStore((state) => state.graphicsQuality);
  const adaptiveLow = useGameStore((state) => state.adaptiveLow);
  const highFx = graphicsQuality === "high" && !adaptiveLow;

  return (
    <div className="absolute inset-0 h-full w-full touch-none bg-[#1a0c08]" data-game-canvas>
      <Canvas
        shadows={highFx ? { type: PCFShadowMap } : false}
        dpr={highFx ? dpr : [1, 1]}
        frameloop="always"
        gl={{
          antialias: highFx,
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
        onCreated={({ gl }) => {
          gl.setClearColor(getAtmosphere(1).horizon);
          gl.toneMappingExposure = 0.78;
        }}
      >
        <ChaseCamera />
        <SceneLighting />
        {/* Outside Suspense so progress updates while GLTFs stream in. */}
        <AssetWarmup />
        <Suspense fallback={null}>
          <ScrollingWorld />
          <BoatController>
            <Suspense fallback={<PlaceholderBoat />}>
              <PlayerBoat />
            </Suspense>
          </BoatController>
        </Suspense>
        <WeatherSystem />
        <WaterWake />
        <OarSplashes />
        <CollisionSystem />
        <SfxSystem />
        <ScoreEngine />
        <ProgressionSystem />
        <RaceSystem />
        <QualityScaler />
        <ScenePostProcessing enabled={highFx} />
        {children}
      </Canvas>
    </div>
  );
}
