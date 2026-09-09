# SIH26043 Challenge Platform

A full-stack web platform built for Smart India Hackathon 2026 (SIH26043). The digital platform enables organizations and universities to publish real-world challenges while student and researcher teams discover challenges, form multidisciplinary teams, and submit innovative solutions.

## Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, TailwindCSS
- **Backend**: FastAPI (Python), Pydantic, SQLAlchemy
- **Database**: PostgreSQL (Managed with Alembic, canonical reference `db/schema.sql`)
- **Authentication**: JWT-based with Role-Based Access Control (Roles: `organization`, `university`, `contributor`, `admin`)

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- Node.js (v18+) & npm/pnpm (for local frontend dev)
- Python 3.10+ (for local backend dev)

### Running Locally with Docker Compose

1. Clone the repository:
   ```bash
   git clone https://github.com/deva-harsha-v/sih26043-challenge-platform.git
   cd sih26043-challenge-platform
   ```

2. Start the services using Docker Compose:
   ```bash
   docker-compose up --build
   ```

3. Access the applications:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **PostgreSQL**: `localhost:5432` (Database: `sih_challenge_db`)

## Project Structure

- `frontend/`: Next.js App Router frontend codebase.
- `backend/`: FastAPI backend service with models, schemas, and routes.
- `db/`: SQL schema definitions (`schema.sql`) and seed data (`seed_data.sql`).
- `docs/`: System documentation and demo scripts.
