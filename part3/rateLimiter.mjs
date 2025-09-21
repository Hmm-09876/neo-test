export class RateLimiter {
  constructor({ maxRequests = 10, perMillis = 60_000 } = {}) {
    this.max = maxRequests;
    this.per = perMillis;
    this.timestamps = [];
  }
  async schedule(fn) {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(t => t > now - this.per);
    if (this.timestamps.length >= this.max) {
      const waitMs = this.timestamps[0] + this.per - now;
      await new Promise(r => setTimeout(r, waitMs));
    }
    this.timestamps.push(Date.now());
    return fn();
  }
}
