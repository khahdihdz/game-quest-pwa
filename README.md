# Empire Builder 3D

A small-scale modern city management simulation built as a browser game and installable Android PWA.

## Game modes
- **Campaign:** complete city-building objectives and collect rewards.
- **Sandbox:** build freely and shape your city.

## Gameplay
- Interactive 3D city rendered with Three.js.
- Orbit, rotate, zoom and inspect the city.
- Place residential, commercial, industrial and public-service buildings on a 9×9 city grid.
- Manage budget, population, happiness, employment, electricity, water and traffic.
- Advance simulation days, earn tax/business income and pay city upkeep.
- Complete missions and claim rewards.
- Rename your city and save progress locally in your browser.

## Controls
- Select a building in the right panel, then tap/click an empty tile.
- Drag the city view to orbit; use the controls to zoom and rotate.
- Switch to Inspect to view an existing building.
- Use Pause, Speed and Next Day to control simulation time.

## Run locally
Serve this folder over localhost, for example:
`python -m http.server 8080`, then open `http://localhost:8080`.

Three.js is loaded from jsDelivr, so the initial 3D engine load requires an internet connection. The PWA caches the app shell; offline 3D rendering depends on the browser cache having retained the Three.js module.

## GitHub Pages
Enable **Settings → Pages → GitHub Actions**. Every push to `main` runs validation and deploys the site.

Game URL: https://khahdihdz.github.io/game-quest-pwa/

## Save data and privacy
Game progress is stored locally in browser localStorage. No account or game server is required. Clearing browser site data also clears the local save.

## Credits
- Three.js for real-time 3D rendering.
- Built for web browsers and Android PWA installation.

## License
MIT
