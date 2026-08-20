# Nouka Baich 3D - Visual & Gameplay Overhaul Specification (15 Phases)

## Context & Visual Audit Targets
1. **Natural Shoreline:** Replace straight riverbank planes with broken, jagged, segmented shorelines with height variations.
2. **Texture Fixes:** Fix white alpha halos on palm leaves by adjusting alphaTest, depthWrite, and transparent material flags.
3. **Asset Replacement:** Replace primitive cone trees with instanced GLTF models (foliage, village huts, grass tufts).
4. **Rowers & Oar Physics:** Replace brown cube seats with 6 animated/posed low-poly human models. Oar blades must dip into the water plane during strokes and emit lateral splash particles.
5. **Atmosphere & Sky:** Eliminate studio detachment with horizon fog blending, dynamic skydomes, and weather (rain/storms).
6. **Difficulty & Traffic:** Tighten Level 1 obstacle intervals, add moving NPC racing boats, and scale weather intensity.
7. **Performance:** Utilize `InstancedMesh`, lightweight particle buffers, and GLTF cloning to ensure smooth 60 FPS on low-end devices.

---

## 🗺️ 15-Phase Execution Plan

### Milestone 1: Organic Shoreline & Material Artifact Fixes
- **Phase 1: Procedural Natural Riverbank Geometry**
  - Replace the straight box/plane bank geometry with an extruded, subdivided mesh featuring undulating noise along the X and Y axes.
  - Add shoreline mud/sand trim layers between the water edge and the green grass bank.
  - *Commit:* `feat(env): create organic subdivided riverbank geometry with shoreline trim`

- **Phase 2: Alpha Masking & Texture Artifact Patching**
  - Fix white borders on palm tree leaves by setting `alphaTest = 0.5`, `transparent = false` (or `depthWrite = true`), and using `THREE.LinearFilter` or clamping wrap modes.
  - Eliminate mipmap edge bleeding on all foliage textures.
  - *Commit:* `fix(materials): eliminate white alpha halos on palm and foliage textures`

- **Phase 3: Instanced GLTF Foliage & Village Huts**
  - Replace geometric cone trees with real low-poly Bengali village assets (Banana trees, Banyan/Rain trees, Tin/Clay huts).
  - Use `THREE.InstancedMesh` with cached geometry/materials from `public/models/` to keep draw calls under 10.
  - *Commit:* `feat(scenery): load instanced village huts and tropical foliage models`

- **Phase 4: Low-Poly Grass Tufts & Ground Detailing**
  - Spawn randomized instanced grass blade clusters along the bank edges.
  - Implement distance-based frustum culling so off-screen foliage drops out of memory instantly.
  - *Commit:* `feat(scenery): add high-performance instanced grass tufts on riverbanks`

### Milestone 2: Animated Rowers, Oars & Splash Physics
- **Phase 5: 3D Human Rower Models (Replacing Cubes)**
  - Remove the 6 placeholder seat cubes from the boat hull.
  - Instantiate 6 low-poly human rower models seated along the hull (traditional lungi/vest attire).
  - *Commit:* `feat(boat): add 6 low-poly human rowers inside the racing hull`

- **Phase 6: True Rowing Arc & Water-Dipping Oar Mechanics**
  - Update `useFrame` oar rotational transform: calculate an elliptical stroke cycle where the oar pitch dips into the water on the backward pull ($Z < 0$) and lifts clear on the forward return ($Z > 0$).
  - Sync rower torso/arm tilt angles to match the oar pivot rhythm.
  - *Commit:* `feat(anim): implement elliptical dipping oar physics synchronized with rowers`

- **Phase 7: Lateral Water Splash Particle System**
  - Create a GPU particle emitter triggered when oar blades enter and push against the water.
  - Emit water spray diagonally outward from both the left and right sides of the boat hull.
  - *Commit:* `feat(fx): add dynamic lateral water splashes on oar strokes`

### Milestone 3: Atmospheric Skybox, Fog & Dynamic Weather
- **Phase 8: Horizon-Integrated Atmospheric Sky**
  - Replace the flat background wall with a hemisphere sky shader that dynamically matches the water's horizon color.
  - Add soft river mist/distance haze using matching `scene.fog` parameters so the river seamlessly fades into the sky.
  - *Commit:* `feat(sky): implement seamless horizon sky dome and distance fog blending`

- **Phase 9: Dynamic Weather Engine: Rain & Lightning**
  - Build a reusable, high-performance rain particle system (instanced line segments scrolling vertically).
  - Add periodic screen flash/directional light flickers for thunderstorm levels.
  - *Commit:* `feat(weather): add instanced rain particles and dynamic storm lightning`

- **Phase 10: Weather Progression Controller**
  - Wire weather states into the level progression (Level 1: Sunny Morning, Level 2: Golden Sunset, Level 3: Overcast Breeze, Level 4+: Heavy Monsoon Rain & Thunder).
  - *Commit:* `feat(progression): link weather transitions and lighting to level milestones`

### Milestone 4: Level Balancing, NPC Traffic & Final Polish
- **Phase 11: Level 1 Difficulty & Density Rebalance**
  - Tighten minimum and maximum spawn distances for rocks and logs in Level 1 (decrease initial gap from ~60m to ~25m).
  - Ensure clear lane-changing navigation gaps while maintaining active player engagement.
  - *Commit:* `tune(spawner): tighten Level 1 obstacle intervals for immediate engagement`

- **Phase 12: NPC Racing & Civilian River Traffic**
  - Add moving NPC boats (opposing Nouka Baich racing boats and slow fishing dinghies) moving along designated river lanes.
  - Include bounding boxes for NPC collisions and realistic forward/swaying motion.
  - *Commit:* `feat(traffic): spawn active NPC racing boats and civilian river obstacles`

- **Phase 13: Multi-Level Speed & Hazard Scaling Curve**
  - Implement a logarithmic scaling formula balancing boat velocity increase (+12% per level) alongside tighter hazard clustering and multi-obstacle lane blocks.
  - *Commit:* `feat(progression): implement balanced velocity and hazard density progression curves`

- **Phase 14: Mobile & Low-End GPU Optimization Pass**
  - Disable rain particle systems and post-processing passes automatically when `adaptiveLow` triggers.
  - Ensure all instanced matrices update in place without allocating new memory in `useFrame`.
  - *Commit:* `perf(engine): optimize instanced buffers and rain shaders for low-end mobile devices`

- **Phase 15: Full Integration, Type Checking & Build Verification**
  - Run `npx tsc --noEmit` and `npm run build` to confirm zero lint/type errors.
  - Verify seamless start-to-finish gameplay loop across all weather stages.
  - *Commit:* `chore: verify complete visual and gameplay overhaul build`