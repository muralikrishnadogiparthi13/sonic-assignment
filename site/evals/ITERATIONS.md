# What the test calls taught me

Each run: 24 scripted calls against the deployed model (gpt-oss-120b on Workers AI).
Claude Sonnet plays the caller from a brief; a separate Claude Sonnet judge grades each transcript against written must / must-not rules.

| Run | Pass | What changed before this run |
|---|---|---|
| 1 | 15/24 | First prompt. |
| 2 | 20/24 | App now computes the 10 pm handover rule (the model got time comparisons wrong). Verify-before-address step. Tag table. Example calls. Output guard strips markdown and caps length (one scam call got a markdown essay). |
| 3 | 20/24 | Simulated riders often "didn't know the restaurant", and Sonic turned real riders away. Switched to a verification ladder: app + any one matching detail (restaurant, item, building or area). OTP requests need no verification because nothing is shared. Stronger Hinglish mirroring. |
| 4 | 21/24 | Model copied a line from an example into its own reply: examples are now marked as separate calls. Manager outage was marked MESSAGE: work-in-the-next-hour is now explicitly URGENT. |

Things I learned that changed the product, not just the prompt:
- Strict verification protects the address but sends the food back. The real trade-off is "rider gets through in 2 turns" vs "stranger gets nothing". The ladder keeps both.
- Anything that is a lookup or a comparison (time of day, which order matches) belongs to the app, not the model.
- The free tier allows roughly 400 replies a day, so test runs and reviewer traffic must not share one account on the same day.
