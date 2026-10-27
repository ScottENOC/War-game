# Campaign and AI Setup v1.0 — Baseline

## Frozen reference

The pre-experiment campaign/AI setup is preserved on branch `campaign-ai-v1.0-baseline`. The branch was created from `development` immediately before the red/blue experiment harness was added. Keep it unchanged as the reference implementation; do experiments on `development` or later experiment branches.

## Baseline run

Five seeded AI-only campaigns, 150-turn limit, no tactical battles launched:

| Run | Seed | Outcome | Surviving factions |
|---|---:|---|---:|
| 1 | 20261022 | Turn limit | 9 |
| 2 | 20268941 | Turn limit | 10 |
| 3 | 20276860 | Turn limit | 14 |
| 4 | 20284779 | Turn limit | 13 |
| 5 | 20292698 | Turn limit | 11 |

All five runs reported zero caught simulation errors. None produced a world-conquest or diplomatic-stalemate outcome. Outcomes were strongly seed-dependent: the Silver Admiralty dominated one run, while the Verdant Court dominated another; the Moonlit Princes, Vane, and the Ashen Sepulchre also survived repeatedly. This is a useful first working baseline, not yet a statistically strong balance result.

## Red/blue test harness

The AI lab now supports paired comparisons:
- **Red / baseline:** every faction uses the v1.0 baseline decision threshold.
- **Blue / experiment:** one selected faction receives an experimental AI profile; all other factions retain baseline behaviour.
- Both conditions use the same seed list and initial setup for each pair. After actions diverge, random-number consumption can diverge too, so this is a paired-seed comparison rather than a perfectly controlled replay.
- Reports compare the selected faction's survival, mean owned regions/cities per run, mean army points, and mean civilian population, with per-seed rows. Overall campaign outcomes are included too.
- The current experimental profiles are deliberately simple threshold tests, not claims of generally better AI:
  - **Aggressive:** lowers the minimum strategic attack ratio threshold from 1.20 to 0.90.
  - **Cautious:** raises it from 1.20 to 1.40.

Use 5 paired seeds as a quick screening test, then 10–20 paired seeds for promising changes. Keep the same turn limit and seed set when comparing profiles. A change should not be accepted on city count alone: check survival, army strength, civilian population, overall outcomes, errors, and whether it simply transfers territory from another faction.

## Metric notes

- The report's `c` count is the number of owned campaign regions/settlement nodes; the UI calls these cities for brevity.
- Army points are summed across the faction's surviving field armies.
- Civilian population is the sum of city population plus population in minor settlements owned through those regions.
- These values are diagnostics; their calculations should be validated if a result looks anomalous.
