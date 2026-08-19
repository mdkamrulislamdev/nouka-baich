# Nouka Baich 3D - Launch Polish & Visual Fidelity Specification

## Context
The core game (40 phases) is complete. We are now executing a 20-phase polish pass to fix logic bugs, implement professional post-processing (Bloom, DoF), optimize massive textures, and make the game launch-ready.

## Execution Rules
Execute ONLY the single phase requested by the user. Do not jump ahead. After generating code, verify build validity and run `git add` and `git commit` with semantic messages.

---

## The 20-Phase Launch Roadmap

### Milestone 9: Core Logic & UI Fixes
- **Phase 41: Score Accumulation Fix**
  - Refactor `ScoreEngine` (and `useGameStore`). Instead of recalculating score from current speed `(distance * speed)`, accumulate it frame-by-frame: `score += deltaDistance * multiplier`.
  - *Commit:* `fix(logic): accumulate score progressively to prevent level-up jumps`
- **Phase 42: Live Score HUD**
  - Update the in-game HUD to display the live accumulating score, formatted cleanly.
  - *Commit:* `feat(ui): add live score counter to in-game HUD`
- **Phase 43: Pause State for Settings**
  - Introduce a `PAUSED` status to `useGameStore`. When the Settings modal is open, freeze world movement, collision checks, and rowing animations.
  - *Commit:* `feat(state): pause game loop and collisions when settings are open`
- **Phase 44: Game Over -> Return to Menu**
  - Add a "Return to Main Menu" button to the Game Over modal. Wire it to reset the game state cleanly back to `MENU`.
  - *Commit:* `feat(ui): add return to menu flow from game over screen`
- **Phase 45: Adaptive Quality Recovery**
  - Fix the `QualityScaler`. Sample real FPS (do not cap delta). If FPS stays > 50 for 5 seconds after dropping to low quality, automatically recover back to high quality.
  - *Commit:* `feat(engine): allow adaptive quality to recover to high settings`

### Milestone 10: Visual Fidelity Pipeline
- **Phase 46: Install Post-Processing Stack**
  - Install `@react-three/postprocessing`. Wrap the main scene inside the `<GameCanvas>` with the `<EffectComposer>` component.
  - *Commit:* `chore(graphics): install and setup react-three-postprocessing`
- **Phase 47: Implement Bloom for Sun & Water**
  - Add `<Bloom>` to the EffectComposer. Tune the threshold and intensity so the sun and water reflections glow slightly without blowing out the image.
  - *Commit:* `feat(graphics): implement HDR bloom for water and sky highlights`
- **Phase 48: Implement Vignette & Depth of Field**
  - Add `<Vignette>` to darken screen edges, focusing player attention. Add a subtle `<DepthOfField>` focusing on the boat to blur the distant fog.
  - *Commit:* `feat(graphics): add vignette and subtle depth of field`
- **Phase 49: Graphics Toggle Integration**
  - Ensure the EffectComposer is COMPLETELY disabled/unmounted when the user selects "Low Graphics" in settings or when the Adaptive Scaler kicks in.
  - *Commit:* `perf(graphics): disable post-processing pipeline on low graphics mode`
- **Phase 50: Lighting & Sky Palette Sync**
  - Fix the lighting drift. Sync `ambientLight` and `directionalLight` colors/intensity to update dynamically alongside the `GradientSky` palettes per level.
  - *Commit:* `fix(graphics): sync global lighting colors with level atmosphere palettes`

### Milestone 11: Assets, Suspense & Performance
- **Phase 51: Texture Compression & Replacement**
  - (Manual step required by user: Replace the 19MB boat texture with a compressed WebP/JPEG version). Update the GLTF loader to point to the new, smaller asset.
  - *Commit:* `perf(assets): implement compressed textures for main boat`
- **Phase 52: Split Suspense Boundaries**
  - Remove the single massive Suspense wrapper in `ScrollingWorld`. Give the Water, Banks, and Obstacles their own localized Suspense boundaries so the river renders before palms load.
  - *Commit:* `perf(ux): split suspense boundaries for faster visual feedback`
- **Phase 53: Object Pool Cleanup**
  - Fix the object pool implementation. Ensure `ObjectPool.release` is actively called when obstacles scroll past the camera, properly resetting their matrix and flags.
  - *Commit:* `fix(memory): actively release unused obstacles back to object pool`
- **Phase 54: Remove Dead Code**
  - Audit and delete unused exports identified in the audit (`resetGame`, `PalmProp`, `getPlayerBox`, `getLastCollision`, `resetRowingClock`).
  - *Commit:* `chore(cleanup): remove unused exports and redundant components`
- **Phase 55: Consolidate Utilities**
  - Centralize `seededRandom` and `recycleZPosition` into a single `src/lib/mathUtils.ts` file and update all imports across scenery files.
  - *Commit:* `chore(cleanup): centralize math and random utilities`

### Milestone 12: Content Depth & Final Polish
- **Phase 56: Collision Box Tuning**
  - Adjust `BOAT_BOUNDS.length` from 55% to a more accurate ~80% of `targetLength` to prevent late/generous collision feelings.
  - *Commit:* `fix(physics): tune boat collision bounding box for fairer hits`
- **Phase 57: New Obstacle: Marker Buoys**
  - Implement a 4th obstacle type: tightly clustered floating marker buoys that force the player to thread the needle.
  - *Commit:* `feat(obstacle): add floating marker buoys cluster`
- **Phase 58: Near-Miss Scoring Mechanism**
  - Implement a raycast or expanded Box3 check. If the boat passes extremely close to an obstacle without hitting it, grant a flat bonus score and trigger a UI popup ("Close Call!").
  - *Commit:* `feat(gameplay): implement near-miss bonus scoring`
- **Phase 59: Shader Precision Fixes**
  - Address the Three.js water-shader divide-by-zero precision warnings by clamping delta values or tweaking the custom shader uniforms.
  - *Commit:* `fix(graphics): patch water shader precision warnings`
- **Phase 60: Final Launch Build & Audit**
  - Run `npm run build` and `tsc --noEmit` to verify a flawless production build. 
  - *Commit:* `chore: final launch polish and build verification`