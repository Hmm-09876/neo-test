class AudioProcessor {
  constructor({ transcriptionAPI, storage, maxRetries = 3, backoffMs = 50 }) {
    this.transcriptionAPI = transcriptionAPI;
    this.storage = storage;
    this.maxRetries = maxRetries;
    this.backoffMs = backoffMs;
  }

  async processChunk(audioData) {
    const transcription = await this.transcriptionAPI.transcribe(audioData);
    let lastErr;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const res = await this.storage.save(transcription);
        if (res) return transcription.id; // chỉ cần truthy
        lastErr = new Error('storage.save returned falsy');
      } catch (err) {
        lastErr = err;
      }
      await new Promise(r => setTimeout(r, this.backoffMs * attempt));
    }

    throw lastErr || new Error('Failed to save transcription');
  }
}

module.exports = AudioProcessor;
