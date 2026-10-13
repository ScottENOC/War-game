# War-game

An original browser-based rank-and-flank battle prototype. The initial rules foundation is inspired by classic sixth-edition-style fantasy battles, with alternating movement activations as an explicit house rule.

## Run it

Open [index.html](./index.html) in a browser, or enable GitHub Pages for the repository and publish from the `main` branch.

## Current prototype

- Main menu, point-based army builder and blind deployment phase.
- Up to six player units, each with 5–30 models: swordsmen and archers.
- Optional unit champions and optional swordsman light armour, with per-unit and total army points.
- A simple AI opponent that currently mirrors the player's army list.
- Movement, charges, shooting, melee, morale, and visible dice results.
- Formation width can be changed during movement at a half-Move cost per file.
- Flank/rear charges record the engagement side, suppress the defender’s rank bonus when the attacker has Unit Strength 5+, and add the relevant combat-resolution bonus.
- In a one-on-one combat, surviving units turn to face each other between rounds; a flank-charged unit reforms one file wider, capped by the opponent’s frontage.
- Every unit can counter-charge an eligible front charge. A counter-charge brings both units into front-to-front combat; because both charged, they use actual Initiative rather than the +10 charging bonus.
- Units can flee from a declared charge, fleeing units can attempt rally tests, and the AI attempts to rally automatically.
- Movement activation and charge declarations.
- Melee and shooting hit rolls, Strength-versus-Toughness wounds, armour saves, rank bonus, combat result and Leadership-based break test.
- Visible dice results and battle log.

## Prototype simplifications

This is not a verbatim implementation of any published rulebook. It is a small, testable foundation with classic rank-and-flank mechanics. Alternating unit activations are deliberately borrowed as a design idea from modern digital wargames rather than matching the original sixth-edition turn sequence. Charge response coverage is still incomplete: the player can flee from a declared charge, but the AI does not yet choose reactions strategically. Charge arc and line-of-sight checks use simplified unit-footprint obstruction; this is an approximation rather than full tabletop wheel-and-align geometry. Fleeing/rally movement, pursuit choices, multi-unit combats, terrain and panic triggers still need more complete coverage.

Remaining work: full wheel-and-align charge geometry, pursuit choices and movement after break tests, robust flee/rally movement and panic triggers, multi-unit combats, terrain interactions, and more unit profiles and army rules. The between-round one-on-one facing/reform rule is an intentional house rule, not 6th-edition RAW. Keep rules logic separate from rendering as the project grows.

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


## Army building

- Main menu leads to an army builder before deployment.
- Up to six units; each has 5–30 models. Swordsmen cost 8 points per model, archers 10, champions +6 per unit, and optional swordsman light armour +1 per model.
- Army points are displayed per unit and in total; there is no points cap yet. The AI currently mirrors the selected roster as a placeholder.
- Light armour grants a 6+ save. Strength modifies armour saves: S4 −1, S5 −2, S6 −3, continuing by −1 per Strength above 3; a modified save worse than 6+ is impossible. See the [6th-edition armour-save modifier table](https://6th.whfb.app/shooting/armour-save-modifiers).


## Core hit and wound rules

The hit/wound resolver uses the sixth-edition Weapon Skill comparison, Ballistic Skill target number, Strength-versus-Toughness table, and Strength-modified armour saves. Melee natural 1s miss and natural 6s hit; shooting natural 1s always miss and 7+/8+/9+ shots use the 6th-edition follow-up-roll sequence, with 10+ impossible. Wounds against targets marked too tough by the table are impossible, rather than automatically receiving a 6+ chance. Armour saves of 1+ still fail on a natural 1.

Shooting modifiers are cumulative: long range −1, moving −1, Stand & Shoot −1, target charging −1, single character/skirmisher −1, soft cover −1, hard cover −2, and large target +1. Unit state exposes `largeTarget`, `singleCharacter`, `skirmisher`, and `cover` (`"soft"` or `"hard"`) for those situational rules. **The current battlefield has no terrain-placement or unit-tag controls yet**, so cover and large-target effects are rule-engine-supported but not yet selectable/automatically inferred in the UI. Character/skirmisher profiles are likewise not currently part of the army builder.
