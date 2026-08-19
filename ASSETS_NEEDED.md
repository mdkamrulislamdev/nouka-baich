# Assets Needed — Nouka Baich 3D

This list covers what **you** should provide to take the game from polished prototype to an authentic, production-quality experience. The engine already supports drop-in GLTF paths and env overrides.

---

## Critical (biggest visual impact)

### 1. Authentic Nouka Baich boat (`.glb` / `.gltf`)

**Why:** The player boat is still a Shetland fourareen stand-in. A real Nouka Baich longboat is the single highest-impact upgrade.

**Specs:**

| Property | Target |
| --- | --- |
| Format | GLTF 2.0 (`.glb` preferred) |
| Length | ~4.4 world units (matches `BOAT_MODEL.targetLength`) |
| Style | Multi-seat Bangladeshi racing longboat, narrow hull, raised gunwales |
| Textures | PBR (baseColor + normal; metallicRoughness optional) |
| Pivot | Centered on hull, bow facing **−Z** |
| Waterline | ~18% of hull height submerged (`BOAT_MODEL.waterlineRatio`) |
| Poly budget | ≤ 25k tris for mobile |

**How to install:**

1. Place files under `public/models/nouka-baich/` (e.g. `scene.gltf` + textures).
2. Either replace the default path in `sceneConfig.ts` or set in Vercel:

```env
NEXT_PUBLIC_BOAT_MODEL_PATH=/models/nouka-baich/scene.gltf
```

---

### 2. Riverbank environment (modular GLTF)

**Why:** Banks are procedural boxes today. Modular bank meshes will sell the Padma/Meghna/Jamuna setting.

**Specs:**

| Property | Target |
| --- | --- |
| Format | GLTF 2.0 |
| Segment width | ~3 m (`RIVERBANK_MODEL.targetWidth`) |
| Length | Tileable along **−Z** (match `WORLD_SCROLL.segmentLength` ≈ 42 m) |
| Side | One mesh mirrored for left/right banks |
| Content | Mud/grass slope, reeds, occasional roots — keep draw calls low |

**How to install:**

1. Add `public/models/riverbank/scene.gltf` (+ textures).
2. In `src/components/canvas/sceneConfig.ts`, set:

```ts
RIVERBANK_MODEL.enabled = true
```

The game falls back to procedural banks until this flag is enabled.

---

## Recommended (polish & load times)

### 3. PWA icons (PNG)

**Why:** The repo ships an SVG icon for quick “Add to Home Screen”. iOS and some Android launchers prefer PNG.

| File | Size |
| --- | --- |
| `public/icons/icon-192.png` | 192×192 |
| `public/icons/icon-512.png` | 512×512 |

Update `public/manifest.webmanifest` to reference these alongside the SVG.

### 4. Additional obstacle GLTFs (optional)

| Asset | Notes |
| --- | --- |
| Floating log cluster | Replace procedural log mesh |
| Dinghy / rival boat | Match `DINGHY_OBSTACLE` scale in `sceneConfig.ts` |
| Rock variants | 2–3 sizes for spawn variety |

### 5. Audio upgrades

| Asset | Format | Notes |
| --- | --- | --- |
| Bengali folk loop (BGM) | `.ogg` or `.wav` | Replace `/audio/folk-loop.wav` |
| Row / splash / crash / near-miss SFX | Short `.wav` | Keep under ~200 KB each |

---

## Deployment (your action, not art)

| Task | What to do |
| --- | --- |
| **GitHub push** | Sign in as `mdkamrulislamdev` — see `DEPLOY.md` |
| **Vercel deploy** | `vercel login` then `vercel --prod` from project root |
| **Boat override on Vercel** | Add `NEXT_PUBLIC_BOAT_MODEL_PATH` in project env settings |

---

## Nice-to-have (future milestones)

- **Sky HDRI** — sunset / monsoon variants per level
- **Village props** — ghats, flags, spectators for finish-line sprint mode
- **Localized UI strings** — full Bengali copy pass
- **Capacitor wrapper** — if you want App Store / Play Store builds beyond PWA

---

## Quick checklist before sending assets

- [ ] Model faces **−Z** (bow forward in game)
- [ ] Textures are **power-of-two** and compressed (WebP or KTX2)
- [ ] No embedded huge 4K textures (aim ≤ 2K per map)
- [ ] License allows commercial / public web use
- [ ] Test locally: drop in `public/models/…` and reload dev server

When you have files ready, share the `.glb` / folder or a download link and we can wire scale, waterline, and collision tuning.
