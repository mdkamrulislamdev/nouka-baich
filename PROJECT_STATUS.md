# Nouka Baich 3D — Project Status & Code Audit

**Date:** 19 August 2026 (launch complete through phase 60)  
**Specs:** `PROJECT_SPEC.md` (40 phases) · `LAUNCH_SPEC.md` (20 phases, 41–60)  
**Runtime check:** `npm run lint` pass · `tsc --noEmit` pass · `npm run build` pass · `npm run dev` at `http://localhost:3000`

This document maps what is implemented, what the launch polish pass delivered, and what optional work remains after the 60-phase roadmap.

---

## Verdict

All **40 core phases** and all **20 launch phases (41–60)** are implemented and committed locally. The game is launch-ready as an endless river racer with post-processing, compressed assets, fixed logic bugs, near-miss scoring, tuned collision, and a verified production build.

| Area | Rating | Notes |
| --- | --- | --- |
| Core roadmap (1–40) | **Complete** | Engine, gameplay, audio, UI, persistence |
| Launch polish (41–60) | **Complete** | Logic fixes, graphics pipeline, perf, content polish |
| Playable loop | **Strong** | Menu → play → pause → score → crash → replay/menu |
| Visual fidelity | **Strong** | Bloom, Vignette, DoF, level-synced lighting; exponential fog only |
| Coding practices | **Good** | Typed, no `any`, Zustand off-render in `useFrame` |
| Scalability | **Good** | Pools + instancing; boat texture ~480 KB WebP |
| Remote sync | **Blocked** | Local commits ahead of `origin/main`; push needs correct GitHub account |

---

## How to run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production check:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

---

## Launch roadmap (phases 41–60) — complete

### Milestone 9 — Core logic & UI (41–45) ✅

| Phase | Item | Status |
| --- | --- | --- |
| 41 | Score accumulation | **Done** |
| 42 | Live score HUD | **Done** |
| 43 | Pause for settings | **Done** — `PAUSED` status |
| 44 | Game over → menu | **Done** |
| 45 | Adaptive quality recovery | **Done** |

### Milestone 10 — Visual fidelity (46–50) ✅

| Phase | Item | Status |
| --- | --- | --- |
| 46 | Post-processing stack | **Done** |
| 47 | Bloom | **Done** |
| 48 | Vignette + DoF | **Done** |
| 49 | Low-graphics toggle | **Done** |
| 50 | Lighting palette sync | **Done** |

**Extra fix:** DoF focus corrected to remove startup blur.

### Milestone 11 — Assets & performance (51–55) ✅

| Phase | Item | Status |
| --- | --- | --- |
| 51 | Texture compression | **Done** — PNG → WebP (~480 KB) |
| 52 | Split Suspense | **Done** |
| 53 | Object pool cleanup | **Done** — acquire/release lifecycle |
| 54 | Remove dead code | **Done** |
| 55 | Consolidate utilities | **Done** — `src/lib/mathUtils.ts` |

### Milestone 12 — Final polish (56–60) ✅

| Phase | Item | Status |
| --- | --- | --- |
| 56 | Collision box tuning | **Done** — hull hitbox 80% of `targetLength` |
| 57 | Marker buoy clusters | **Done** — 2–4 buoy patterns per spawn |
| 58 | Near-miss scoring | **Done** — +35 bonus + “Close Call!” toast |
| 59 | Shader precision fixes | **Done** — clamped delta/size, highp, foam UV guard |
| 60 | Final launch build | **Done** — lint/types/build pass; removed `GltfFallback` |

---

## Core roadmap (phases 1–40)

All **40 original phases remain Done**. Store states: `MENU` · `PLAYING` · `PAUSED` · `GAMEOVER`.

Still **Partial** from original long-term vision (not blocking launch):

