export class AudioProcessor {
  constructor({ transcriptionAPI, storage, integrator } = {}) {
    if (!transcriptionAPI) throw new Error('transcriptionAPI required');
    if (!storage) throw new Error('storage required');
    this.transcriptionAPI = transcriptionAPI;
    this.storage = storage;
    this.integrator = integrator;
  }

  async processChunk(audioData, opts = {}) {
    const transcription = await this.transcriptionAPI.transcribe(audioData);
    await this.storage.save(transcription);
    const id = transcription.id;
    if (this.integrator) {
      const detectionInput = transcription.text || '';
      await this.integrator.run({ recordingId: id, transcript: detectionInput, idempotencyKeyBase: `det:${id}` });
    }
    return { id };
  }
}
