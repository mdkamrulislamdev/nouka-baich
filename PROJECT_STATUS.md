# Nouka Baich 3D — Project Status & Code Audit

**Date:** 19 August 2026  
**Spec:** `PROJECT_SPEC.md` (40 phases, 8 milestones)  
**Runtime check:** `npm run lint` pass, `tsc --noEmit` pass, `npm run build` pass, `npm run dev` serving the game at `http://localhost:3000` / `3001`.

This document maps what the 40-phase roadmap already covers, what is still thin or missing, and whether the current code is structured, reusable, and free of logic bugs.

---

## Verdict

All **40 roadmap phases are implemented and committed**. The game is a playable endless river racer: menu → steer → collide → game over → replay, with GLTF boat/palms/rocks, water shader, audio, HUD, settings, and persistence.

It is **not** feature-complete against the visual-fidelity mandate, and a few gameplay/logic gaps remain. Structure is generally good for this stage. The highest-value next work is polish and a small cleanup pass, not a rewrite.

| Area | Rating | Notes |
| --- | --- | --- |
| Roadmap coverage | Strong | Phases 1–40 exist in code and git |
| Playable loop | Strong | Start, steer, score, crash, replay all work |
| Visual fidelity | Partial | Water, fog, Environment yes; Bloom / Vignette / DoF missing |
| Coding practices | Good | Typed, no `any`, Zustand used off-render in `useFrame` |
| Scalability | Good with caveats | Object pools + instancing; boat texture is ~19 MB |
| Maintainability | Good | Clear folders; some duplication and unused exports |
| Bugs / logic | Mostly sound | Score formula and a few state-edge cases (below) |

---

## How to run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the next free port if 3000 is already taken).

Production check used for this audit:

```bash
npm run lint      # exit 0
npx tsc --noEmit  # exit 0
npm run build     # Next.js 16.3.1, `/` static, success
```

---

## Phase map (done vs could go further)

Status key: **Done** = matches the spec well · **Partial** = present but thinner than the spec · **Gap** = spec/mandate item still missing.

### Milestone 1 — Engine setup & architecture

| Phase | Item | Status | Notes |
| --- | --- | --- | --- |
| 1 | Next.js + TS + folders | **Done** | `src/components/canvas`, `ui`, `store`, `hooks`, `lib` |
| 2 | R3F canvas + DPR | **Done** | `GameCanvas` + `useGameDpr`; mobile DPR capped |
| 3 | Lighting + chase camera | **Done** | Directional sun, shadows, `ChaseCamera` |
| 4 | Placeholder longboat | **Done** | Still used as Suspense fallback |
| 5 | Zustand store | **Done** | `MENU` / `PLAYING` / `GAMEOVER` plus settings fields |

### Milestone 2 — Movement, input & physics

| Phase | Item | Status | Notes |
| --- | --- | --- | --- |
| 6 | Delta-time world scroll | **Done** | Segment recycle in `ScrollingWorld` |
| 7 | Keyboard A/D + arrows | **Done** | `useKeyboardSteering` |
| 8 | Touch / drag | **Done** | Pointer drag on `[data-game-canvas]` |
| 9 | River clamp | **Done** | `getLaneLimit()` + `clamp` |
| 10 | Tilt / yaw while turning | **Done** | Roll + yaw damped in `BoatController` |

### Milestone 3 — Environment & river

| Phase | Item | Status | Notes |
| --- | --- | --- | --- |
| 11 | Scrolling water | **Done** | `three-stdlib` `Water` + foam strips |
| 12 | Riverbanks & foliage | **Done** | Bank mesh + trees / huts / grass / palms |
| 13 | Object pooling | **Partial** | Pools pre-allocate; `release()` is unused (recycle via flags) |
| 14 | Fog + gradient sky | **Done** | `FogExp2` + level palettes (not true volumetric fog) |
| 15 | Instanced scenery | **Done** | Trees, huts, grass as `InstancedMesh` |

### Milestone 4 — Obstacles & collision

| Phase | Item | Status | Notes |
| --- | --- | --- | --- |
| 16 | Spawn coordinator | **Done** | Interval scales with level |
| 17 | AABB `Box3` | **Done** | Broadphase then `intersectsBox` |
| 18 | Rocks | **Done** | GLTF stylized rocks |
| 19 | Drifting logs | **Done** | Horizontal sine motion |
| 20 | Slow dinghy | **Done** | Procedural mesh, slower relative speed |

Extra (not in spec): floating **marker buoys** as a fourth obstacle kind.

### Milestone 5 — Game loop & UI

| Phase | Item | Status | Notes |
| --- | --- | --- | --- |
| 21 | Crash → GAMEOVER | **Done** | Stop world, tilt boat, crash SFX + shake |
| 22 | Distance & score | **Partial** | Score is recalculated from current speed, not accumulated (see bugs) |
| 23 | Level / speed scaling | **Done** | Every 500 m; spawn interval decays |
| 24 | Main menu | **Done** | Bengali motif, Start |
| 25 | HUD | **Done** | Speed, distance, level, best (no live score — spec did not require it) |
| 26 | Game over + replay | **Done** | New-best badge; no “back to menu” |

