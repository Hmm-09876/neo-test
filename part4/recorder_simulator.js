// recorder_simulator.js
import fs from 'fs/promises';
import path from 'path';
import { uploadWithRetry } from './storage.js';

const STORAGE_DIR = path.join('.', 'storage');
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function patchMeta(file, fn) {
  try {
    const obj = JSON.parse(await fs.readFile(file, 'utf8'));
    fn(obj);
    await fs.writeFile(file, JSON.stringify(obj, null, 2));
  } catch {}
}

export async function startRecording({ recordingId, durationSec = 60, chunkSec = 10, recMetaPath }) {
  const totalChunks = Math.ceil(durationSec / chunkSec);
  await patchMeta(recMetaPath, o => Object.assign(o, { status: 'recording', durationSec, chunkSec, totalChunks }));
  for (let idx = 0; idx < totalChunks; idx++) {
    const buf = Buffer.from(`chunk:${recordingId}:${idx}:${Date.now()}`);
    try {
      const res = await uploadWithRetry(recordingId, idx, buf);
      await patchMeta(recMetaPath, o => o.chunks.push({ index: idx, s3: res.url, status: 'uploaded', ts: new Date().toISOString() }));
    } catch (err) {
      await patchMeta(recMetaPath, o => o.chunks.push({ index: idx, status: 'upload_failed', err: err.message, ts: new Date().toISOString() }));
    }
    await sleep(process.env.DEMO_FAST !== 'false' ? 500 : chunkSec * 1000);
  }
  await patchMeta(recMetaPath, o => Object.assign(o, { status: 'finished', finished_at: new Date().toISOString() }));
}
