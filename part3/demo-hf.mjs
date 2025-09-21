import { HuggingFaceDetectorClient, DetectorService, createDetectionIntegrator, AudioProcessor, StorageMock, TranscriptionAPIMock } from './index.mjs';

(async () => {
    console.log('--- Combined demo ---');

    const storage = new StorageMock();
    const stt = new TranscriptionAPIMock();
    const HF_TOKEN = process.env.HF_API_TOKEN; // hoặc gán trực tiếp token
    const detectorClient = new HuggingFaceDetectorClient({
        apiToken: HF_TOKEN,
        model: 'roberta-base-openai-detector',
        provider: 'auto',
        });
    const detectorService = new DetectorService({ detectorClient, maxRequestsPerMinute: 10, maxRetries: 3, baseBackoffMs: 100 });
    const integrator = createDetectionIntegrator({ detectorService, storage });
    const processor = new AudioProcessor({ transcriptionAPI: stt, storage, integrator });

    for (let i = 0; i < 3; i++) {
        const res = await processor.processChunk(Buffer.from(`audio-${i}`));
        console.log('processChunk result:', JSON.stringify(res, null, 2));
    }

    console.log('\nPersisted storage snapshot:');
    console.log(JSON.stringify(storage.all(), null, 2));

    console.log('\nDemo complete.');
})();
