**Scenario:** CEO wants sentiment analysis of interviewer tone, background-noise detection, and automatic suspicious-behaviour flags.

## Key concerns

* **Privacy & consent** — voice/ambient analysis can reveal sensitive info; need clear opt-in.
* **False positives** — wrong flags can harm people or decisions.
* **Bias** — models may misread accents, genders, languages.
* **Surveillance risk** — features can be abused for monitoring.
* **Chilling effect** — people alter behaviour if they feel "scored."

## How to modify the system

* **Default OFF; opt-in only** with clear purpose statements.
* **Detection ≠ action** — show alerts to humans, don't auto-enforce sanctions.
* **Minimize data kept** — store scores/metadata not raw audio unless needed.
* **Local/edge processing** where possible to reduce uploads.
* **Show confidence + short explanation** for every flag.

## Safeguards to implement

* **Consent logging** and in-UI notices.
* **Role-based access & audit logs** for who viewed flagged segments.
* **TTL for raw audio; anonymize stored data.**
* **Thresholds & calibration** to reduce false positives.
* **Bias testing & continuous monitoring** across accents/languages.
* **Human-in-the-loop review** and an appeal/feedback flow.
* **Admin kill-switch** to disable analyses immediately.