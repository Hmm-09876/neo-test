# Part 4 — Minimal Recorder + Health + Storage (local demo)

## Missing

**Reliability**
- Durable queue for chunk uploads + idempotency for retries.
- Retry with exponential backoff (with cap).

**Scalability**
- Use a browser pool instead of spawning a new browser each time.
- Separate upload workers and autoscale them (HPA); add resource requests/limits.

**Monitoring**
- Expose basic Prometheus metrics and readiness/health checks.

**Security**
- Store secrets in K8s Secrets; use TLS and presigned URLs for uploads.

---
## **Objective**: Provide a minimal demo that demonstrates the `InterviewRecorder` workflow:
- chunk audio -> upload with retry -> checkpoint metadata -> retry worker
- health & readiness endpoints
- delete API

This version uses **local storage** and **file metadata** for easy immediate execution.

---
## Quick start (local)

1. **Install dependencies**
```bash
npm install
```

2. **Create .env file from template and configure (DO NOT commit .env)**
```bash
cp .env.example .env
```

3. **Start server:**
```bash
node index.js
```
Server listens on PORT from .env or defaults to 3000.

4. **Check health / ready:**
```bash
curl http://localhost:3000/health
curl http://localhost:3000/ready
```

5. **Start recording (simulated background job):**
```bash
curl -X POST http://localhost:3000/recordings \
  -H "Content-Type: application/json" \
  -d '{"recordingId":"r1","durationSec":30,"chunkSec":5,"simulateFailChance":0.2}'
```
`simulateFailChance` = rate (0..1) to simulate upload failures for testing retry.
`DEMO_FAST=true` in .env makes recorder run fast (500ms/chunk) for demo.

6. **View metadata:**
```bash
curl http://localhost:3000/recordings/r1 | jq .
# or cat data/recordings/r1.json
```

7. **View storage files:**
```bash
ls storage
```

8. **Run background worker (retry failed chunks) in another terminal:**
```bash
npm run worker
```

9. **Delete recording:**
```bash
curl -X DELETE http://localhost:3000/recordings/r1
```

## Docker (local test)

**Build & run with Docker Compose (detached):**
```bash
docker compose up --build -d
```

Check endpoints and operations as in the Local section.

## Kubernetes (minimal)

**Before applying, create Secret for token if using real HF:**
```bash
kubectl create secret generic hf-secret --from-literal=token="$HF_API_TOKEN"
```

**Apply manifest (file: k8s/deployment.yaml):**
```bash
docker build -t neo-part4:latest .
kind load docker-image neo-part4:latest --name demo-cluster
kubectl apply -f k8s/deployment.yaml
kubectl rollout status deployment/neo-recorder
kubectl get pods -l app=neo-recorder
```

**Rollback:**
```bash
kubectl rollout undo deployment/neo-recorder
```

## Main testing (test cases)

- **Retry logic**: set `SIMULATE_FAIL_CHANCE=0.5`, start recording, check metadata has `upload_failed`, then run `npm run worker` to retry.
- **Readiness**: change storage/ directory permissions to readonly to check `/ready` returns 503.
- **Delete**: perform `DELETE /recordings/:id` and verify files in storage/ are deleted.

## Security & config notes (important)

- **DO NOT commit** `HF_API_TOKEN` or `.env` file. `.env.example` provides guidance.
- Use **Secrets** (k8s/GCP/AWS) for production.
- `SIMULATE_FAIL_CHANCE` is for development only.
- `DEMO_FAST` is for demo only — set false or remove in production.
