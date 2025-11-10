# Jenkins Declarative Pipeline for Smart Stays

This document maps the classic Build → Test → Deploy stages to your hotel booking application (React frontend + Node/Express backend) and shows the exact commands each stage runs.

## Contract

- Inputs: Source code from this repo
- Outputs: Built frontend assets (dist), published Docker images (frontend and backend)
- Success: All stages finish, images pushed to Docker Hub
- Failure modes: NPM install errors, build errors, Docker permission issues, missing Jenkins Node tool or Docker Hub credentials

## Stages

### 1) Build

- Frontend
  - `npm ci || npm install`
  - `npm run build` (Vite produces `frontend/dist`)
  - Archive `dist/**` for inspection
- Backend
  - `npm ci || npm install`

### 2) Test

- Frontend tests: `npm test -- --watchAll=false` (non-blocking by default until tests exist)
- Backend tests: `npm test` (non-blocking by default)

### 3) Deploy

- Build Docker images using existing Dockerfiles
  - `docker build -t <dockeruser>/smartstays-frontend:latest ./frontend`
  - `docker build -t <dockeruser>/smartstays-backend:latest  ./backend`
- Push images to Docker Hub (requires Jenkins credential id `dockerhub`)
  - `docker push <dockeruser>/smartstays-frontend:latest`
  - `docker push <dockeruser>/smartstays-backend:latest`

## Requirements in Jenkins

- Manage Jenkins → Tools: NodeJS installation named `node22`
- Jenkins agent user in `docker` group and service restarted
- Credentials: `dockerhub` (username/password or token)

## Files

- `Jenkinsfile` → full pipeline with commit tagging and labels
- `Jenkinsfile.simple` → minimal Build/Test/Deploy example

## Troubleshooting

- Docker permission denied: `sudo usermod -aG docker jenkins && sudo systemctl restart jenkins`
- Node tool missing: add NodeJS `node22` in Global Tool Configuration
- Private repo checkout: add `github_pat` (Secret text) and select it in job
