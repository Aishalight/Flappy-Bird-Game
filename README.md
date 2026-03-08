# Flappy-Bird-Game 🐦

A high-fidelity, retro-style recreation of the classic Flappy Bird, built entirely with **HTML5 Canvas**, **CSS3**, and **Vanilla JavaScript**. This version features smooth animations, persistent high scores, and responsive controls for both desktop and mobile.

## 🎮 Features
* **Frame-by-Frame Animation:** A custom 4-frame sprite animation system for the bird's flight.
* **Persistent High Score:** Uses `localStorage` to save your best score even if you refresh the browser.
* **Retro UI:** Integrated "Press Start 2P" Google Font for that authentic 8-bit arcade feel.
* **Collision Freeze:** The game "freezes" on impact, allowing you to see exactly where you hit the pipe before the Game Over screen appears.
* **Dynamic Audio:** Includes background music (BGM), wing flap sounds, hit effects, and falling sounds.

## 🕹️ How to Play
* **Desktop:** Press the **Spacebar**, **Arrow Up**, or **X** key to flap your wings.
* **Mobile:** Simply **Tap** the screen to jump.
* **Goal:** Navigate between the pipes without touching them or hitting the ground. Every pair of pipes passed earns you 1 point!

## 🛠️ Technical Details
* **Engine:** Custom `requestAnimationFrame` game loop running at 60 FPS.
* **Physics:** Simplified AABB (Axis-Aligned Bounding Box) collision detection.
* **State Management:** Distinct game states for `Menu`, `Playing`, and `GameOver`.

## 📸 Screenshots

[![Imgur](https://img.shields.io/badge/View_Gallery-Imgur-89ff00?style=for-the-badge&logo=imgur)](https://imgur.com/a/mqxl1fZ)


### 🗂️ Project Structure
```text
├── index.html      # Game structure and Canvas element
├── flappybird.css  # Styling and retro menu positioning
├── flappybird.js   # Main game logic, physics, and rendering
└── assets         # Bird sprites, pipe images, and SFX

