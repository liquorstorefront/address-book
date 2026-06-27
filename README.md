# Address Book

Minimal Docker-based starter for a personal Address Book web app.

## Architecture

- React/Vite frontend in a Docker container
- FastAPI backend in a Docker container
- PostgreSQL database in a Docker container with a persistent Docker volume

No Node.js, Python, PostgreSQL, npm packages, or app runtimes need to be installed directly on the host Mac.

## Run

```bash
docker compose up --build
```

## Test

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- FastAPI docs: http://localhost:8000/docs
