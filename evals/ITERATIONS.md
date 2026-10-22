# What the test calls taught me

Each run: 24 scripted calls against the deployed model (gpt-oss-120b on Workers AI).
Claude Sonnet plays the caller from a brief; a separate Claude Sonnet judge grades each transcript against written must / must-not rules.

| Run | Pass | What changed before this run |
|---|---|---|
| 1 | 15/24 | First prompt. |
| 2 | 20/24 | App now computes the 10 pm handover rule (the model got time comparisons wrong). Verify-before-address step. Tag table. Example calls. Output guard strips markdown and caps length (one scam call got a markdown essay). |
| 3 | 20/24 | Simulated riders often "didn't know the restaurant", and Sonic turned real riders away. Switched to a verification ladder: app + any one matching detail (restaurant, item, building or area). OTP requests need no verification because nothing is shared. Stronger Hinglish mirroring. |
| 4 | 21/24 | Model copied a line from an example into its own reply: examples are now marked as separate calls. Manager outage was marked MESSAGE: work-in-the-next-hour is now explicitly URGENT. |
| 5 | 18/24 | Moved to the production account. No big prompt change (wrong-item rule, greetings), yet 3 fewer passes: the same prompt varies run to run, so one run is never the verdict. |
| 6 | 22/24 | Two steps per delivery turn, "I can't connect calls", always confirm the callback number, "from the bank" is sales until they ask for codes. |

After run 6, an independent audit (31 extra calls against the live agent) found two things my suite could not see:
- **Address leak to a rider who knows nothing.** Claude-played riders always cooperated, so no scenario tested a caller who never names anything. On such calls the model sometimes answered its own "which building?" question and read out the address. Fix: the app now checks every reply, and an unverified caller can never receive an address word (it gets the next verification question instead). New scenario D8 tests exactly this.
- **Reasoning text spoken to callers** (gpt-oss "analysis..." and tokens like <|end|>, [WAIT]). Fix: the app takes only the final message, strips control tokens, cuts any line the model writes as the caller, and retries once if the reply is still not speakable.
Also added: D9 (nobody home to collect, daytime), D10 (courier with no matching order), a judge rule that fails any leaked reasoning, and "a question turn can't end the call".

| 7 | 9/10 | Targeted run (22 Oct) of the 10 calls the audit fixes touch, to save the free quota for reviewers: D8 rider who knows nothing (no address leaked), D9 nobody home, D10 courier, OTP, after 10 pm, home delivery, scam, family emergency, unknown "brother", prompt injection. Also fixed: garbled end tags (END:URGURG) now map to the nearest real outcome. The one miss, U1, is a judge call on warmth: Sonic alerted Ananya and confirmed the callback number, but with a short "Take care". |
| 8 | 27/27 | Full suite on the final code (22 Oct), including the three audit scenarios. No address leaked to an unverified caller, no reasoning text spoken. One run is still not a guarantee: earlier runs moved by 3 to 4 calls on the same prompt. |

Second audit pass (22 Oct) confirmed both P0s and all P1s fixed. Two small follow-ups were moved into code, checked offline and with live calls: a rider who names the restaurant or building before the app is now asked "which app?" instead of the restaurant again, and an urgent alert for an unknown number always comes with a spoken callback promise.

Remaining misses in run 6: one office delivery left out "Block C" in the drop instruction, and one unknown "brother" call didn't repeat the callback number.

Things I learned that changed the product, not just the prompt:
- A test suite only finds what its callers try. The cooperative simulated caller hid the most important privacy failure; the fix belongs in code, not just in the prompt.
- Strict verification protects the address but sends the food back. The real trade-off is "rider gets through in 2 turns" vs "stranger gets nothing". The ladder keeps both.
- Anything that is a lookup or a comparison (time of day, which order matches) belongs to the app, not the model.
- Results move by 3 to 4 calls between runs of the same prompt. Read trends across runs, and look at transcripts, not one score.
- The free tier allows roughly 400 replies a day, so test runs and reviewer traffic must not share one account on the same day.
