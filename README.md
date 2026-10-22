# Sonic: AI call assistant (Supernova AI APM assignment)

Live site: https://muralikrishnadogiparthi13.github.io/sonic-assignment/

| Part | Link | Source |
|---|---|---|
| A. Onboarding prototype | [/onboarding/](https://muralikrishnadogiparthi13.github.io/sonic-assignment/onboarding/) | `site/onboarding/` |
| B. Agent prompt | [/prompt/](https://muralikrishnadogiparthi13.github.io/sonic-assignment/prompt/) | `prompt/sonic_system_prompt.md` |
| B. Chat with Sonic | [/chat/](https://muralikrishnadogiparthi13.github.io/sonic-assignment/chat/) | `site/chat/`, `worker/` |
| Test calls | [/evals/](https://muralikrishnadogiparthi13.github.io/sonic-assignment/evals/) | `evals/` |

- `worker/`: Cloudflare Worker that runs the prompt on Workers AI (`@cf/openai/gpt-oss-120b`). The app-side context (time-of-day handover rule) is computed here, not by the model.
- `evals/`: 27 scripted calls. `node evals/run.mjs <worker_url>` plays each caller with Claude and grades transcripts against `scenarios.json`.
- `tools/`: headless Chrome click-test and screenshot scripts for the prototype.
