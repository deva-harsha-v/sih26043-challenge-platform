# ANTIGRAVITY Context & Architecture Guidelines

## Project Context
**SIH26043 Challenge Platform** is a full-stack digital web platform designed for Smart India Hackathon 2026. The platform bridges organizations (industry & government), universities, student/researcher contributors, and platform administrators. It facilitates problem statement publication, team discovery & formation, solution submission, and evaluation.

---

## 1. Stack Architecture & Core Decisions

### Frontend
- **Framework**: Next.js 14+ (App Router architecture)
- **Language**: TypeScript (Strict typing required for all props, APIs, and state)
- **Styling**: Tailwind CSS
- **Authentication**: JWT client state management with NextAuth / persistent session headers
- **Directory**: `/frontend`

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **ORM / Querying**: SQLAlchemy 2.0+ & Alembic migrations
- **Validation**: Pydantic v2 schemas
- **Auth**: JWT tokens (RS256/HS256) with password hashing using bcrypt (`passlib`)
- **Directory**: `/backend`

### Database
- **Engine**: PostgreSQL 15+
- **Canonical Reference**: `db/schema.sql` (All database model updates in Python must maintain 1:1 fidelity with `db/schema.sql`)
- **Directory**: `/db`

---

## 2. Role-Based Access Control (RBAC)

The platform supports 4 explicit user roles defined in the `user_role` Enum:

1. **`organization`**:
   - Industry or government entity publishing real-world challenge statements.
   - Can create, edit, and manage challenge postings.
   - Can view submissions, evaluate team proposals, and award solution status.

2. **`university`**:
   - Academic institution monitoring participating student teams and researchers.
   - Can manage university member verifications, view university leaderboards, and sponsor student teams.

3. **`contributor`**:
   - Student, researcher, or developer team member.
   - Can discover challenges, create/join teams based on skill profiles, submit project repositories & demo links.

4. **`admin`**:
   - Platform administrator.
   - Full system access: user verification, challenge moderation, skill catalog management, platform metrics.

---

## 3. Database & Schema Conventions

- **Naming**: `snake_case` for all table names and column names.
- **Primary Keys**: Explicit `id` column (UUID or Auto-increment Integer).
- **Foreign Keys**: Named explicitly as `<target_table_singular>_id` with `ON DELETE CASCADE` or `ON DELETE SET NULL` as appropriate.
- **Timestamp Tracking**: Every entity table must include `created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP` and `updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`.
- **Enums**:
  - Roles (`user_role`): `organization`, `university`, `contributor`, `admin`
  - Challenge Status (`challenge_status`): `draft`, `open`, `active`, `submission`, `review`, `completed`
  - Submission Status (`submission_status`): `submitted`, `under_review`, `shortlisted`, `accepted`, `rejected`
- **Core Entities & Tables**:
  - `users` (`id`, `email`, `password_hash`, `full_name`, `role`, `avatar_url`, `bio`, `created_at`, `updated_at`)
  - `organizations` (`id`, `user_id`, `name`, `website`, `description`, `logo_url`, `location`, `focus_area`, `created_at`)
  - `universities` (`id`, `user_id`, `name`, `description`, `location`, `domain`, `logo_url`, `focus_area`, `created_at`)
  - `challenges` (`id`, `organization_id`, `title`, `description`, `problem_statement`, `category`, `reward`, `difficulty`, `max_team_size`, `status`, `deadline`, `created_at`, `updated_at`)
  - `skills` (`id`, `name`, `category`)
  - `challenge_skills` (`id`, `challenge_id`, `skill_id`)
  - `teams` (`id`, `leader_id`, `challenge_id`, `name`, `description`, `created_at`, `updated_at`)
  - `team_members` (`id`, `team_id`, `user_id`, `role_in_team`, `joined_at`)
  - `submissions` (`id`, `challenge_id`, `team_id`, `title`, `description`, `document_url`, `status`, `reviewer_notes`, `created_at`, `updated_at`, `reviewed_at`)

---

## 4. Implementation Phase Priorities

Future development tasks MUST strictly follow the phased roadmap below:

- **Phase 1: Scaffolding & Canonical Database Setup** *(Completed)*
- **Phase 2: Authentication & RBAC Middleware** *(Completed)*
- **Phase 3: Challenge Management & Profiles** *(Completed)*
- **Phase 4: Team Formation & Matching Service** *(Current)*
  - Team creation, membership management, leader promotion cascade, one-team-per-challenge constraint, Next.js team pages.
- **Phase 5: Submissions & Evaluation Pipeline**
  - Solution submissions, repo/demo attachments, evaluator scoring interfaces.

---

## 5. Development Code Rules for AI Agents

1. **Preserve Contracts**: Do not break existing API route signatures or database table structures without updating all dependent modules.
2. **Minimal & Clean**: Maintain separation of concerns — FastAPI routes handle request parsing/response serialization, services handle business logic, models handle persistence.
3. **TypeScript Types**: Maintain exact parity between Pydantic schemas in `/backend/schemas` and TypeScript interfaces in `/frontend/src/lib/types.ts`.
