# Nouka Baich 3D - Technical Specification & 40-Phase Roadmap

## 1. Project Overview
A fast, lightweight, high-performance 3D endless/level-based boat racing web game inspired by traditional Bangladeshi "Nouka Baich" and mechanics of "Traffic Tom".

## 2. Tech Stack
- **Framework:** Next.js 14+ (App Router, TypeScript)
- **3D Engine:** React Three Fiber (R3F), @react-three/drei, Three.js
- **State Management:** Zustand (decoupled from React renders)
- **Styling:** TailwindCSS
- **Physics/Math:** Three.js Vector3/Box3 (AABB Collision)
- **Audio:** Howler.js
- **Graphics Pipeline:** @react-three/postprocessing (for Bloom, Color Grading, Ambient Occlusion)
- **Materials:** PBR (Physically Based Rendering) standard materials with environment maps (HDRI).
- **Custom Shaders:** three-stdlib (for realistic flowing water with normal maps and sun reflections).

---

## 3. Detailed 40-Phase Implementation Plan

### Milestone 1: Engine Setup & Architecture
- **Phase 1: Project Initialization**
  - Run `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`.
  - Clean boilerplate files and set up initial directory structure (`src/components/canvas`, `src/components/ui`, `src/store`, `src/hooks`).
  - *Commit:* `chore: initialize nextjs typescript project`
- **Phase 2: R3F Canvas Setup**
  - Install `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three`.
  - Create responsive full-viewport `<GameCanvas>` with fixed aspect ratio / DPR handling for mobile.
  - *Commit:* `feat(canvas): setup react three fiber canvas container`
- **Phase 3: Scene Lighting & Fixed Camera**
  - Configure directional sunlight with shadow maps and warm ambient light.
  - Set up an isometric/third-person chase camera positioned behind the boat.
  - *Commit:* `feat(scene): add perspective camera and river lighting`
- **Phase 4: Low-Poly Placeholder Boat Geometry**
  - Build a composite Three.js geometry representing a traditional longboat shape (tapered hull).
  - *Commit:* `feat(boat): create modular placeholder boat mesh`
- **Phase 5: High-Performance Zustand Game Store**
  - Create `useGameStore` with states: `status` ('MENU' | 'PLAYING' | 'GAMEOVER'), `score`, `speed`, `laneOffset`, `level`.
  - *Commit:* `feat(store): configure zustand game state manager`

### Milestone 2: Movement, Input & Physics
- **Phase 6: Continuous Forward Motion System**
  - Implement world-streaming/scrolling logic inside `useFrame` loop without memory leaks.
  - *Commit:* `feat(engine): implement delta-time based continuous world scrolling`
- **Phase 7: PC Keyboard Controls**
  - Support Arrow keys & A/D with smooth lerping for horizontal steering.
  - *Commit:* `feat(input): add desktop keyboard steering with dampening`
- **Phase 8: Mobile Touch & Drag Controls**
  - Add pointer events / touch swipe listeners for responsive mobile/tablet handling.
  - *Commit:* `feat(input): add touch and drag controls for mobile screens`
- **Phase 9: River Boundary Clamping**
  - Restrict boat X-position strictly within the riverbank limits using math clamp.
  - *Commit:* `feat(physics): clamp boat movement to river boundaries`
- **Phase 10: Dynamic Turning Tilt (Juice)**
  - Rotate the boat along its Z-axis (roll) and Y-axis (yaw) dynamically while turning.
  - *Commit:* `feat(juice): add procedural tilt and roll animations during turns`

### Milestone 3: Environment & River Shaders
- **Phase 11: Scrolling River Surface**
  - Create a custom shader or repeating normal map texture for river water flow.
  - *Commit:* `feat(river): add animated scrolling water surface`
- **Phase 12: Procedural Riverbanks & Foliage**
  - Render left/right riverbanks with low-poly greenery.
  - *Commit:* `feat(env): add procedural riverbanks with bank geometry`
- **Phase 13: Object Pooling Engine for Scenery**
  - Implement an efficient object pooling class to recycle trees, palms, and village huts.
  - *Commit:* `feat(perf): implement object pool for environmental props`
- **Phase 14: Dynamic Sky & Atmospheric Fog**
  - Add exponential fog and gradient sky background that changes hue per level.
  - *Commit:* `feat(env): add atmospheric fog and gradient background`
- **Phase 15: Draw Call & Frustum Culling Optimization**
  - Merge static geometries using InstancedMesh for trees/grass.
  - *Commit:* `perf(render): convert scenery to instanced meshes`

### Milestone 4: Obstacles & Collision Detection
- **Phase 16: Spawning Coordinator**
  - Create an obstacle spawn manager that drops obstacles at calculated intervals ahead of player.
  - *Commit:* `feat(spawner): create procedural obstacle spawn manager`
- **Phase 17: AABB Box3 Collision System**
  - Implement high-speed bounding box intersection checks inside `useFrame`.
  - *Commit:* `feat(physics): implement Box3 collision detection loop`