### Milestone 6 — Models & animation

| Phase | Item | Status | Notes |
| --- | --- | --- | --- |
| 27 | GLTF loader | **Done** | `src/lib/gltf.ts`, preload, Suspense |
| 28 | Nouka Baich mesh | **Partial** | Shetland fourareen stand-in, not a Bangladeshi racing nouka |
| 29 | Procedural oars | **Done** | Synced to speed via `rowingClock` |
| 30 | Wake particles | **Done** | GPU points + splash |

### Milestone 7 — Audio & immersion

| Phase | Item | Status | Notes |
| --- | --- | --- | --- |
| 31 | Howler manager | **Done** | `src/lib/audio.ts` |
| 32 | Folk BGM | **Done** | `/audio/folk-loop.wav` |
| 33 | Row / splash / crash SFX | **Done** | Plus near-miss |
| 34 | Camera shake | **Done** | Crash and near-miss |
| 35 | Settings | **Done** | Music, SFX, high/low graphics |

### Milestone 8 — Polish & production

| Phase | Item | Status | Notes |
| --- | --- | --- | --- |
| 36 | Adaptive quality | **Partial** | Drops to low under 30 FPS; never recovers until the user toggles graphics |
| 37 | Memory disposal | **Done** | Owned geos/materials disposed; GLTF clones intentionally not fully torn down |
| 38 | Mobile viewport | **Done** | `touch-action`, overscroll lock, orientation hint |
| 39 | localStorage | **Done** | High score + audio + graphics |
| 40 | Production build | **Done** | Lint + types + `next build` clean |

---

## Visual fidelity mandate (from `.cursorrules`)

| Mandate | Status |
| --- | --- |
| `@react-three/drei` `<Environment>` or skybox | **Done** — `Environment preset="sunset"` plus gradient sky |
| Volumetric fog | **Partial** — exponential fog only |
| Post-processing: Bloom, Vignette, Depth of Field | **Gap** — `@react-three/postprocessing` is not in `package.json` |
| Dynamic water (`Water` from `three-stdlib`, normals, Fresnel, foam) | **Done** |
| GLTF pipeline for boat / banks / obstacles | **Partial** — boat, palms, rocks are GLTF; banks and most obstacles are procedural |

---

## What could be done more

Ordered by impact, not by phase number.

1. **Post-processing stack** — Bloom on sun/water, vignette, light DoF. This is the largest missing visual item.
2. **Real Nouka Baich boat** — Replace the fourareen with a multi-seat Bangladeshi longboat; seats/oars should sit on the hull, not overlay a different boat.
3. **Compress the boat albedo** — `Material_25_baseColor.png` is ~19 MB. That hurts first load and low-end GPUs more than any gameplay system.
4. **Accumulate score correctly** (see bugs) and optionally show live score on the HUD.
5. **Pause while Settings is open** — collisions still run under the modal.
6. **Adaptive quality recovery** — sample real FPS (do not cap `delta` in the meter) and allow stepping back up after a few healthy seconds.
7. **Game over → menu** — replay exists; returning to `MENU` does not.
8. **True pool recycle** — call `ObjectPool.release` when obstacles go idle, or drop the unused pool API.
9. **Split Suspense** — water/banks should not wait on palm + rock GLTFs behind a brown `GltfFallback` box.
10. **Content depth** — more obstacle patterns, near-miss scoring, finish line / level-based races (spec allows endless *or* level-based).

---

## Architecture & maintainability

### Structure (good)

```
src/
  app/                 Next.js App Router
  store/useGameStore   Zustand + subscribeWithSelector
  hooks/               Input + DPR (no React state in the game loop)
  lib/                 Audio, collision, pools, persistence, dispose
  components/
    canvas/            R3F scene (boat, world, obstacles, fx)
    ui/                DOM overlays
```

Constants live in `sceneConfig.ts`. Session start is centralized in `beginRun()`. UI does not drive the render loop; systems read `useGameStore.getState()` inside `useFrame`.

### Practices that are already in good shape

- Strong TypeScript; **no `any`**.
- Game-loop reads avoid Zustand subscriptions, so HUD re-renders do not stall the boat.
- Shared factories for logs / dinghies / markers (geometry reused across pool instances).
- Persistence is versioned (`nouka-baich-3d:v1`) and validates JSON before applying.
- Client canvas is `dynamic(..., { ssr: false })`, which is the right Next.js 16 pattern for WebGL.
- Disposal helpers exist and are used for water, banks, and procedural obstacles.

### Scalability

**Works:** instanced trees/huts/grass, pooled palms/obstacles, DPR clamp, graphics + adaptive-low switches (shadows, antialias, wake emit rate).

**Limits:** one large boat texture; instanced scenery still **rewrites every instance matrix every frame** even on the menu; `QualityScaler` is one-way; rock `worldBox` is rebuilt with `setFromObject` per active rock per frame.

