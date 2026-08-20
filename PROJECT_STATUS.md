# Nouka Baich 3D — Project Status & Code Audit

**Date:** 19 August 2026 (launch + post-launch enhancements)  
**Specs:** `PROJECT_SPEC.md` (40 phases) · `LAUNCH_SPEC.md` (20 phases, 41–60)  
**Runtime check:** `npm run lint` pass · `tsc --noEmit` pass · `npm run build` pass · `npm run dev` at `http://localhost:3000`

This document maps what is implemented, what the launch polish pass delivered, and what optional work remains.

---

## Verdict

All **40 core phases** and all **20 launch phases (41–60)** are complete. Post-launch quick wins and several medium-scope items are also implemented locally. The game supports **Endless** and **Sprint (1200 m)** modes, near-miss combo scoring, ground mist, GLTF drop-in pipelines for boat and riverbanks, PWA manifest, and deploy docs.

| Area | Rating | Notes |
| --- | --- | --- |
| Core roadmap (1–40) | **Complete** | Engine, gameplay, audio, UI, persistence |
| Launch polish (41–60) | **Complete** | Logic fixes, graphics pipeline, perf, content polish |
| Post-launch enhancements | **Complete** | See table below |
| Playable loop | **Strong** | Menu → mode pick → play → pause → score → finish/crash → replay/menu |
| Visual fidelity | **Strong** | Bloom, Vignette, DoF, ground mist, exponential fog |
| Coding practices | **Good** | Typed, no `any`, Zustand off-render in `useFrame` |
| Scalability | **Good** | Pools + instancing; compressed WebP textures |
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

Deploy: see `DEPLOY.md`. Asset checklist: see `ASSETS_NEEDED.md`.

---

## Post-launch enhancements — complete

| Item | Status | Notes |
| --- | --- | --- |
| GitHub push guide | **Done** | `DEPLOY.md` — fix `mdkamrulislamdev` vs `mkamrul9` auth |
| Vercel / CI config | **Done** | `vercel.json`, `.github/workflows/ci.yml` |
| Skip scenery updates on menu | **Done** | `InstancedScenery` matrix commit skip when idle |
| Compress palm/rock textures | **Done** | PNG → WebP in GLTF paths |
| Near-miss combo multiplier | **Done** | Up to 5× within 4 s; toast shows combo |
| Ground mist (volumetric-ish) | **Done** | `GroundMist.tsx` on high graphics |
| Sprint race mode | **Done** | 1200 m finish, HUD “To Finish”, victory modal |
| GLTF riverbank pipeline | **Done** | `RiverBankMesh` + `RIVERBANK_MODEL.enabled` flag |
| Boat env override | **Done** | `NEXT_PUBLIC_BOAT_MODEL_PATH` |
| PWA manifest | **Done** | `public/manifest.webmanifest`, SVG icon, layout metadata |
| Asset requirements doc | **Done** | `ASSETS_NEEDED.md` |

---
## Upgrade Spec (`UPGRADE_SPEC.md`) — phases 1–10 complete

| Phase | What you asked for | Status |
| --- | --- | --- |
| 1 | Organic subdivided riverbank geometry + shoreline trim | **Done** |
| 2 | Palm leaf alpha halos / transparency artifacts | **Done** |
| 3 | Instanced village huts + tropical foliage GLTFs | **Done** |
| 4 | Instanced grass tufts on riverbanks | **Done** |
| 5 | Replace seat cubes with 6 seated rowers | **Done** |
| 6 | Elliptical oar dip physics + rower lean sync | **Done** |
| 7 | Lateral water splash particles on oar strokes | **Done** |
| 8 | Seamless horizon sky + distance haze blending | **Done** |
| 9 | Procedural rain + thunder lightning engine | **Done** |
| 10 | Level-linked weather progression (L1..L4+) | **Done** |

---

## Launch roadmap (phases 41–60) — complete

All 20 launch phases remain **Done** (score HUD, pause, post-processing, texture compression, pools, near-miss scoring, collision tuning, etc.). See prior sections in git history for per-phase detail.

---

## Core roadmap (phases 1–40)

All **40 original phases remain Done**. Store states: `MENU` · `PLAYING` · `PAUSED` · `GAMEOVER`. Game modes: `endless` · `sprint`.

Still **Partial** until you supply art:

| Item | Status |
| --- | --- |
| Nouka Baich boat mesh | Shetland fourareen GLTF stand-in — drop-in path ready |
| Riverbank art | Procedural fallback; enable GLTF when asset added |
| True volumetric fog | Ground mist + `FogExp2` (not full ray-marched volume) |
| Native app wrapper | PWA only; Capacitor not started |

---

## Visual fidelity mandate (`.cursorrules`)

| Mandate | Status |
| --- | --- |
| `@react-three/drei` `<Environment>` or skybox | **Done** |
| Volumetric fog | **Partial** — ground mist + exponential fog |
| Post-processing: Bloom, Vignette, DoF | **Done** — gated by high graphics |
| Dynamic water (`Water`, normals, Fresnel, foam) | **Done** |
| GLTF pipeline | **Partial** — boat, palms, rocks loaded; banks/obstacles procedural |

---

## Architecture snapshot

```
src/
  app/                      Next.js App Router + PWA manifest link
  store/useGameStore        Zustand (score, pause, combo, gameMode, runOutcome)
  lib/                      gameplay, mathUtils, audio, collision, pools, gameSession
  components/
    canvas/                 R3F scene + RaceSystem + GroundMist + FinishLine
    ui/                     HUD, menu (2 modes), modals, toasts
public/
  manifest.webmanifest      Add-to-home-screen
  icons/icon.svg            PWA icon (replace with PNG for iOS polish)
```

Key helpers: `beginRun()`, `beginSprintRun()`, `replayRun()`, `returnToMenu()`, `finishRace()`, `triggerCloseCall()`.

---

## What you need to do next

### Your actions (no code)

1. **Push to GitHub** — authenticate as `mdkamrulislamdev` (see `DEPLOY.md`).
2. **Deploy to Vercel** — `vercel login` → `vercel --prod` for a public play URL.
3. **Bring assets** — see `ASSETS_NEEDED.md` (boat `.glb`, riverbank GLTF, PNG icons optional).

### Optional future code work

| Item | Blocker |
| --- | --- |
| Capacitor / Play Store wrapper | Store accounts + build pipeline |
| Timed tournament / multiplayer | Game design + netcode |
| Full ray-marched volumetric fog | GPU budget / art direction |
| Additional obstacle GLTFs | Art assets |

---

## Minor leftovers (non-blocking)

| Item | Notes |
| --- | --- |
| `PalmProp.tsx` filename | Contains `preparePalm` only (component removed) |
| Rock `worldBox` | Rebuilt per active rock per frame |
| PWA icons | SVG shipped; PNG 192/512 recommended for iOS |
| Water shader warnings | Mitigated; some GPU drivers may still log from `three-stdlib` |

---

## Resolved issues (audit trail)

Includes all phase 41–60 fixes plus: menu scenery perf skip, palm/rock WebP, near-miss combo, DoF startup blur, ground mist layer, sprint finish mode, riverbank GLTF pipeline, PWA manifest.

---

**Roadmap status: CLOSED (phases 1–60).** Remaining work is deployment, authentic art assets, and optional platform wrappers — not missing engine features.