- **Phase 18: Obstacle - River Rocks**
  - Add static rock obstacles with irregular bounding boxes.
  - *Commit:* `feat(obstacle): add static rock formations`
- **Phase 19: Obstacle - Drifting Logs**
  - Add horizontal oscillating log obstacles.
  - *Commit:* `feat(obstacle): add drifting wood log obstacles`
- **Phase 20: Obstacle - Slow Trawler / Dinghy**
  - Add slow-moving AI boats that move in the same direction as player.
  - *Commit:* `feat(obstacle): add civilian boat obstacles`

### Milestone 5: Game Loop & UI
- **Phase 21: Collision Resolution & Game Over State**
  - Stop movement on hit, trigger screen shake, transition Zustand status to 'GAMEOVER'.
  - *Commit:* `feat(loop): handle crash resolution and game over trigger`
- **Phase 22: Distance Meter & Score Engine**
  - Accumulate score based on distance survived and speed multiplier.
  - *Commit:* `feat(score): add real-time distance and score calculation`
- **Phase 23: Level Progression & Speed Scaling**
  - Increase target speed and spawn density every 500 meters.
  - *Commit:* `feat(progression): scale speed and obstacle frequency by level`
- **Phase 24: Tailwind Main Menu Overlay**
  - Design Play screen with traditional Bengali motif styling and Start button.
  - *Commit:* `feat(ui): create main menu start screen overlay`
- **Phase 25: In-Game HUD**
  - Build top bar displaying current Speed, Distance, Level, and High Score.
  - *Commit:* `feat(ui): implement real-time in-game HUD overlay`
- **Phase 26: Game Over Summary & Restart Modal**
  - Display final score, new high score badge, and instantaneous restart button.
  - *Commit:* `feat(ui): add game over modal with instant replay`

### Milestone 6: 3D Models & Procedural Animations
- **Phase 27: GLTF/GLB Asset Loader Setup**
  - Add `useGLTF` loader with Suspense fallback and preloading utilities.
  - *Commit:* `feat(assets): setup GLTF asset loader pipeline`
- **Phase 28: Traditional Nouka Baich Mesh Integration**
  - Replace placeholder boat with multi-seat longboat model.
  - *Commit:* `feat(models): integrate traditional nouka baich 3D model`
- **Phase 29: Procedural Oar Rowing Animation**
  - Animate oars pivoting back and forth in sync with game speed.
  - *Commit:* `feat(anim): add procedural rhythmic rowing animation`
- **Phase 30: Water Wake & Splash Particle System**
  - Create GPU point particles or animated sprites trailing behind boat.
  - *Commit:* `feat(fx): add dynamic water wake particle system`

### Milestone 7: Audio & Immersion
- **Phase 31: Howler.js Audio Engine**
  - Build centralized sound manager (`src/lib/audio.ts`) for BGM and SFX.
  - *Commit:* `feat(audio): setup sound manager with Howler.js`
- **Phase 32: Traditional Folk Background Track**
  - Add looping upbeat folk rhythm (Dhol / Sari Gan beats).
  - *Commit:* `feat(audio): integrate traditional background folk music`
- **Phase 33: Sound Effects (Rowing, Splash, Crash)**
  - Hook SFX to oar strokes, close-call dodges, and crashes.
  - *Commit:* `feat(audio): trigger dynamic sfx on gameplay events`
- **Phase 34: Screen Shake & Camera Impact Feedback**
  - Add camera shake on near-misses and collisions.
  - *Commit:* `feat(fx): add procedural camera shake on impact`
- **Phase 35: Settings Menu (Audio & Quality Toggles)**
  - Build modal for Mute Music, Mute SFX, and Low/High Graphics switch.
  - *Commit:* `feat(ui): add settings modal with audio and graphics toggles`

### Milestone 8: Polish, Scalability & Production
- **Phase 36: Dynamic FPS Monitoring & Quality Scaler**
  - Detect frame drops below 30 FPS and lower pixel ratio / disable shadows automatically.
  - *Commit:* `perf(engine): add adaptive performance scaler for low-end devices`
- **Phase 37: Memory Leak Audit**
  - Ensure all Three.js geometries, textures, and materials dispose properly on unmount.
  - *Commit:* `fix(memory): add resource disposal on component cleanup`
- **Phase 38: Mobile Viewport & Orientation Lock**
  - Optimize viewport meta, prevent accidental page scrolling/pull-to-refresh on touch devices.
  - *Commit:* `feat(mobile): enforce touch-action rules and responsive viewport`
- **Phase 39: LocalStorage Persistence (High Score & Settings)**
  - Persist user best scores and audio preferences across sessions.
  - *Commit:* `feat(storage): persist high scores and settings to local storage`
- **Phase 40: Production Build, Lint & Deployment Verification**
  - Run full Next.js production build (`npm run build`), verify zero TypeScript errors, clean unused files.
  - *Commit:* `chore: finalize production build readiness`