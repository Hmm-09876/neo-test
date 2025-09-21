// index.js - minimal server Part4
import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { startRecording } from './recorder_simulator.js';
import { deleteRecording, setSimulateFailChance } from './storage.js';

const DATA_DIR = path.join('.', 'data');
const RECORDINGS_DIR = path.join(DATA_DIR, 'recordings');
await fs.mkdir(RECORDINGS_DIR, { recursive: true });
await fs.mkdir(path.join('.', 'storage'), { recursive: true });

const app = express();
app.use(express.json());
const log = obj => console.log(JSON.stringify(obj));

// Health
app.get('/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }));

// Readiness
app.get('/ready', async (req, res) => {
  try {
    const testPath = path.join('.', 'storage', `.ready-${Date.now()}`);
    await fs.writeFile(testPath, 'ok'); await fs.unlink(testPath);
    res.json({ ready: true });
  } catch (e) { res.status(503).json({ ready: false, reason: e.message }); }
});

// Start recording
app.post('/recordings', async (req, res) => {
  const { recordingId, durationSec = 60, chunkSec = 10, simulateFailChance = 0 } = req.body || {};
  if (!recordingId) return res.status(400).json({ error: 'recordingId required' });
  const recMetaPath = path.join(RECORDINGS_DIR, `${recordingId}.json`);
  await fs.writeFile(recMetaPath, JSON.stringify({ id: recordingId, status: 'starting', created_at: new Date().toISOString(), chunks: [] }, null, 2));
  setSimulateFailChance(Number(simulateFailChance) || 0);
  startRecording({ recordingId, durationSec: Number(durationSec), chunkSec: Number(chunkSec), recMetaPath })
    .then(() => log({ event: 'recording_finished', recordingId }))
    .catch(err => log({ event: 'recording_error', recordingId, err: err.message }));
  res.status(202).json({ ok: true, recordingId });
});

// View recording
app.get('/recordings/:id', async (req, res) => {
  try { res.json(JSON.parse(await fs.readFile(path.join(RECORDINGS_DIR, `${req.params.id}.json`), 'utf8'))); }
  catch (e) { res.status(404).json({ error: 'not found' }); }
});

// Delete recording
app.delete('/recordings/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const recMetaPath = path.join(RECORDINGS_DIR, `${id}.json`);
    const rec = JSON.parse(await fs.readFile(recMetaPath, 'utf8'));
    rec.status = 'deleting'; await fs.writeFile(recMetaPath, JSON.stringify(rec, null, 2));
    await deleteRecording(id); await fs.unlink(recMetaPath);
    log({ event: 'deleted', recordingId: id });
    res.json({ ok: true, message: 'deleted' });
  } catch (e) { res.status(404).json({ error: 'not found or delete failed', detail: e.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => log({ event: 'server_started', port: Number(PORT) }));
