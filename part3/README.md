# Part 3 — AI Detection

---
## Quick Start

1. **Set token** (for live HF):
```bash
export HF_API_TOKEN="hf_xxxREPLACE"
```
2. **Run demo:**
```bash
node demo-hf.mjs
```

---
## Technical Summary

**Rate Limiting**  
- Sliding-window `RateLimiter`, default 10 req / 60s.  
- Retries transient errors (429/timeout) with exponential backoff + jitter.

**Text Splitting**  
- `splitTextPreserveWords(text, maxLen=5000)`.  
- Splits by words; each chunk ≤5000 chars.

**Aggregation & Idempotency**  
- `idempotencyKey = <base>:<index>` per chunk.  
- Returns `{ chunks: [...], aggregated: [...] }`.  
- Apply threshold or majority/average to decide for full transcript.

---
## Production Notes
- **Persistence** — store idempotencyKey + chunkIndex.  
- **Durability** — queue + dead-letter.  
- **Observability** — structured logs, metrics, alerts.
- **Scaling** — coordinate rate limits across instances.  
- **Privacy** — encrypt recordings/transcripts.
- **Model Provenance** — store model name/version + timestamp.

---

## Assumptions
- Uses `@huggingface/inference` (ESM).  
- Default model: `roberta-base-openai-detector`.  
- Default chunk size: 5000 chars, rate limit: 10 req/min.
