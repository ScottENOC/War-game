# War-game

An original browser-based rank-and-flank battle prototype. The initial rules foundation is inspired by classic sixth-edition-style fantasy battles, with alternating movement activations as an explicit house rule.

## Run it

Open [index.html](./index.html) in a browser, or enable GitHub Pages for the repository and publish from the `main` branch.

## Current prototype

- Main menu, point-based army builder and blind deployment phase. Roguelike and Warband Expeditions can randomly generate standard skirmish, Hold / Seize Ground, Capture the Flag, or Relic Hunt missions; these are expedition encounters, not standalone menu modes.
- Up to six player entries: swordsmen and archers (5–30 models each), cavalry (5–15 models), plus a human Captain hero or an Valedorn General (Lord). Cavalry cost 16 points per model and use 25×50 mm bases (infantry use 20×20 mm), Move 8, and one WS3 S3 I3 A1 horse attack per model. Cavalry begin with sword, light armour and an unbarded horse; the mount improves armour saves by 1, and barding improves them by a further 1 while reducing Move to 7. Human cavalry can take bows (+2/model), crossbows (+3/model) or firearms (+4/model), alongside heavy armour, barding and melee weapon options; mounted shooters fire from one rank. Elf cavalry retain their free bow-or-spear choice and cannot use crossbows or firearms. Spears grant +1 Strength and lances +2 Strength on the charge only; neither adds a fighting rank. Characters can buy a horse for +8 points and, when mounted, a spear (+2), lance (+4), or barding (+4). Humans may equip heroes and lords with bows (+2), crossbows (+3) or firearms (+4); Elf heroes and lords may take longbows (+3). Mounted characters may join cavalry only; unmounted characters may join infantry only. Swordsmen can buy spears for +1 point per model; spear-armed infantry fight in an extra rank.
- Optional unit champions and optional swordsman light armour, with per-unit and total army points. Human infantry, cavalry, Heroes and Lords can buy ranged weapons independently of their melee loadout; Elves use bows and reject crossbows/firearms. Hand weapons remain included for melee even when a unit carries a bow. Units can own multiple melee weapons and select the active weapon before resolving each combat; selecting a spear automatically readies an owned shield, while great weapons and halberds cannot use one. A shield-equipped ranged unit switches between bow-ready and shield-ready stance during movement; the stance persists between turns, and firing prevents switching to shield for the remainder of that movement activation. Captains and Generals start in light armour; heavy armour costs +4 points and improves the save from 6+ to 5+. Heavy armour does not reduce mounted characters’ Move. The 80-point Valedorn General (M4 WS5 BS5 S4 T4 W3 I5 A3 Ld9) can buy a halberd (+1 Strength, two-handed; infantry only) or great weapon (+2 Strength, −10 Initiative, two-handed) for +4 points. After melee resolves, the Captain can cycle between hand weapon, halberd and great weapon for the next combat.
- A simple AI opponent that currently mirrors the player's army list.
- Movement, charges, shooting, melee, morale, and visible dice results.
- Each unit that charges or counter-charges receives +10 Initiative for that combat round, independently of other units in the fight. Units that did not charge use their normal Initiative. Within an Initiative level, attack packets resolve sequentially as a digital house rule so casualties can expose the next defender tier. A combatant killed before its own packet is entitled to a last attack, cannot be targeted while delayed, and dies immediately after striking. For rank-and-file, the game snapshots the number of models in the fighting front rank at the start of that Initiative step: those models can still contribute their attacks if killed before the regiment's packet, but rear ranks do not gain attacks they were not entitled to make.
- Formation width can be changed during movement at a half-Move cost per file.
- Flank/rear charges record the engagement side, suppress the defender’s rank bonus when the attacker has Unit Strength 5+, and add the relevant combat-resolution bonus.
- In a one-on-one combat, surviving units turn to face each other between rounds; a flank-charged unit reforms one file wider, capped by the opponent’s frontage.
- Every unit can counter-charge an eligible front charge. A counter-charge brings both units into front-to-front combat; because both charged, they use actual Initiative rather than the +10 charging bonus.
- Units that flee must attempt one rally test at the start of each movement phase. The test uses unmodified Leadership; a unit below a quarter of its starting strength cannot attempt to rally. A successful rally prevents further movement that turn. Marta Weiss can once per battle automatically rally a friendly fleeing unit within 12 inches, bypassing the quarter-strength restriction; she cannot use Rallying Call while fleeing.
- Movement activation and charge declarations.
- Melee and shooting hit rolls, Strength-versus-Toughness wounds, equipment-derived armour saves, rank bonus, combined combat result and Leadership-based break tests. Ranged profiles: human bows range 24", Strength 3, three firing ranks; Elf longbows range 30", Strength 3, four firing ranks; crossbows range 30", Strength 4, two firing ranks, BS capped at 4 and −2 to hit when firing over friendly units; firearms range 20", Strength 4, two firing ranks for infantry (mounted shooters use one), BS capped at 3, an additional −1 armour-save modifier and −2 to hit at long range. Bow fire over friendly units incurs −1 to hit. Firearms require a clear direct ray: any intervening unit that rises above that ray blocks the shot, friendly or enemy; the intervening enemy unit itself remains a legal target if its own line of sight is clear. Unit height and terrain elevation determine whether a direct shot is obstructed. Infantry default to 1.7 inches high and mounted units to 2.5 inches; hills rise smoothly to 2 inches at their centre and stone walls are 1.5 inches high. Bows and crossbows can use a simplified parabolic trajectory over intervening units, hills and walls when it clears the obstacle, taking −1 to hit with bows or −2 with crossbows. Firearms require a clear direct trajectory. These are prototype geometric rules, not a full physics simulation. Bows and crossbows can fire through friendly units; bow misses by exactly 1 and crossbow misses by 1 or 2 redirect into the intervening friendly unit as rear shots (no shield save), with the redirected dice highlighted in the shooting display. Shooting into melee is allowed: targets in melee incur −1 to hit unless the shot already has an intervening-unit penalty. Elven Archery can cancel up to two points of moving, long-range and firing-over-unit penalties; other penalties such as cover remain. Leadership tests use the highest Leadership of the tested unit or a living character embedded in it; that value does not transfer to other friendly units in the same combat. Attacks resolve sequentially through rank-and-file, then champion, then attached heroes, using each tier’s own defensive profile and wound pool; dice are displayed in grouped pools by target tier.
- Visible dice results and battle log.

