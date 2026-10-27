# Campaign AI v1.0 — baseline and experiment protocol

## Frozen baseline

- Snapshot branch: `campaign-ai-v1.0-run150-baseline`
- Snapshot commit: `6df53a19ad154c03ddba3a63ac05f3f9fb8e981a`
- Active work continues on `development`; do not merge this snapshot to `main` without explicit approval.
- Scenario: AI-only Grand Campaign, current map and initial faction ownership, current starting-roster rules, strategic auto-resolved battles, no tactical battles.
- Default test horizon: 150 turns.
- Baseline AI attack threshold: 1.20. Experimental profiles change the selected faction's threshold only: aggressive 0.90, cautious 1.40.
- Random seeds in the existing five-run baseline sample: 20261022, 20268941, 20276860, 20284779, 20292698.

## Observed five-run baseline sample

All five runs reached the 150-turn limit with zero caught simulation errors. Surviving faction counts were 9, 10, 14, 13 and 11. The strongest faction varied by seed: Silver Admiralty dominated run 1, Moonlit Princes/Verdant Court were prominent in runs 2–4, and Verdant Court reached 9 cities in run 5. These five runs are a useful reference sample, not enough to establish robust balance or a definitive win rate.

## Red/blue protocol

1. Red is the unmodified baseline. Blue is the same scenario and seed with one selected faction assigned an experimental profile.
2. Use paired seeds. A pair starts with the same seed and setup; after AI decisions diverge, random-number consumption can diverge too.
3. Begin with 5 paired runs for quick screening, then 10–20 paired runs for promising changes. Keep the 150-turn limit fixed when comparing a profile.
4. Compare the tested faction's survival rate, mean cities (count eliminated factions as zero), army points and civilian population. Also inspect the all-faction impact table: gains by the tested faction can come at other factions' expense, and a change may alter the whole map's trajectory.
5. Check caught errors and inspect the detailed logs before interpreting a result. A profile that produces more cities in one seed but worse paired results overall is not automatically an improvement.
6. Change one factor per experiment. Keep a copy of the compact report with the faction/profile, number of paired seeds, turn limit and date.

## Interpretation limits

The current profiles are threshold variants of the same strategic AI, not wholly different strategic personalities. This is a controlled first experiment. Later variants can test separate behaviours (e.g. coordinated expansion, siege persistence, defence/relief, or supply raiding), but should each be isolated and measured against this baseline.
