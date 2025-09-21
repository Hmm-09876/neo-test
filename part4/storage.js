// storage.js - local storage + retry
import fs from 'fs/promises';
import path from 'path';

const BASE = path.join('.', 'storage');
let FAIL_CHANCE = 0;

export const setSimulateFailChance = c => (FAIL_CHANCE = Number(c) || 0);

async function write(dest, buf) {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, buf);
  return dest;
}

async function uploadOnce(id, idx, buf) {
  if (FAIL_CHANCE > 0 && Math.random() < FAIL_CHANCE) {
    const e = new Error('simulated-upload-failure');
    e.isTransient = true;
    throw e;
  }
  const fname = `${id}-${idx}.bin`;
  const dest = path.join(BASE, fname);
  await write(dest, buf);
  return { url: `local://storage/${fname}`, path: dest };
}

export async function uploadWithRetry(id, idx, buf, maxRetries = 3) {
  let lastErr;
  for (let a = 1; a <= maxRetries; a++) {
    try {
      return await uploadOnce(id, idx, buf);
    } catch (err) {
      lastErr = err;
      const transient = err.isTransient || /transient|ETIMEDOUT|ECONNRESET|429/i.test(err.message || '');
      if (!transient) break;
      const delay = 200 * 2 ** (a - 1) + Math.floor(Math.random() * 50);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastErr || new Error('upload failed');
}

export async function deleteRecording(id) {
  const files = await fs.readdir(BASE).catch(() => []);
  const del = files.filter(f => f.startsWith(id + '-'));
  await Promise.all(del.map(f => fs.unlink(path.join(BASE, f)).catch(() => {})));
  return { deleted: del.length };
}

