# Nouka Baich 3D

A browser 3D boat racer inspired by Bangladeshi নৌকা বাইচ. You steer a longboat down a scrolling river, stack a fever combo, kick rival boats aside, and smash logs when you have axe charges. Hull contact with another boat or a rock/log/buoy sinks you.

Play at [http://localhost:3000](http://localhost:3000) after starting the dev server.

## Run

Requires **Node 22+**.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Wait until the menu shows **Ready · river warmed** before starting a heat.

Production check:

```bash
npm run lint
npx tsc --noEmit
npm run build
npm start
```

Deploy the Next.js app to Vercel (`vercel --prod`). Optional: `NEXT_PUBLIC_BOAT_MODEL_PATH=/models/your-boat/scene.gltf` to swap the player hull.

## Modes

| Mode | What happens |
| --- | --- |
| **Festival Heat** (90s) | Timed podium race against a packed rival field. Primary play button. |
| **Endless River** | Survive as density and weather scale with distance. |
| **Sprint** (480 m) | Reach the finish line. |

Difficulty (Easy / Medium / Hard) changes speed and spawn spacing.

## Controls

| Action | Keyboard | Touch |
| --- | --- | --- |
| Steer | A / D or ← / → | Drag left / right on the canvas |
| Kick left | Q or `,` | Left kick pad (glows when a target is in range) |
| Kick right | E or `.` | Right kick pad |
| Kick nearest | Space or K | Either pad |

Settings: music, SFX, high/low graphics. Pause while settings are open.

## How it plays

- **Hull hits are fatal.** Oars do not shove. Kick with your feet to knock nearby boats.
- **Axe orbs** spawn in a clear river corridor. Pickup grants **3 log-break charges**. Ram or kick a log while charged to shatter it (wood burst, score). At 0 charges, logs sink you again.
- **Gold bonus orbs** add score along the river.
- **Rival kicks:** when a boat winds up beside you, the banner reads “Incoming kick — steer away”. Steer out for **DODGED** + score; stay and they shove you (not a sink).
- **Fever combo** (x1–x8) multiplies distance score. Catch the stroke window (ring pulse) for a small boost. Draft in a rival’s wake, then steer out for a **slingshot**.
- Opening stretch is sparse (boat-collision grace, delayed hazards), then traffic densifies.

Fatal hazards: rocks, unmarked logs, marker buoys, hull-to-hull with another boat.

## Performance

The loop is built to stay off the React render path:

- Zustand reads inside `useFrame` (no per-frame React re-renders for physics).
- Obstacle / scenery object pools, recycled river segments.
- DPR capped (1–1.5 on phones, 1–2 on desktop).
- High graphics: bloom, vignette, depth of field. If FPS drops below ~26 after a short warmup, quality scales down for the rest of that run (does not remount the composer mid-race).
- Palms + huts only on the banks (64 palms). Unused tree/grass GLTFs are not loaded.

If a machine still stutters, switch **Graphics** to Low in settings.

## Stack

Next.js 16 (App Router) · React Three Fiber · Three.js · Zustand · Tailwind CSS · Howler.

## Repo layout

```
src/app/                 Routes, fonts, PWA metadata
src/store/               Game state
src/components/canvas/   WebGL scene, boat, river, obstacles, FX
src/components/ui/       Menu, HUD, toasts, settings
src/lib/                 Pools, combat, scoring, audio, GLTF helpers
public/models/           Runtime GLTFs (boat, palms, rocks, huts, rowers)
public/audio/            BGM + SFX
```

Local-only files (specs, WAV generators, unused tree/grass models) live in **`dev_env/`**. That folder is gitignored and must not be pushed to GitHub. See `dev_env/README.md` on your machine.
