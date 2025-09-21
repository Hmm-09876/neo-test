// background_worker.js - retry failed chunks
import fs from 'fs/promises';
import path from 'path';
import { uploadWithRetry } from './storage.js';

const RECORDINGS_DIR = path.join('.', 'data', 'recordings');
const SCAN_INTERVAL = +process.env.WORKER_INTERVAL_MS || 5000;

async function scanAndRetry() {
  const files = await fs.readdir(RECORDINGS_DIR).catch(() => []);
  for (const f of files.filter(f => f.endsWith('.json'))) {
    try {
      const p = path.join(RECORDINGS_DIR, f);
      const rec = JSON.parse(await fs.readFile(p, 'utf8'));
      let changed = false;

      for (const ch of rec.chunks) {
        if (ch.status !== 'upload_failed') continue;
        try {
          const buf = Buffer.from(`retry:${rec.id}:${ch.index}:${Date.now()}`);
          const res = await uploadWithRetry(rec.id, ch.index, buf, 3);
          Object.assign(ch, { status: 'uploaded', s3: res.url, retried_at: new Date().toISOString() });
          console.log(JSON.stringify({ event: 'retry_success', rec: rec.id, chunk: ch.index }));
        } catch (err) {
          Object.assign(ch, { last_retry_err: err.message, last_retry_at: new Date().toISOString() });
          console.log(JSON.stringify({ event: 'retry_failed', rec: rec.id, chunk: ch.index, err: err.message }));
        }
        changed = true;
      }

      if (changed) await fs.writeFile(p, JSON.stringify(rec, null, 2));
    } catch { /* skip file errors */ }
  }
}

console.log(JSON.stringify({ event: 'worker_started', interval: SCAN_INTERVAL }));
setInterval(scanAndRetry, SCAN_INTERVAL);
