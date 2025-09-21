# List of potential failure points

**Network drop (chunk upload / STT call)**  
  - Why: unstable connection, provider timeout.
  - Mitigation: retries + backoff, resumable uploads, persist chunks locally, checkpoint last acked chunk.

**Recorder crash / OOM**  
  - Why: memory leaks, heavy pages.
  - Mitigation: reuse browser instance, limit pages, per-call worker, health checks/supervisor.

**Missed scheduled interview**  
  - Why: clock skew, webhook auth fail.
  - Mitigation: fallback polling, idempotent startJob, alerts.

**Lost transcriptions**  
  - Why: race conditions, unawaited promises.
  - Mitigation: proper await, retries, transactional writes, confirm ACK.

**Rate limiting (AI/STT)**  
  - Why: exceeding provider QPS.
  - Mitigation: client-side limiter, queue + workers, split text, backoff on 429.

**Very long audio → memory/timeout**  
  - Why: buffering entire audio, max text length exceeded.
  - Mitigation: chunking, streaming STT, persist & aggregate results.

**Duplicate records**  
  - Why: retries + duplicate callbacks.
  - Mitigation: idempotency keys, DB deduplication.

**Incorrect participant selection**  
  - Why: ID mismatch, multi-channel ambiguity.
  - Mitigation: capture participant metadata, use diarization, test multi-participant.

**Storage cost / retention**  
  - Why: storing raw recordings too long.
  - Mitigation: retention policy, compression, archive, on-demand retrieval.

**Privacy / legal / missing audit**  
  - Why: no consent logs, no deletion flow.
  - Mitigation: log consent, delete API, encrypt at rest, audit trail.

**AI detection false positives**  
  - Why: model bias, out-of-domain input.
  - Mitigation: human-in-loop review, configurable thresholds, track model/version.

**Queue backpressure / worker lag**  
  - Why: surge or slow APIs.
  - Mitigation: autoscale workers, alerts on queue length, circuit breaker.

---
# Top-3 Concerns

1. **Privacy & Consent**  
    - Why: legal & ethical risk.  
    - Actions: require consent, encrypt recordings, store consent records, deletion/retention policy, role-based access.
    - Deliverable: document consent flow + retention policy.

2. **Reliability & Data Loss**  
    - Why: lost transcriptions = core failure.  
    - Actions: idempotency & checkpoints, tests for lost cases, retries & dead-letter, transactional writes, monitoring & alerts.  
    - Deliverable: test reproducing lost data + patch with await/retry.

3. **Scaling & Cost**  
    - Why: STT/AI calls expensive, storage grows fast.  
    - Actions: chunking & batching, caching, streaming vs batch, autoscale, storage lifecycle policies.
    - Deliverable: note rate limit handling and text splitting (max 5000 chars).