## Prototype simplifications

This is not a verbatim implementation of any published rulebook. It is a small, testable foundation with classic rank-and-flank mechanics. Alternating unit activations are deliberately borrowed as a design idea from modern digital wargames rather than matching the original sixth-edition turn sequence. Charge response coverage is still incomplete: the player can flee from a declared charge, but the AI does not yet choose reactions strategically. Charge arc checks use simplified unit-footprint obstruction. Shooting line of sight checks model-centre-to-model-centre rays against intervening unit footprints: a shooter model can contribute if at least one target model is visible, and friendly intervening units can be fired over by eligible weapons. This is a formation-level approximation rather than full tabletop model/terrain geometry. Basic pursuit/catching and nearby panic tests are implemented, but pursuit/overrun choices and exact flee movement still need work. Multi-unit combats now resolve as connected combats: each unit strikes at its own effective Initiative, charging units receive +10 independently, and combat result is combined across the connected fight. Each engaged unit on the losing side takes a break test. Target allocation is currently automatic to the nearest engaged enemy; champion challenges, support attacks and full frontage/contact allocation are not implemented.

Remaining work: overrun choices and more exact flee/rally movement, full wheel-distance charge costs and charge-arc checks, broader panic triggers, precise multi-unit frontage/contact and support rules, and more unit profiles and army rules. The between-round one-on-one facing/reform rule is an intentional house rule, not 6th-edition RAW. Keep rules logic separate from rendering as the project grows.

## Battlefield terrain and manoeuvring

- During deployment or battle, use the Terrain toolbar and drag on the field to place blue rivers, blue lakes/ponds, or grey stone walls; Erase removes the nearest feature and Off returns to normal selection. Skirmish battles automatically generate rolling sine-wave elevation with water in local low spots; elevation is terrain-wide rather than represented by manually placed hill objects. During movement, select a unit and tap a wall to issue a wall-defence order: Hunker down grants hard cover but prevents shooting; Active grants soft cover and allows shooting. The unit moves to the wall if it can reach a legal position with its remaining movement.
- Water is passable but costs double movement for the portion of a move spent in it. This applies to player movement and AI advances.
- Stone walls are solid movement obstacles. Units can approach a wall, move along it, and move away, but cannot pass through it. Defending units can adopt a hunkered or active posture at a wall. Hunkered units cannot shoot and receive hard cover; active units receive soft cover and each volley randomly exposes 45–70% of eligible models, with a fresh sample each time. Models are staggered and the unit keeps its facing and rank benefits; this is a per-volley exposure abstraction, not persistent miniature pose animation. A frontal charge against a defended wall nullifies charge advantages: no +10 Initiative and no charge-only spear/lance Strength bonus. Spears grant their extra fighting rank only when their unit did not charge that turn. Elevation modifies effective ranged range by 1 inch per inch of elevation difference, capped at ±4 inches. For shooting, the resolver samples the shot path against hill elevation and wall height. A direct shot is blocked when the ray intersects terrain; bows and crossbows may clear it with a simplified parabolic path, at −1 and −2 to hit respectively. Hill elevation tapers from its centre to the edge.
- During movement, drag a unit in any direction to advance, sidestep or move backwards while keeping its facing. Turn left/right 45° controls rotate in place for movement cost based on frontage; corner-drag pivots remain available.

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
- `rules.js`, `shooting.js`, `combat.js` and `dice.js` — rules resolution and dice results. Attack dice are grouped by matching profiles; an optional champion replaces one rank-and-file model and can specialise for +1 Attack or +1 BS; the default is +1 BS for ranged-weapon-equipped infantry and +1 Attack otherwise. Hit, wound and save pools use the relevant WS/BS, Strength and target stats, while melee sequencing uses each unit’s Initiative.
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