| Item | Status |
| --- | --- |
| Nouka Baich boat mesh | Shetland fourareen GLTF stand-in — needs authentic Bangladeshi longboat asset |
| Volumetric fog | Exponential `FogExp2` only |
| GLTF coverage | Boat, palms, rocks are GLTF; banks and most obstacles procedural |

---

## Visual fidelity mandate (`.cursorrules`)

| Mandate | Status |
| --- | --- |
| `@react-three/drei` `<Environment>` or skybox | **Done** |
| Volumetric fog | **Partial** |
| Post-processing: Bloom, Vignette, DoF | **Done** — gated by high graphics |
| Dynamic water (`Water`, normals, Fresnel, foam) | **Done** |
| GLTF pipeline | **Partial** — core assets loaded via `useGLTF` |

---

## Architecture snapshot

```
src/
  app/                      Next.js App Router + CloseCallToast
  store/useGameStore        Zustand (score, pause, close-call flash)
  lib/                      gameplay, mathUtils, audio, collision, pools
  components/
    canvas/                 R3F scene + ScenePostProcessing
    ui/                     HUD, menu, modals, toasts
```

Key helpers: `beginRun()`, `returnToMenu()`, `isGameplayActive()`, `triggerCloseCall()`.

---

## What could be done next (optional, post-launch)

### High value, no new 3D assets

| Item | Effort | Notes |
| --- | --- | --- |
| **Deploy to Vercel / hosting** | Small | Static Next.js export or standard deploy |
| **Fix GitHub push** | Small | Authenticate as repo owner `mdkamrulislamdev` |
| **Skip scenery updates on menu** | Small | Perf: don't rewrite instanced matrices when idle |
| **Compress palm/rock textures** | Small | Further load-time wins |
| **Level-based race / finish line mode** | Medium | New game mode + UI |
| **Near-miss combo multiplier** | Small | Stack bonus for consecutive close calls |

### Needs external input or larger scope

| Item | Blocker |
| --- | --- |
| Authentic Nouka Baich 3D model | Custom `.glb` asset |
| True volumetric fog | Heavier shader / post stack |
| GLTF riverbanks | Art pipeline |
| Two-player / timed tournament | Game design + netcode or local split |
| Mobile app wrapper | Capacitor / PWA polish |

---

## Minor leftovers (non-blocking)

| Item | Notes |
| --- | --- |
| `PalmProp.tsx` filename | Contains `preparePalm` only (component removed) |
| Instanced scenery on menu | Still updates matrices every frame |
| Rock `worldBox` | Rebuilt per active rock per frame |
| Water shader warnings | Mitigated; some GPU drivers may still log from `three-stdlib` internals |

---

## Resolved issues (full audit trail)

| Issue | Fixed in |
| --- | --- |
| Score recalculated on level-up | Phase 41 |
| No live score HUD | Phase 42 |
| Settings did not pause | Phase 43 |
| No return to menu | Phase 44 |
| Adaptive quality one-way | Phase 45 |
| Missing post-processing | Phases 46–49 |
| Lighting stuck on level 1 | Phase 50 |
| 19 MB boat texture | Phase 51 |
| Suspense hid entire river | Phase 52 |
| Pool `release()` unused | Phase 53 |
| Dead exports / duplicated utils | Phases 54–55 |
| Unfair collision box | Phase 56 |
| Isolated marker buoys | Phase 57 |
| Near-miss audio only | Phase 58 |
| Water shader console noise | Phase 59 |
| Unused `GltfFallback` | Phase 60 |

---

## Suggested next session

The **60-phase roadmap (40 core + 20 launch) is complete**. Recommended next steps:

1. Fix GitHub credentials and **push** all local commits.  
2. **Deploy** to a public URL for playtesting.  
3. Source or commission a **real Nouka Baich boat** model when ready.  
4. Add a **finish-line / timed race** mode if you want beyond endless mode.

---

**Roadmap status: CLOSED (phases 1–60).** Further work is content, deployment, and optional enhancements — not missing engine features.
