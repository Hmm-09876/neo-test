export function createDetectionIntegrator({ detectorService, storage }) {
  if (!detectorService) throw new Error('detectorService required');
  if (!storage) throw new Error('storage required');

  return {
    async run({ recordingId, transcript, idempotencyKeyBase = null }) {
      const idemp = idempotencyKeyBase || `rec:${recordingId}`;

      // mark started (best-effort)
      try { await storage.saveMetadata(recordingId, { detectionStatus: 'started', detectionStartedAt: new Date().toISOString() }); } 
      catch {}

      try {
        const detection = await detectorService.detectTranscript({ transcript, idempotencyKeyBase: idemp });

        // Save detection results
        try { await storage.saveDetection({ recordingId, detection }); } 
        catch {}

        // Update metadata: done / partial
        const status = detection.partial ? 'partial' : 'done';
        try {
          await storage.saveMetadata(recordingId, { detectionStatus: status, detectionCompletedAt: new Date().toISOString(), detectionSummary: detection.aggregated });
        } catch {}

        return { ok: true, detection };
      } catch (err) {
        // On complete failure
        try { await storage.saveMetadata(recordingId, { detectionStatus: 'error', detectionError: err.message || String(err), detectionCompletedAt: new Date().toISOString() }); } 
        catch {}
        return { ok: false, error: err };
      }
    }
  };
}
