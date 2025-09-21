class AudioProcessorOriginal {
    constructor({ transcriptionAPI, storage }) {
        this.transcriptionAPI = transcriptionAPI;
        this.storage = storage;
    }


    async processChunk(audioData) {
        const transcription = await this.transcriptionAPI.transcribe(audioData);
        await this.storage.save(transcription);
        return transcription.id;
    }
}


module.exports.AudioProcessorOriginal = AudioProcessorOriginal;


// Bug Report: "Sometimes transcriptions are lost, but not always"
// Logs show successful API calls but missing data in storage