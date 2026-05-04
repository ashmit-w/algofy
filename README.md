# Algofy

## Prerequisites

**Redis** — used as the job queue broker (BullMQ).
```bash
docker run -d -p 6379:6379 redis
```

**Docker** — used by the worker to run submitted code in sandboxed containers. Make sure Docker Desktop is running, then pull the required image:
```bash
docker pull node:20-alpine
```

## Running the project

Each service runs independently. Open a terminal for each.

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

**Backend**
```bash
cd backend
npm install
npm run dev
```

**Worker**
```bash
cd worker
npm install
node worker.js
```
