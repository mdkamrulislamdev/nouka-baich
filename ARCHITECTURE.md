# Architecture

Nouka Baich 3D is a Next.js App Router client game. The 3D runtime is React Three Fiber; game state is Zustand.

## Layout

```
src/
  app/                 Next.js routes, fonts, PWA metadata
  store/               Zustand game store (status, score, assetsReady)
  hooks/               Input + DPR helpers
  lib/                 Pure systems (collision, audio, pools, GLTF utils)
  components/
    canvas/            WebGL scene (boat, world, FX, obstacles, weather)
    ui/                Menu, HUD, modals (DOM overlay)
public/
  models/              Only GLTFs that are referenced by sceneConfig / gltf.ts
  audio/ textures/     Runtime media
```

## Runtime loop

1. `page.tsx` mounts `GameCanvasLoader` immediately (not after Play).
2. `gltf.ts` preloads all `GLTF_ASSET_PATHS` at module load.
3. `AssetWarmup` reports Drei `useProgress` into the store; menu Play stays disabled until ready.
4. `useFrame` systems update obstacles (priority 0) then collision (priority 1).

## Scaling rules

- Prefer config in `sceneConfig.ts` over scattered magic numbers.
- Obstacles go through pools + `obstacleWorld` records (no per-frame React state).
- Instanced scenery uses `InstancedMesh`; avoid allocating inside `useFrame`.
- Keep docs here short; phase history lives in `PROJECT_STATUS.md` / specs.
