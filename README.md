# Mahimur Rahman Khan — Interactive 3D World

An interactive 3D driving portfolio for **Mahimur Rahman Khan** (*Curious Mind | Creative Thinker | Future Explorer · Bangladesh*), built with **Three.js (`three/webgpu` + TSL)** for unified WebGPU/WebGL rendering, **Rapier3D** vehicle & world physics, and **Howler.js** spatial audio.

> *"Explore the Unknown. Imagine the Impossible. Shape the Future."*

---

## Quick Start

```bash
npm install
npm run dev
```

The development server starts on `http://localhost:3000`.

### Production Build & Syntax Check

```bash
npm run build
npm run lint
```

---

## Personal Content & Configuration

All personal information, Welcome copy, About Me bio, 9 Interests, Motto, Find Me Online links, Get in Touch copy, Copyright, and starter offline whispers live in:

- **`sources/data/portfolioConfig.js`**

---

## Active World & Architecture

- **Entry & Shell**: `sources/index.html`, `sources/index.js`, `sources/style/*.styl` (Stylus), `vite.config.js`
- **Orchestrator**: `sources/Game/Game.js`
- **Rendering & Shaders**: `sources/Game/Rendering.js`, `sources/Game/Materials/` (TSL node materials, procedural grass/foliage/water/sky/weather shaders, `WebGPURenderer` with automatic `WebGLBackend` fallback and software-rasterizer pixel-ratio/quality guard)
- **Physics & Vehicle**: `sources/Game/Physics/Physics.js`, `sources/Game/Physics/PhysicsVehicle.js`, `sources/Game/Player.js`, `sources/Game/World/Vehicle.js`
- **Camera & Inputs**: `sources/Game/View.js`, `sources/Game/Inputs/` (Keyboard/Mouse, virtual Touch joystick & touch action buttons, Gamepad)
- **Active 3D Areas**: `sources/Game/World/World.js` and `sources/Game/World/Areas/`
  - `LandingArea`: Interactive `MAHIMUR RAHMAN` 3D physics letters, map kiosk, controls kiosk, reset bonfire, dynamic physics bricks
  - `SocialArea`: Interactive 3D links for GitHub, LinkedIn, X, Linktree, and Email, plus statue
  - `CircuitArea`: Time-trial racing track with countdown lights, animated checkpoints, moving obstacles, podium, and `localStorage` leaderboard
  - `BowlingArea`, `CookieArea`, `AltarArea`, `ToiletArea`, `AchievementsArea`, `BehindTheSceneArea`
- **Audio & Music**: `sources/Game/Audio.js` (positional Howler.js SFX + 3-track interactive soundtrack)
- **UI & Overlays**: `sources/Game/Menu.js`, `sources/Game/Modals.js`, `sources/Game/Map.js` (`ui/map.svg` + day/night map views), `sources/Game/Notifications.js`

---

## Controls

| Action | Keyboard / Mouse | Touch | Gamepad |
| :--- | :--- | :--- | :--- |
| Drive / Steer | `WASD` or `Arrow Keys` | One-finger virtual joystick | Left Stick + `LT`/`RT` |
| Boost | `Shift` | — | `B` / Circle |
| Brake | `Left Ctrl` or `B` | — | `X` / Square |
| Jump | `Space` | Tap on car | `Y` / Triangle |
| Interact / Open | `Enter` | **Interact** touch button | `A` / Cross |
| Unstuck / Respawn | `R` | **Unstuck** touch button | — |
| Minimap | `M` | Map button | — |
| Leave Whisper | `T` | Menu → Whispers | — |
| Mute Audio | `L` | Options → Audio | — |
| Camera Orbit / Zoom | Left-click drag / Scroll | Two-finger drag / pinch | Right Stick |

---

## Deployment & Persistence

- **Static / Vercel Ready**: Build output in `dist/` deploys cleanly on Vercel without requiring a backend server.
- **Browser Persistence**: Circuit top-10 leaderboard scores and Whispers persist locally in `localStorage`.

---

## Copyright

© 2027 Mahimur Rahman Khan. All rights reserved.
