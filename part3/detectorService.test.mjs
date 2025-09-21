// part3/__tests__/detectorService.test.js
import { DetectorService } from './detectorService.mjs';

test('detectTranscript returns partial results when some chunks fail', async () => {
  // detectorClient: success for chunk 0, fail for chunk 1
  const detectorClient = {
    detect: jest.fn()
      .mockResolvedValueOnce({ label: 'AI', score: 0.9 })    // chunk 0
      .mockRejectedValueOnce(new Error('ETIMEDOUT'))        // chunk 1
      .mockResolvedValueOnce({ label: 'Human', score: 0.2 }) // chunk 2 (if exists)
  };
  const svc = new DetectorService({ detectorClient, maxRequestsPerMinute: 100, maxRetries: 0 });

  const longText = 'a '.repeat(6000); // will split into 2 chunks
  const res = await svc.detectTranscript({ transcript: longText, idempotencyKeyBase: 'k' });

  expect(res.partial).toBe(true);
  expect(Array.isArray(res.chunks)).toBe(true);
  const fulfilled = res.chunks.filter(c => c.status === 'fulfilled');
  const rejected = res.chunks.filter(c => c.status === 'rejected');
  expect(fulfilled.length).toBeGreaterThan(0);
  expect(rejected.length).toBeGreaterThan(0);
});