Shooting modifiers are cumulative: long range −1, moving −1, Stand & Shoot −1, target charging −1, single character/skirmisher −1, soft cover −1, hard cover −2, and large target +1. Unit state exposes `largeTarget`, `singleCharacter`, `skirmisher`, and `cover` (`"soft"` or `"hard"`) for those situational rules. **The current battlefield has no terrain-placement or unit-tag controls yet**, so cover and large-target effects are rule-engine-supported but not yet selectable/automatically inferred in the UI. The army builder offers a purchasable Skirmish skill (+3 points). Normal ranged units fire in a 90° front arc; in movement, a skirmisher can switch between spread-out skirmish formation and normal ranks for half Move. Skirmishers pivot freely, fire in a 360° arc, use shields in every direction, count charges against them as front charges while out of combat, and suffer −1 to be hit. On entering melee they reform into normal square formations; in their first combat round they receive no rank bonus and cannot attack in multiple ranks. Human units cannot adopt skirmish formation while wearing heavy armour or barding. Selected ranged units show maximum- and half-range rings, and hovering an enemy while Shoot is active previews range, required hit roll and friendly-fire risk.


## Elves and shields (development)

- The army builder offers the Kingdom of Valedorn, Elves and Dwarfs. Elves are faster, more accurate and initiative-focused. Dwarfs are resilient Move 3 infantry with T4 basic troops, baseline light armour and shields, no cavalry, flyers or magic, and stronger gunpowder weapons. Their profiles and points are approximate sixth-edition-style reference values adapted to the prototype.
- Elves have +1 Movement, Weapon Skill, Ballistic Skill, Initiative and Leadership over their human equivalents, and Always Strikes First. Elf rider attacks receive +10 Initiative; missed melee hits can be rerolled only when the rider's final modified Initiative (including ASF, charging and great-weapon penalties) is at least 11 higher than the target's. ASF is a +10 Initiative modifier, not an overriding priority rule. Rerolls are shown in a distinct dice lane.
- Elf spearmen begin with light armour, shields and spears and fight in three ranks. Elf archers begin with light armour and 30-inch longbows. Elf cavalry begins with light armour and chooses either a bow or spear for free. Elven heavy armour and barding do not reduce movement.
- Shields cost 0.5 points per troop model and 2 points per character. They improve armour saves only when the attacker is in the defender's front arc; side and rear attacks receive no shield bonus. Shields cannot be combined with a two-handed great weapon or halberd.
- Rider and mount attacks now resolve in separate Initiative packets. Mounts use their own Initiative and do not inherit the rider's great-weapon penalty or racial Always Strikes First rule.

## Named Dwarf Lord: King Haldric Stoneward

- King Haldric Stoneward is a 210-point named Dwarf Lord (M3, WS7, BS4, S4, T5, W4, I4, A4, Ld10). His fixed Runic Plate gives a 4+ base armour save; his Shield of the Deep Hall improves armour by 1 against attacks from the front and grants a 5+ ward save against those same attacks. The shield’s ward save does not protect against side or rear attacks.
- Unyielding Presence makes Haldric himself and friendly units within 12 inches Stubborn while he is alive and not fleeing. Stubborn ignores combat-result penalties on break tests; it does not make units immune to fleeing for other reasons.

## Miniature collection prototype

The main menu now exposes four game-mode entry points: Grand Campaign (4X), Narrative Campaign, Roguelike Expedition, and Skirmish. Grand Campaign and Roguelike Expedition remain placeholders. Narrative Campaign now has a three-mission leveling prototype: 20 human swordsmen, one human hero and 20 human archers fight 20 human swordsmen in each mission. Every victory offers one upgrade for each player unit; the force is restored to full strength between missions while upgrades persist.

