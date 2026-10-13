# War-game

An original browser-based rank-and-flank battle prototype. The initial rules foundation is inspired by classic sixth-edition-style fantasy battles, with alternating movement activations as an explicit house rule.

## Run it

Open [index.html](./index.html) in a browser, or enable GitHub Pages for the repository and publish from the `main` branch.

## Current prototype

- One regiment per side: 20 identical swordsmen, five files wide.
- Empire-inspired player faction versus a simple AI opponent.
- Hand weapons only; no armour, standards, characters, shooting, magic, terrain or army construction yet.
- Movement activation and charge declarations.
- Melee attack rolls, wounds, rank bonus, combat result and Leadership-based break test.
- Visible dice results and battle log.

## Prototype simplifications

This is not a verbatim implementation of any published rulebook. It is a small, testable foundation with classic rank-and-flank mechanics. Alternating unit activations are deliberately borrowed as a design idea from modern digital wargames rather than matching the original sixth-edition turn sequence. Charge responses are currently simplified to Hold against the passive AI.

The engine should be expanded in small steps: accurate unit footprints and facing, charge response options, proper simultaneous combat resolution, fleeing/pursuit, then more unit profiles and army rules. Keep rules logic separate from rendering as the project grows.

## Development direction

Prioritise meaningful unit roles, positioning, flanks, ranks, and morale. Avoid making weak attacks universally effective against heavily armoured or very tough targets merely through volume of attacks.


## Code structure

The browser entry point is `index.html`, which loads `js/main.js` as an ES module and links `css/style.css`. No bundler is required for GitHub Pages.

- `GameEngine.js` — initialises the battle and connects the systems.
- `gameState.js` — creates the initial battle-state object.
- `factions.js` and `units.js` — faction profiles and starting unit instances.
- `movement.js` — unit footprints, distances, overlap checks and legal placement.
- `phases.js` — charge declarations and phase transitions.
- `ai.js` — AI activation priorities, target selection and movement decisions.
- `rules.js`, `shooting.js`, `combat.js` and `dice.js` — rules resolution and dice results. Attack dice are grouped by matching profiles; an optional champion replaces one rank-and-file model, with 2 melee attacks or +1 BS for archers. Hit, wound and save pools use the relevant WS/BS, Strength and target stats, while melee sequencing uses each unit’s Initiative.
- `rendering.js` — battlefield canvas drawing, including the blind-deployment view.
- `input.js` — pointer, touch, drag, pivot, pan, zoom and deployment placement handling.
- `ui.js` — unit cards, action controls and log/dice overlay controls.

- Deployment phase: the player places units in the left half by selecting a card and tapping a position; rotate in 15-degree increments without movement costs. The AI deploys in the right half but remains hidden until the player starts the battle. All player units must be placed before starting.

Keep gameplay rules independent of drawing and input. New actions should be routed through the same rules and state changes regardless of whether the player or AI initiates them. Continue making and testing changes on `development`; promote to `main` only after review.
