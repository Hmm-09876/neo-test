import { splitTextPreserveWords, RateLimiter } from './index.mjs';

export class DetectorService {
  constructor({ detectorClient, maxRequestsPerMinute = 10, maxRetries = 3, baseBackoffMs = 200 } = {}) {
    if (!detectorClient) throw new Error('detectorClient required');
    this.client = detectorClient;
    this.limiter = new RateLimiter({ maxRequests: maxRequestsPerMinute, perMillis: 60_000 });
    this.maxRetries = maxRetries;
    this.baseBackoffMs = baseBackoffMs;
  }

  _sleep = ms => new Promise(r => setTimeout(r, ms));

  async _callWithRetry(chunk, opts = {}) {
    let lastErr;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try { return await this.limiter.schedule(() => this.client.detect(chunk, opts)); }
      catch (err) {
        lastErr = err;
        if (!err.isTransient && !/rate|timeout|ETIMEDOUT|ECONNRESET|429/i.test(err.message || '')) break;
        await this._sleep(this.baseBackoffMs * 2 ** attempt + Math.random() * 50);
      }
    }
    throw lastErr || new Error('detector failed');
  }

  async detectTranscript({ transcript, idempotencyKeyBase } = {}) {
    const chunks = splitTextPreserveWords(transcript, 5000);

    const settled = await Promise.all(
      chunks.map((chunk, i) =>
        this._callWithRetry(chunk, { idempotencyKey: idempotencyKeyBase ? `${idempotencyKeyBase}:${i}` : undefined })
          .then(result => ({ status: 'fulfilled', chunkIndex: i, chunkLen: chunk.length, result }))
          .catch(error => ({ status: 'rejected', chunkIndex: i, chunkLen: chunk.length, error }))
      )
    );

    const fulfilled = settled.filter(x => x.status === 'fulfilled');
    const rejected = settled.filter(x => x.status === 'rejected');

    const aggregated = fulfilled.map(f => {
      const r = f.result || {};
      return { chunkIndex: f.chunkIndex, label: r.label ?? null, score: r.score ?? null };
    });

    return {
      chunks: settled,
      aggregated,
      partial: rejected.length > 0,
      errors: rejected.map(r => ({ chunkIndex: r.chunkIndex, error: String(r.error) }))
    };
  }
}