The persistent browser collection starts with 100 human swordsmen, 50 human archers, and one Valedorn hero equipped with a sword only. Skirmish roster validation checks that the player owns enough models matching each selected unit's faction, type, weapon, shield and mounted status. The Developer Menu includes a persistent ownership-check bypass and a one-item lootbox test button.

The Army Builder groups owned miniatures, lets players permanently add compatible components to existing models, and assembles new models by consuming a matching main body, weapon arms, left arm (empty hand or shield), and horse when mounted. Arms are faction-neutral. Lootboxes award one random bit (currently 72% chance) or one complete model; complete-model weights are inversely proportional to their base points cost. Inventory is stored in browser local storage. This is a prototype economy, not a monetised system.


### Lootbox rewards

- Claim one free lootbox per local calendar day from the Collection screen.
- Win a skirmish to earn one additional unopened lootbox; a defeat gives no victory reward.
- Open earned lootboxes from the Collection screen. Each currently grants one random usable bit (72%) or a complete model (28%); complete-model odds are weighted inversely by points cost.
- The Developer Menu retains a direct test button that grants a random item immediately, without consuming an earned lootbox.
- Daily claim state, unopened boxes, and collection progress are stored in this browser's local storage. This is a prototype, not a secure account-wide reward system: clearing browser data can erase it, and changing the device clock can affect daily claims. A future online release would need account/server-side tracking to enforce one claim per day across devices.


## Personalised units and skirmish stat upgrades

- Infantry now uses one underlying combat profile: choose a sword/hand weapon, spear, bow, crossbow, firearm, great weapon or infantry-only halberd. Ranged weapons provide shooting attacks while the unit retains a hand weapon in melee; ranged weapon choice controls its shooting profile. Humans and Elves use the same infantry profile within their faction, with equipment and racial rules creating the difference.
- Infantry weapons use the following starting premiums per model: bow +2 points for humans / +3 for Elves, crossbow +3, firearm +4, spear +1, great weapon +2, halberd +1. Crossbows and firearms use Strength 4; firearms worsen armour saves by one additional point. These weapon prices and profiles are provisional balance values. Existing faction equipment defaults and shield/armour costs remain.
- Unit champions can specialise for +1 Attack or +1 Ballistic Skill. The default is +1 BS when equipped with a bow and +1 Attack otherwise; the army builder exposes a selector to change it.
- Skirmish stat upgrades are available to infantry, cavalry and characters, once per stat, excluding Wounds and Attacks. Melee Mastery, Marksman and Steadfast are also purchasable for 3 points each per unit/character; Marksman is offered only to ranged-weapon-equipped units. Regiment upgrades cost per model: Movement +2, Weapon Skill +2, Ballistic Skill +2, Strength +3, Toughness +4, Initiative +1, Leadership +1. Character upgrades cost once: Movement +5, Weapon Skill +5, Ballistic Skill +5, Strength +6, Toughness +8, Initiative +3, Leadership +3.
- Elven Archery is a purchasable Elf shooting upgrade for bow-equipped infantry and cavalry. It costs +2 points per model, matching the current +1 BS upgrade price, and ignores moving and long-range penalties; other modifiers, including cover once terrain is implemented, still apply.
- These prices are provisional balance values intended for iteration. Special skills use the same flat 3-point cost for a regiment or character, not a per-model cost. The campaign modes remain placeholders; this stat-upgrade structure is currently implemented in the skirmish army builder as the prototype for later campaign progression.


## Narrative campaign progression prototype

- The Narrative Campaign menu entry launches a three-mission sequence. Each mission pits the same starting force (20 human swordsmen, one human hero, 20 human archers) against 20 human swordsmen.
- After each victory, every player unit selects one upgrade: +1 Strength, +1 Toughness, +1 Movement and Initiative, +1 Weapon Skill, +1 Ballistic Skill, or +1 Leadership. Stat bonuses stack across missions.
- A unit that has increased Weapon Skill can later choose Melee Mastery (reroll natural 1s to hit in melee); Ballistic Skill unlocks Marksman (reroll natural 1s to hit with shooting); Leadership unlocks Steadfast (ignore combat-result penalties on break tests). Each skill can be selected once and takes one level-up choice.
- Campaign progress is stored in browser local storage. This is a prototype: it does not yet persist battle casualties, has no branching story or campaign map, and does not use the collection/ownership system to gate the starting force. The three missions currently reuse the same battlefield and enemy roster.


## Human identity and pike-and-shot

