# 4 Corners Selector 🎯

A fun, vibrant, and highly interactive full-screen **4 Corners Selector** designed for games, classrooms, youth groups, and activity facilitation. Spin the wheel to randomly select one of the four color-coded quadrants!

---

## ✨ Features

- **📺 Immersive Full-Screen Layout**: Colored quadrants fill the entire viewport width and height (`100vw`/`100vh`) with responsive scaling suited for TVs, smartboards, desktops, and mobile devices.
- **🏷️ Customizable Center Labels**: Change corner markings from Settings to display numbers (default `1`, `2`, `3`, `4`), emojis (e.g. `🍕`, `🎮`), letters, or words.
- **🎛️ Font Size Scaling**: Selectable text-scaling sizes (*Small*, *Normal*, *Large*, and *Super Size*) inside Settings to make sure labels fit correctly.
- **🔊 Pure Web Audio API Synth Sounds**: Synthesizes clicking sounds as the arrow sweeps past segment boundary lines, followed by a retro arcade victory arpeggio on landing. No external MP3 downloads required!
- **🎉 Dynamic Confetti Spark**: Canvas-based confetti particles burst outwards directly from the **center of the selected quadrant** on selection.
- **🌗 Selection Dimming Focus**: The non-selected blocks automatically dim and desaturate while the winning block glows and pulses to draw maximum focus.
- **⌨️ Keyboard Support**: Press the **Space bar** to spin the wheel! Automatically disabled while typing inside forms to prevent accidental triggers.
- **💾 Local Persistence**: Automatically saves custom corner configurations and logs selection logs (up to the last 50 spins) to `localStorage` with timestamps.

---

## 🛠️ Tech Stack

- **Structure**: Semantic HTML5
- **Styles**: Modern CSS3 (CSS Grid, HSL Colors, CSS custom variables, Flexbox centering, Clamp typography)
- **Logic**: Vanilla ES6 JavaScript (Canvas API, Web Audio API, LocalStorage API, requestAnimationFrame physics)
- **Dev Tool**: Vite (for local development server, instant hot-reloading, and production bundling)

---

## 🚀 How to Run Locally

### 1. Install Dependencies
Clone the repository and install the Vite dev server dependencies:
```bash
npm install
```

### 2. Start the Dev Server
Launch Vite:
```bash
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your web browser.

### 3. Build for Production
Bundle the optimized code into a static folder:
```bash
npm run build
```
Preview the built package:
```bash
npm run preview
```

---

## ⌨️ Controls & Shortcuts

- **SPIN Button / Click**: Click the central circle to spin.
- **Space bar**: Press space to trigger the spinner.
- **Corner Click**: Tap any corner block directly to trigger a confetti burst from that corner.
- **Header Actions**:
  - 🔊 **Speaker Icon**: Mute/unmute synthesized sounds.
  - ⚙️ **Gear Icon**: Configure labels and text scale.
  - 🕐 **Clock Icon**: View history log of past selections.
