# SIH26043 Challenge Platform - Live Demo & Presentation Script

This script provides a step-by-step, click-by-click rehearsal walkthrough for **SIH26043 Challenge Platform** (Round 4 Pitch & Judge Evaluation). It maps directly to the 6-step problem statement lifecycle using pre-seeded real accounts.

---

## 🔑 Pre-Seeded Demo Credentials

> [!NOTE]
> All pre-seeded accounts share the default password: **`password123`**

| Role | Name | Email | Persona / Focus |
| :--- | :--- | :--- | :--- |
| **Organization** | Apex Robotics Corp | `apex_org@example.com` | Challenge Publisher (Autonomous Systems) |
| **Organization** | BioHealth Innovations | `biohealth_org@example.com` | Challenge Publisher (Healthcare ML) |
| **University** | MIT | `mit_admin@university.edu` | Academic Institution (AI Research) |
| **Contributor** | Alex Chen | `alex_dev@example.com` | Team Leader (Alpha Aero Dynamics) |
| **Contributor** | Sarah Lin | `sarah_l@example.com` | Team Leader (PulseTech Sensors) |
| **Contributor** | Maria Santos | `maria_eng@example.com` | Team Member / Computer Vision Specialist |

---

## 🚀 Environment Preparation

1. **Start Backend API** (Terminal 1):
   ```bash
   cd backend
   python seed.py        # Resets & seeds fresh demo data
   python main.py        # Runs FastAPI on http://localhost:8000
   ```

2. **Start Next.js Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev           # Runs Next.js on http://localhost:3000
   ```

---

## 🎬 6-Step Click-by-Click Demo Walkthrough

### Step 1: Institutional Discoverability & Challenge Posting

**Goal**: Show public institution profiles and owner challenge creation.

1. Open `http://localhost:3000` in browser.
2. Click **"Log In"** in the top navbar:
   - **Email**: `apex_org@example.com`
   - **Password**: `password123`
3. Click **"My Profile"** in the top navigation bar to land on `http://localhost:3000/profiles/org/1`.
   - **Show Judges**: Organization details (Austin, Texas, Autonomous Systems), posted challenges list, and the **"Edit Profile"** button.
4. Click **"Post Challenge"** (or Navigate to `http://localhost:3000/challenges/create`):
   - **Title**: `AI Spatial Perception Stack for Swarm Drones`
   - **Category**: `Robotics & AI`
   - **Difficulty**: `Hard`
   - **Reward**: `$20,000 + R&D Sponsorship`
   - **Problem Statement**: `GPS-denied spatial obstacle mapping algorithm for dynamic warehouse swarms.`
   - Click **"Create Challenge"**.
   - **Result**: Redirected to challenge detail page with `open` status badge.

---

### Step 2: Challenge Discovery & Skill Categorization

**Goal**: Demonstrate how contributors filter and discover industry/academic challenges.

1. Click **"Log Out"**, then log in as Contributor:
   - **Email**: `alex_dev@example.com`
   - **Password**: `password123`
2. Navigate to **"Challenges"** catalog (`http://localhost:3000/challenges`).
3. **Show Judges**:
   - Filter challenges by category: Select **"Healthcare"** or **"Robotics & AI"**.
   - Filter by status: View **"open"**, **"active"**, **"review"**, and **"completed"** challenges.
   - Click on Challenge: **"Autonomous Drone Navigation & Obstacle Avoidance"** (`/challenges/1`).
4. Point out required skills badges (`Computer Vision`, `Robotics`, `C++`) and publisher link to Apex Robotics profile.

---

### Step 3: Contributor Team Formation & Constraints

**Goal**: Showcase team creation, membership, and server-side RBAC guards.

1. On `/challenges/1` page (logged in as `alex_dev@example.com`):
   - Notice existing team **"Alpha Aero Dynamics"** formed by Alex Chen.
   - Click **"View Team"** (`http://localhost:3000/teams/1`).
2. **Show Judges**:
   - Leader badge next to Alex Chen.
   - Member roster (Maria Santos, David Kim).
   - Server guard enforcement: Attempting to join another team for Challenge #1 displays a clear error state ("Contributor already belongs to a team for this challenge").

---

### Step 4: Solution Submission & Resubmission Strategy

**Goal**: Submit team solution writeup and GitHub repository link.

1. On `/teams/1` page or navigating to submission panel:
   - **Title**: `Visual-SLAM Real-Time Navigation Stack v2.0`
   - **Description**: `Implementation of real-time stereo depth estimation and obstacle collision avoidance operating at 60 FPS on Jetson Orin Nano.`
   - **Document URL**: `https://github.com/alpha-aero/vslam-drone-stack`
   - Click **"Submit Solution"**.
2. **Show Judges**: Success confirmation and updated team submission preview. Resubmitting updates the existing submission record in-place cleanly.

---

### Step 5: Challenge Evaluation & Reviewer Scoring

**Goal**: Show how organization challenge owners evaluate and score submissions.

1. Log Out of `alex_dev@example.com` and Log In as Challenge Owner:
   - **Email**: `apex_org@example.com`
   - **Password**: `password123`
2. Navigate to `/challenges/4` (**"Next-Gen Bio-Sensors for Wearable Health Monitors"** - status `review`).
3. Click on the submission from **PulseTech Sensors** (`http://localhost:3000/submissions/1`).
4. **Show Judges**:
   - The Evaluator Panel is visible **ONLY** to the challenge owner organization.
   - Change Status Dropdown to **"shortlisted"**.
   - Enter Reviewer Notes:
     > `"Outstanding micro-fluidic signal acquisition architecture and ultra-low power consumption (<4.8mW). Selected for final stage live laboratory testing."`
   - Click **"Update Status"**.

---

### Step 6: Results Transparency & Public Outcome

**Goal**: Show final status reflection and public winning submission showcase.

1. Log in back as Contributor `sarah_l@example.com` (`password123`).
2. Navigate to `http://localhost:3000/submissions/1`.
3. **Show Judges**:
   - Status badge updated to **`shortlisted`** in amber/gold color.
   - Official Reviewer Notes and evaluation timestamp rendered clearly.
4. Navigate to Completed Challenge (`http://localhost:3000/challenges/5` - **"Autonomous Warehouse Swarm Logistics"**):
   - Show winning submission **`Distributed Swarm Intelligence Pathfinding Engine`** marked as **`accepted`** with official winner review notes.

---

## 🏆 Presentation Key Talking Points for Judges

1. **Full-Lifecycle Integrity**: "Unlike simple challenge portals, our platform enforces end-to-end relational constraints—from institutional identity and role-based permissions down to leader-member team dynamics and submission evaluations."
2. **Strict Server-Side Security**: "All critical business rules—such as team size caps, single-team-per-challenge rules, and evaluator control visibility—are guarded server-side via FastAPI RBAC dependencies and tested with 41 passing backend automated tests."
3. **Institutional Discoverability**: "Organizations and Universities have dedicated identity pages showcasing their ongoing research focus and open innovation challenges."