- Human identity is flexibility and combined arms rather than a racial stat bonus: human infantry and characters can mix a melee weapon with a ranged weapon, while cavalry can also choose ranged equipment. Elves remain faster, more accurate and more initiative-focused. Dwarfs are Move 3, have T4 basic warriors, and retain baseline light armour and shields even when selecting two-handed weapons. Heavy armour does not slow them; their Toughness upgrades are cheaper than Elven upgrades, while Movement and Initiative upgrades cost more. Dwarfs cannot field cavalry, flyers or magical equipment. Dwarf handguns have 24-inch range and AP2 compared with human firearms at 20-inch range and AP1, while remaining Strength 4 and subject to the firearm hit modifier.
- Human named characters include Captain Marta Weiss, a grounded line officer whose once-per-battle Rallying Call can steady a fleeing unit, and Matthias Keller, an Imperial Marksman. Keller carries a long rifle by default: 36-inch range, Strength 4, AP1, no weapon-imposed BS cap, and a direct line-of-fire requirement. He is an independent character rather than automatically joining a regiment, so he can select a different target from the rest of the army's shooters. Marta’s once-per-battle Rallying Call automatically rallies one friendly fleeing unit within 12 inches, even if it is below a quarter of its starting strength; Marta cannot use it while fleeing.
- The current prototype supports a basic pike-and-shot loadout by equipping infantry with spears and firearms together. Spear infantry still gain an extra fighting rank only when they did not charge. A unit that charges into stationary spear-armed defenders loses its +10 Initiative charge bonus and its charge-only spear/lance Strength bonus unless the defenders counter-charge. A true mixed regiment with separate pike/shield and firearm model groups is not yet represented: all models in a unit currently share the unit's weapon profile, and shields do not currently support a firearm-ready stance.


## Warband Skirmish (one-off mode)

- Build a temporary warband from owned individual miniatures; no regiments are used. Lords, named characters, chariots and 50 × 50 mm-base monsters are excluded.
- Each fighter has an individual wound pool and rolls a D6 when their last wound is lost: 1–2 stunned (misses the next turn), 3–4 unconscious (can be revived by an adjacent friendly fighter during the movement/shooting phase; the rescued fighter cannot shoot that turn), 5–6 out of action and treated as dead for this one-off battle.
- The AI uses an individual-fighter roster. The warband is discarded after each battle. One lootbox is awarded for every three wins in this mode; ordinary Skirmish rewards are unchanged.

## Warband Expedition (persistent small-force roguelike)

- Start with five individual fighters from your collection, with a maximum of eight living fighters in the expedition. Models remain in the collection; the expedition keeps its own persistent fighter records.
- Each opposing fighter taken out of action grants 1 XP to the fighter who removed them; if the engine cannot identify a direct attacker, it awards the XP to the nearest available friendly fighter. At 4 XP, choose an upgrade that the fighter is eligible to earn in the regular army-based roguelike: a new eligible skill (Melee Mastery, Marksman if they have a ranged weapon, Steadfast or Skirmish), a permitted +1 characteristic bonus, or caster level for eligible Elf martial characters. Already-earned skills are unavailable; stat restrictions and fallback choices follow the regular roguelike. Unspent XP carries over.
- Victory awards 50 points. Spend points between battles to recruit another eligible model from your collection or buy equipment; unspent points remain banked. Defeat awards no points, but the expedition continues while at least one fighter survives.
- A fighter who rolls 5–6 when their final wound is lost is out of action and receives a second, post-battle D6 injury roll: 1 misses the next fight; 2 misses the next two fights; 3 loses a leg (−1 Movement); 4 loses the left arm (no two-handed weapons, shields or dual wielding); 5–6 dies permanently. Results 3 or 4 are rerolled if that injury already exists.
- Individual wounds, XP, equipment, injuries, deaths and banked points persist between fights. If all fighters die, the expedition ends.


## Objective battle types

- **Hold / Seize the Ground:** fight for the central objective. At the end of turn 6, the side with more living, deployed fighters within 3.5 inches controls it; a tie is a draw.
- **Capture the Flag:** each side has a flag in its deployment zone. Pick up the enemy flag and return to your own base while your own flag is home. A dropped flag can be picked up again; the first successful capture wins. A battle without a capture by the end of turn 10 is a draw.
- **Relic Hunt:** five relics begin in neutral territory. A fighter can carry one relic at a time; carry it back to your deployment side to secure it. Relics drop if their carrier is knocked out or killed. First side to secure three wins; otherwise the score at the end of turn 10 decides.

All three modes use the existing army builder and ownership restrictions. They are selected from the main menu and use the standard battlefield and AI roster generation.
