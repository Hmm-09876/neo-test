const AudioProcessor = require('./AudioProcessor');
const { AudioProcessorOriginal } = require('./AudioProcessor.original');

// Mock STT that always returns a transcription object
class TranscriptionAPIMock {
  constructor(id, text) { this.id = id; this.text = text; }
  transcribe = async () => ({ id: this.id, text: this.text });
}

// Storage mock:
// - if failTimes > 0: first N calls resolve(undefined) (silent failure), then succeed
// - if failTimes === Infinity: always resolve(undefined) (permanent silent failure)
class StorageMock {
  constructor(failTimes = 0) { this.failTimes = failTimes; this.calls = 0; this.store = []; }
  save = async t => {
    this.calls++;
    if (this.failTimes === Infinity) return;
    if (this.calls <= this.failTimes) return;
    this.store.push(t); return true;
  }
}

describe('AudioProcessor compare Original vs Fixed', () => {
  test('A: storage always fails', async () => {
    const stt = new TranscriptionAPIMock('id-A', 'A');
    const storage = new StorageMock(Infinity);
    const orig = new AudioProcessorOriginal({ transcriptionAPI: stt, storage });
    const fixed = new AudioProcessor({ transcriptionAPI: stt, storage, maxRetries: 2, backoffMs: 1 });

    // ORIGINAL: will await storage.save (which resolves undefined) and then return id -> bug reproduction
    expect(await orig.processChunk(Buffer.from('audio'))).toBe('id-A');
    expect(storage.store).toHaveLength(0);

    // FIX: should retry and then throw after exhausting retries, not silently succeed
    await expect(fixed.processChunk(Buffer.from('audio'))).rejects.toThrow();
    expect(storage.store).toHaveLength(0);
  });

  test('B: storage fails twice then succeeds', async () => {
    const stt = new TranscriptionAPIMock('id-B', 'B');
    const storage = new StorageMock(2);
    const orig = new AudioProcessorOriginal({ transcriptionAPI: stt, storage });
    const fixed = new AudioProcessor({ transcriptionAPI: stt, storage, maxRetries: 5, backoffMs: 1 });

    // ORIGINAL: only calls save once -> it sees undefined then returns id -> storage remains empty => bug
    expect(await orig.processChunk(Buffer.from('audio'))).toBe('id-B');
    expect(storage.store).toHaveLength(0);

    // FIX: will retry until success and store saved transcription
    expect(await fixed.processChunk(Buffer.from('audio'))).toBe('id-B');
    expect(storage.store).toHaveLength(1);
  });

  test('C: storage succeeds immediately', async () => {
    const stt = new TranscriptionAPIMock('id-C', 'C');
    const storage = new StorageMock(0);
    const orig = new AudioProcessorOriginal({ transcriptionAPI: stt, storage });
    const fixed = new AudioProcessor({ transcriptionAPI: stt, storage, maxRetries: 3, backoffMs: 1 });

    expect(await orig.processChunk(Buffer.from('audio'))).toBe('id-C');
    expect(await fixed.processChunk(Buffer.from('audio'))).toBe('id-C');

    expect(storage.store).toHaveLength(2);
  });
});
