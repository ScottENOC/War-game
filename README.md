# War-game

An original browser-based rank-and-flank battle prototype. The initial rules foundation is inspired by classic sixth-edition-style fantasy battles, with alternating movement activations as an explicit house rule.

## Run it

Open [index.html](./index.html) in a browser, or enable GitHub Pages for the repository and publish from the `main` branch.

## Current prototype

- Main menu, point-based army builder and blind deployment phase.
- Up to six player entries: swordsmen and archers (5–30 models each), cavalry (5–15 models), plus a human Captain hero or an Empire General (Lord). Cavalry cost 16 points per model and use 25×50 mm bases (infantry use 20×20 mm), Move 8, and one WS3 S3 I3 A1 horse attack per model. Cavalry begin with sword, light armour and an unbarded horse; the mount improves armour saves by 1, and barding improves them by a further 1 while reducing Move to 7. Cavalry may upgrade bows, heavy armour, barding or a great weapon for +2/model, or a spear for +1/model or lance for +2/model. Spears grant +1 Strength and lances +2 Strength on the charge only; neither adds a fighting rank. Characters can buy a horse for +8 points and, when mounted, a spear (+2), lance (+4), or barding (+4). Mounted characters may join cavalry only; unmounted characters may join infantry only. Swordsmen can buy spears for +1 point per model; spear-armed infantry fight in an extra rank.
- Optional unit champions and optional swordsman light armour, with per-unit and total army points. Captains and Generals start in light armour; heavy armour costs +4 points and improves the save from 6+ to 5+. Heavy armour does not reduce mounted characters’ Move. The 80-point Empire General (M4 WS5 BS5 S4 T4 W3 I5 A3 Ld9) can buy a halberd (+1 Strength, two-handed) or great weapon (+2 Strength, −10 Initiative, two-handed) for +4 points. After melee resolves, the Captain can cycle between hand weapon, halberd and great weapon for the next combat.
- A simple AI opponent that currently mirrors the player's army list.
- Movement, charges, shooting, melee, morale, and visible dice results.
- Each unit that charges or counter-charges receives +10 Initiative for that combat round, independently of other units in the fight. Units that did not charge use their normal Initiative. Within an Initiative level, attack packets resolve sequentially as a digital house rule so casualties can expose the next defender tier. A combatant killed before its own packet is entitled to a last attack, cannot be targeted while delayed, and dies immediately after striking. For rank-and-file, the game snapshots the number of models in the fighting front rank at the start of that Initiative step: those models can still contribute their attacks if killed before the regiment's packet, but rear ranks do not gain attacks they were not entitled to make.
- Formation width can be changed during movement at a half-Move cost per file.
- Flank/rear charges record the engagement side, suppress the defender’s rank bonus when the attacker has Unit Strength 5+, and add the relevant combat-resolution bonus.
- In a one-on-one combat, surviving units turn to face each other between rounds; a flank-charged unit reforms one file wider, capped by the opponent’s frontage.
- Every unit can counter-charge an eligible front charge. A counter-charge brings both units into front-to-front combat; because both charged, they use actual Initiative rather than the +10 charging bonus.
- Units can flee from a declared charge, fleeing units can attempt rally tests, and the AI attempts to rally automatically.
- Movement activation and charge declarations.
- Melee and shooting hit rolls, Strength-versus-Toughness wounds, equipment-derived armour saves, rank bonus, combined combat result and Leadership-based break tests. Leadership tests use the highest Leadership of the tested unit or a living character embedded in it; that value does not transfer to other friendly units in the same combat. Attacks resolve sequentially through rank-and-file, then champion, then attached heroes, using each tier’s own defensive profile and wound pool; dice are displayed in grouped pools by target tier.
- Visible dice results and battle log.

## Prototype simplifications

This is not a verbatim implementation of any published rulebook. It is a small, testable foundation with classic rank-and-flank mechanics. Alternating unit activations are deliberately borrowed as a design idea from modern digital wargames rather than matching the original sixth-edition turn sequence. Charge response coverage is still incomplete: the player can flee from a declared charge, but the AI does not yet choose reactions strategically. Charge arc and line-of-sight checks use simplified unit-footprint obstruction; this is an approximation rather than full tabletop wheel-and-align geometry. Basic pursuit/catching and nearby panic tests are implemented, but pursuit/overrun choices and exact flee movement still need work. Multi-unit combats now resolve as connected combats: each unit strikes at its own effective Initiative, charging units receive +10 independently, and combat result is combined across the connected fight. Each engaged unit on the losing side takes a break test. Target allocation is currently automatic to the nearest engaged enemy; champion challenges, support attacks and full frontage/contact allocation are not implemented.

Remaining work: full wheel-and-align charge geometry, pursuit/overrun choices and exact flee/rally movement, broader panic triggers, precise multi-unit frontage/contact and support rules, terrain interactions, and more unit profiles and army rules. The between-round one-on-one facing/reform rule is an intentional house rule, not 6th-edition RAW. Keep rules logic separate from rendering as the project grows.

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
- Army points are displayed per unit and in total; there is no points cap yet. The AI currently mirrors the selected roster as a placeholder. Swordsmen spears cost +1 point per model; a Captain or General's halberd or great weapon costs +4 points. The General's Leadership can be used by friendly units within 12 inches, in line with the sixth-edition General rule.
- Armour saves are derived from equipment: light armour 6+, heavy armour 5+, full plate 4+, with shields improving the save by 1. Strength modifies armour saves: S4 −1, S5 −2, S6 −3, continuing by −1 per Strength above 3; a modified save worse than 6+ is impossible. The Captain has 2 Wounds, and those wounds are tracked separately from the regiment. See the [6th-edition armour-save modifier table](https://6th.whfb.app/shooting/armour-save-modifiers).


## Core hit and wound rules

The hit/wound resolver uses the sixth-edition Weapon Skill comparison, Ballistic Skill target number, Strength-versus-Toughness table, and Strength-modified armour saves. Melee natural 1s miss and natural 6s hit; shooting natural 1s always miss and 7+/8+/9+ shots use the 6th-edition follow-up-roll sequence, with 10+ impossible. Wounds against targets marked too tough by the table are impossible, rather than automatically receiving a 6+ chance. Armour saves of 1+ still fail on a natural 1.

Shooting modifiers are cumulative: long range −1, moving −1, Stand & Shoot −1, target charging −1, single character/skirmisher −1, soft cover −1, hard cover −2, and large target +1. Unit state exposes `largeTarget`, `singleCharacter`, `skirmisher`, and `cover` (`"soft"` or `"hard"`) for those situational rules. **The current battlefield has no terrain-placement or unit-tag controls yet**, so cover and large-target effects are rule-engine-supported but not yet selectable/automatically inferred in the UI. Character/skirmisher profiles are likewise not currently part of the army builder.