The project can grow (more obstacle kinds, more UI) without a rewrite. A second “mode” (timed race, two-player) would want a thinner store or slices so `useGameStore` does not become a god object.

---

## Redundancy and reuse

### Reuse that is already good

- `clamp`, `ObjectPool`, `dispose*`, `beginRun`
- Obstacle factories share geometry/material
- UI motif (gold/red/green overlays) is consistent across menu, HUD, game over, settings
- `useSteeringAxis` composes keyboard + pointer

### Redundant or unused (cleanup candidates)

| Item | Issue |
| --- | --- |
| `resetGame` | Defined on the store, never called (`beginRun` → `startGame`) |
| `PalmProp` | Component unused; only `preparePalm` is used |
| `getPlayerBox` / `getLastCollision` | Exported, unused |
| `resetRowingClock` | Exported, unused |
| `ObjectPool.release` / `forEachActive` | Unused |
| `seededRandom` | Copied in `ObstacleSpawner`, `PooledScenery`, `InstancedScenery` |
| `recycleZPosition` | Duplicated in scenery files |
| Canvas `camera` prop + `ChaseCamera makeDefault` | Two cameras; only the chase cam is used |
| Placeholder boat vs player boat seats | Two different seat layouts (`BoatInterior` vs `LongboatSeats`) |

None of these break the game. They are noise for the next person who reads the repo.

---

## Bugs and logic mismatches

No crashers showed up in lint, types, or production build. Runtime compiled and served `/` with HTTP 200. These are **logic / product mismatches**, not compile errors.

### 1. Score is not accumulated (real logic mismatch)

Spec: *“Accumulate score based on distance survived and speed multiplier.”*

`ScoreEngine` does:

```ts
nextScore = floor(distance * (speed / SCORE.referenceSpeed))
```

When level-up raises `speed`, **past meters are revalued**. A proper accumulate would be `score += deltaDistance * multiplier` each frame. Replay scores also jump at level boundaries more than distance alone would suggest.

### 2. Settings modal does not pause

`status` stays `PLAYING`. The player can crash into a rock while the settings overlay is open. Expected: freeze movement/collision or set a `PAUSED` status.

### 3. Adaptive low never recovers

Once FPS &lt; 30, `adaptiveLow` stays `true`. `startGame()` **keeps** that flag, so a hitch on run 1 permanently downgrades later runs until the user toggles High Graphics. The FPS sample also uses `Math.min(delta, 0.05)`, which **over-reports** FPS during real hitches (still usually trips the &lt; 30 check, but the meter is wrong).

### 4. World Suspense fallback hides the river

`ScrollingWorld` wraps water, banks, scenery, and obstacles in **one** `Suspense` whose fallback is a small brown box (`GltfFallback`). Until palm + rock + water-normal loads finish, banks and water are gone. The boat has its own fallback (good); the world should too.

### 5. `resetGame` vs `startGame` drift

`startGame` preserves `adaptiveLow`. `resetGame` does not. Only `startGame` is used, so this is latent, but it is a state-machine inconsistency if someone wires a “Menu” button to `resetGame`.

### 6. Lighting palette only half-follows the level

`GradientSky` lerps fog, sky, and hemisphere colors per level. `ambientLight` and `directionalLight` stay on the level-1 palette. Atmosphere changes look weaker than the data in `LEVEL_ATMOSPHERES` implies.

### 7. Collision length vs visible hull

`BOAT_BOUNDS.length` is 55% of `targetLength`. Hits can feel late (bow already overlapping a rock) or generous (stern). Intentional fairness tuning, but it is a gameplay mismatch worth playtesting.

### 8. Shader console noise

Dev log shows Three.js water-shader precision warnings (`X4122`, divide-by-zero). Common with `three-stdlib` `Water` on some GPUs; not a game-logic bug, but it clutters the console.

### What was checked and looks correct

- Lane clamp matches river width minus banks minus half-beam.
- Logs stay inside the river while oscillating.
- Dinghies move slower than the player (`speed - forwardSpeed`, min 2.2).
- Collision runs after obstacle `useFrame` updates (tree order in `GameCanvas`).
- New high score uses `score > highScore` (tie does not flash “new best”).
- Audio mute is applied from localStorage before Howls play.
- Keyboard steering clears on window blur; pointer is captured only on the canvas.

---

## Suggested next pass (if you want implementation after this audit)

1. Fix score accumulation and optionally show it on the HUD.  
2. Add `PAUSED` (or freeze systems) while settings are open.  
3. Add `@react-three/postprocessing` (Bloom, Vignette, light DoF) gated by graphics quality.  
4. Split world Suspense; delete unused exports; share `seededRandom`.  
5. Compress / retarget the player-boat texture; swap in a real nouka mesh when you have one.

The 40-phase roadmap itself can be treated as **closed**. Further work is polish, content, and the gaps above — not missing engine setup.
