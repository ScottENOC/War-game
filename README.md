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
