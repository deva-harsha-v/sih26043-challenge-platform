import sys
import os
from datetime import datetime, timezone, timedelta

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from db.database import engine, Base, SessionLocal
from models import user, organization, university, challenge, team, submission, skill
from services.auth_service import get_password_hash

def run_seed():
    print("[INFO] Initializing Database Schema & Seeding Data...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        existing_users = db.query(user.User).count()
        if existing_users > 0:
            print(f"[INFO] Database already contains {existing_users} users. Clearing existing data for fresh seed...")
            db.query(submission.Submission).delete()
            db.query(team.TeamMember).delete()
            db.query(team.Team).delete()
            db.query(challenge.challenge_skills).delete()
            db.query(challenge.Challenge).delete()
            db.query(skill.Skill).delete()
            db.query(organization.Organization).delete()
            db.query(university.University).delete()
            db.query(user.User).delete()
            db.commit()

        # Shared Hashed Password ("password123")
        demo_password_hash = get_password_hash("password123")

        # 1. Skills
        skills_data = [
            ("Python", "Programming"),
            ("Computer Vision", "AI/ML"),
            ("Machine Learning", "AI/ML"),
            ("Robotics", "Hardware/Engineering"),
            ("PyTorch", "AI/ML"),
            ("C++", "Programming"),
            ("IoT", "Hardware/Engineering"),
            ("Embedded Systems", "Hardware/Engineering"),
            ("Data Analytics", "Data Science"),
            ("Biomedical Engineering", "Healthcare"),
        ]
        skills_objs = []
        for name, category in skills_data:
            s = skill.Skill(name=name, category=category)
            db.add(s)
            skills_objs.append(s)
        db.commit()
        print("  - Created 10 Skills")

        # 2. Users & Profiles

        # Org 1: Apex Robotics
        u_apex = user.User(
            email="apex_org@example.com",
            password_hash=demo_password_hash,
            full_name="Apex Robotics Corp",
            role="organization",
            avatar_url="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200",
            bio="Leading autonomous drone & industrial robotics R&D laboratory."
        )
        db.add(u_apex)
        db.commit()
        org_apex = organization.Organization(
            user_id=u_apex.id,
            name="Apex Robotics Corp",
            website="https://apexrobotics.example.com",
            description="Leading autonomous drone & industrial robotics R&D laboratory delivering next-gen spatial navigation.",
            logo_url="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200",
            location="Austin, Texas, USA",
            focus_area="Autonomous Systems & Robotics"
        )
        db.add(org_apex)

        # Org 2: BioHealth Innovations
        u_bio = user.User(
            email="biohealth_org@example.com",
            password_hash=demo_password_hash,
            full_name="BioHealth Innovations",
            role="organization",
            avatar_url="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200",
            bio="Next-gen medtech & clinical diagnostics platform."
        )
        db.add(u_bio)
        db.commit()
        org_bio = organization.Organization(
            user_id=u_bio.id,
            name="BioHealth Innovations",
            website="https://biohealth.example.com",
            description="Pioneering early diagnostic tools and micro-fluidic health tracking devices.",
            logo_url="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200",
            location="Boston, MA, USA",
            focus_area="Medical Devices & Healthcare ML"
        )
        db.add(org_bio)

        # Org 3: EcoClean Tech
        u_eco = user.User(
            email="ecoclean_org@example.com",
            password_hash=demo_password_hash,
            full_name="EcoClean Tech Solutions",
            role="organization",
            avatar_url="https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=200",
            bio="Sustainable energy & smart grid solutions."
        )
        db.add(u_eco)
        db.commit()
        org_eco = organization.Organization(
            user_id=u_eco.id,
            name="EcoClean Tech Solutions",
            website="https://ecoclean.example.com",
            description="Developing AI-driven energy optimization grid platforms for renewable energy integration.",
            logo_url="https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=200",
            location="Seattle, WA, USA",
            focus_area="Clean Energy & Smart Grids"
        )
        db.add(org_eco)

        # Uni 1: MIT
        u_mit = user.User(
            email="mit_admin@university.edu",
            password_hash=demo_password_hash,
            full_name="Metropolis Institute of Technology",
            role="university",
            avatar_url="https://images.unsplash.com/photo-1562774053-701939374585?w=200",
            bio="Premier global university for technological innovation and applied research."
        )
        db.add(u_mit)
        db.commit()
        uni_mit = university.University(
            user_id=u_mit.id,
            name="Metropolis Institute of Technology",
            description="World-class engineering research institution pioneering breakthrough robotics and quantum computing research.",
            location="Cambridge, MA, USA",
            domain="metropoltech.edu",
            logo_url="https://images.unsplash.com/photo-1562774053-701939374585?w=200",
            focus_area="Computer Science & AI Research"
        )
        db.add(uni_mit)

        # Uni 2: Stanford Innovation Labs
        u_stanford = user.User(
            email="stanford_admin@university.edu",
            password_hash=demo_password_hash,
            full_name="Stanford Innovation Labs",
            role="university",
            avatar_url="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200",
            bio="Hub for bioengineering and venture research."
        )
        db.add(u_stanford)
        db.commit()
        uni_stanford = university.University(
            user_id=u_stanford.id,
            name="Stanford Innovation Labs",
            description="Premier center for applied biological engineering, venture innovation, and AI medical applications.",
            location="Palo Alto, CA, USA",
            domain="stanford-innov.edu",
            logo_url="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200",
            focus_area="Bioengineering & Medical Systems"
        )
        db.add(uni_stanford)

        # Contributors (6 users)
        contributors = [
            ("alex_dev@example.com", "Alex Chen", "Autonomous systems researcher & ML engineer specializing in ROS2", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"),
            ("maria_eng@example.com", "Maria Santos", "Computer vision algorithmist and PyTorch model optimization expert", "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200"),
            ("david_kim@example.com", "David Kim", "Embedded Systems architect & firmware specialist", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"),
            ("priya_sharma@example.com", "Priya Sharma", "Biomedical data scientist and clinical machine learning developer", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200"),
            ("lucas_v@example.com", "Lucas Vance", "Backend infrastructure engineer & IoT data pipeline specialist", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200"),
            ("sarah_l@example.com", "Sarah Lin", "Biomedical hardware designer & signal processing lead", "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200"),
        ]

        contrib_objs = []
        for email, name, bio, avatar in contributors:
            u = user.User(
                email=email,
                password_hash=demo_password_hash,
                full_name=name,
                role="contributor",
                avatar_url=avatar,
                bio=bio
            )
            db.add(u)
            contrib_objs.append(u)
        
        db.commit()
        print("  - Created 3 Organizations, 2 Universities, 6 Contributors")

        # 3. Challenges (5 spanning statuses)
        now = datetime.now(timezone.utc)
        
        c1 = challenge.Challenge(
            organization_id=org_apex.id,
            title="Autonomous Drone Navigation & Obstacle Avoidance",
            description="Design a real-time spatial navigation algorithm for un-GPS aerial drones operating in dense indoor environments.",
            problem_statement="GPS-denied environments pose severe challenges for autonomous inspection drones. Build a visual-SLAM based navigation stack capable of avoiding dynamic obstacles at 5m/s speeds.",
            category="Robotics & AI",
            reward="$15,000 + R&D Sponsorship",
            difficulty="Hard",
            max_team_size=4,
            status="open",
            deadline=now + timedelta(days=30)
        )
        c1.skills = [skills_objs[1], skills_objs[3], skills_objs[5]] # CV, Robotics, C++

        c2 = challenge.Challenge(
            organization_id=org_bio.id,
            title="AI-Powered Early Cancer Detection Diagnostic Tool",
            description="Develop a deep learning model to detect early stage pancreatic lesions from low-dose CT scan images.",
            problem_statement="Early detection of pancreatic cancer remains a key clinical challenge. We seek multi-modal neural network architectures achieving >95% sensitivity with under 3% false positive rates.",
            category="Healthcare",
            reward="$25,000 + Clinical Partnership",
            difficulty="Hard",
            max_team_size=5,
            status="active",
            deadline=now + timedelta(days=15)
        )
        c2.skills = [skills_objs[0], skills_objs[2], skills_objs[4], skills_objs[9]] # Python, ML, PyTorch, Bio Eng

        c3 = challenge.Challenge(
            organization_id=org_eco.id,
            title="Smart Grid Load Balancing & Optimization",
            description="Build a real-time reinforcement learning model for microgrid energy distribution balancing.",
            problem_statement="Fluctuating renewable supply creates severe grid instability. Design an RL agent to optimize battery storage and demand load balancing across 10,000 simulated nodes.",
            category="Clean Energy",
            reward="$10,000 + Tech Incubation",
            difficulty="Medium",
            max_team_size=4,
            status="submission",
            deadline=now + timedelta(days=5)
        )
        c3.skills = [skills_objs[0], skills_objs[2], skills_objs[8]] # Python, ML, Data Analytics

        c4 = challenge.Challenge(
            organization_id=org_apex.id,
            title="Next-Gen Bio-Sensors for Wearable Health Monitors",
            description="Design low-power micro-fluidic sensor firmware for continuous non-invasive biomarker tracking.",
            problem_statement="Continuous physiological monitoring requires micro-power signal acquisition. Implement optical sensor algorithms running on ARM Cortex-M microcontrollers drawing <5mW.",
            category="Bioengineering",
            reward="$20,000 + Research Grant",
            difficulty="Hard",
            max_team_size=3,
            status="review",
            deadline=now - timedelta(days=2)
        )
        c4.skills = [skills_objs[6], skills_objs[7], skills_objs[9]] # IoT, Embedded, Bio Eng

        c5 = challenge.Challenge(
            organization_id=org_apex.id,
            title="Autonomous Warehouse Swarm Logistics",
            description="Develop decentralized swarm coordination algorithms for 500+ autonomous mobile robots in fulfillment centers.",
            problem_statement="High-density fulfillment centers experience bottlenecking during peak volume. Create dynamic pathfinding algorithms that prevent deadlock and optimize pick-and-pack throughput.",
            category="Logistics & AI",
            reward="$30,000 Commercialization Contract",
            difficulty="Hard",
            max_team_size=4,
            status="completed",
            deadline=now - timedelta(days=10)
        )
        c5.skills = [skills_objs[3], skills_objs[5], skills_objs[2]] # Robotics, C++, ML

        db.add_all([c1, c2, c3, c4, c5])
        db.commit()
        print("  - Created 5 Challenges across all statuses (open, active, submission, review, completed)")

        # 4. Form Teams (3 teams)
        t1 = team.Team(
            leader_id=contrib_objs[0].id, # Alex Chen
            challenge_id=c1.id,
            name="Alpha Aero Dynamics",
            description="Specialized team developing visual SLAM stacks and ROS2 navigation pipelines for UAVs."
        )
        db.add(t1)
        db.commit()
        m1_1 = team.TeamMember(team_id=t1.id, user_id=contrib_objs[0].id, role_in_team="Leader")
        m1_2 = team.TeamMember(team_id=t1.id, user_id=contrib_objs[1].id, role_in_team="Member") # Maria
        m1_3 = team.TeamMember(team_id=t1.id, user_id=contrib_objs[2].id, role_in_team="Member") # David
        db.add_all([m1_1, m1_2, m1_3])

        t2 = team.Team(
            leader_id=contrib_objs[3].id, # Priya Sharma
            challenge_id=c2.id,
            name="BioVision Analytics",
            description="Multidisciplinary research team combining biomedical data science with PyTorch deep learning models."
        )
        db.add(t2)
        db.commit()
        m2_1 = team.TeamMember(team_id=t2.id, user_id=contrib_objs[3].id, role_in_team="Leader")
        m2_2 = team.TeamMember(team_id=t2.id, user_id=contrib_objs[4].id, role_in_team="Member") # Lucas
        db.add_all([m2_1, m2_2])

        t3 = team.Team(
            leader_id=contrib_objs[5].id, # Sarah Lin
            challenge_id=c4.id,
            name="PulseTech Sensors",
            description="Embedded systems and micro-fluidics hardware engineering team focused on wearable medical diagnostics."
        )
        db.add(t3)
        db.commit()
        m3_1 = team.TeamMember(team_id=t3.id, user_id=contrib_objs[5].id, role_in_team="Leader")
        m3_2 = team.TeamMember(team_id=t3.id, user_id=contrib_objs[1].id, role_in_team="Member") # Maria
        db.add_all([m3_1, m3_2])

        db.commit()
        print("  - Formed 3 Teams with 7 total memberships")

        # 5. Submissions (2 submissions sitting in review / completed)
        s1 = submission.Submission(
            challenge_id=c4.id,
            team_id=t3.id,
            title="Ultra-Low Power Micro-Fluidic Sensor Array",
            description="A multi-spectral optical sensor array designed for non-invasive continuous biomarker tracking with <4.8mW power draw, featuring real-time noise reduction.",
            document_url="https://github.com/pulsetech/biosensor-spec",
            status="under_review",
            reviewer_notes="Exceptional power consumption metrics and signal-to-noise ratio. Preliminary benchmark results are extremely promising. Moving to final review panel.",
            reviewed_at=now - timedelta(days=1)
        )

        s2 = submission.Submission(
            challenge_id=c5.id,
            team_id=t1.id,
            title="Distributed Swarm Intelligence Pathfinding Engine",
            description="Decentralized consensus algorithm for dynamic obstacle re-routing across 500+ mobile warehouse robots, eliminating single points of failure.",
            document_url="https://github.com/alpha-aero/swarm-pathfinding",
            status="accepted",
            reviewer_notes="Winner of Challenge #5! Implemented flawless dynamic collision avoidance in high-density warehouse simulation tests with zero recorded deadlocks.",
            reviewed_at=now - timedelta(days=8)
        )

        db.add_all([s1, s2])
        db.commit()
        print("  - Created 2 Submissions in 'under_review' and 'accepted' states with reviewer notes")

        print("[SUCCESS] SEEDING COMPLETED SUCCESSFULLY!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
