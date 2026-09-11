-- SIH26043 Challenge Platform - Seed Data Script
-- Populates demo environment with realistic organizations, universities, contributors, challenges, teams, and submissions.
-- All user accounts share default password: "password123"

-- 1. Insert Skills
INSERT INTO skills (id, name, category) VALUES
(1, 'Python', 'Programming'),
(2, 'Computer Vision', 'AI/ML'),
(3, 'Machine Learning', 'AI/ML'),
(4, 'Robotics', 'Hardware/Engineering'),
(5, 'PyTorch', 'AI/ML'),
(6, 'C++', 'Programming'),
(7, 'IoT', 'Hardware/Engineering'),
(8, 'Embedded Systems', 'Hardware/Engineering'),
(9, 'Data Analytics', 'Data Science'),
(10, 'Biomedical Engineering', 'Healthcare')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Users (Password for all: "password123" -> hash: $2b$12$8aJ4nSUSNzK6HVjCsDvd3.cCggrRDE1PKvWGVfS6eUQ3PoyKyu6LS)

-- Organization Users
INSERT INTO users (id, email, password_hash, full_name, role, avatar_url, bio) VALUES
(1, 'apex_org@example.com', '$2b$12$8aJ4nSUSNzK6HVjCsDvd3.cCggrRDE1PKvWGVfS6eUQ3PoyKyu6LS', 'Apex Robotics Corp', 'organization', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200', 'Leading autonomous drone & industrial robotics R&D laboratory'),
(2, 'biohealth_org@example.com', '$2b$12$8aJ4nSUSNzK6HVjCsDvd3.cCggrRDE1PKvWGVfS6eUQ3PoyKyu6LS', 'BioHealth Innovations', 'organization', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200', 'Next-gen medtech & clinical diagnostics platform'),
(3, 'ecoclean_org@example.com', '$2b$12$8aJ4nSUSNzK6HVjCsDvd3.cCggrRDE1PKvWGVfS6eUQ3PoyKyu6LS', 'EcoClean Tech Solutions', 'organization', 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=200', 'Sustainable energy & smart grid solutions')
ON CONFLICT (id) DO NOTHING;

-- University Users
INSERT INTO users (id, email, password_hash, full_name, role, avatar_url, bio) VALUES
(4, 'mit_admin@university.edu', '$2b$12$8aJ4nSUSNzK6HVjCsDvd3.cCggrRDE1PKvWGVfS6eUQ3PoyKyu6LS', 'Metropolis Institute of Technology', 'university', 'https://images.unsplash.com/photo-1562774053-701939374585?w=200', 'Premier global university for technological innovation and applied research'),
(5, 'stanford_admin@university.edu', '$2b$12$8aJ4nSUSNzK6HVjCsDvd3.cCggrRDE1PKvWGVfS6eUQ3PoyKyu6LS', 'Stanford Innovation Labs', 'university', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200', 'Hub for bioengineering and venture research')
ON CONFLICT (id) DO NOTHING;

-- Contributor Users
INSERT INTO users (id, email, password_hash, full_name, role, avatar_url, bio) VALUES
(6, 'alex_dev@example.com', '$2b$12$8aJ4nSUSNzK6HVjCsDvd3.cCggrRDE1PKvWGVfS6eUQ3PoyKyu6LS', 'Alex Chen', 'contributor', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200', 'Autonomous systems researcher & ML engineer specializing in ROS2'),
(7, 'maria_eng@example.com', '$2b$12$8aJ4nSUSNzK6HVjCsDvd3.cCggrRDE1PKvWGVfS6eUQ3PoyKyu6LS', 'Maria Santos', 'contributor', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200', 'Computer vision algorithmist and PyTorch model optimization expert'),
(8, 'david_kim@example.com', '$2b$12$8aJ4nSUSNzK6HVjCsDvd3.cCggrRDE1PKvWGVfS6eUQ3PoyKyu6LS', 'David Kim', 'contributor', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', 'Embedded Systems architect & firmware specialist'),
(9, 'priya_sharma@example.com', '$2b$12$8aJ4nSUSNzK6HVjCsDvd3.cCggrRDE1PKvWGVfS6eUQ3PoyKyu6LS', 'Priya Sharma', 'contributor', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', 'Biomedical data scientist and clinical machine learning developer'),
(10, 'lucas_v@example.com', '$2b$12$8aJ4nSUSNzK6HVjCsDvd3.cCggrRDE1PKvWGVfS6eUQ3PoyKyu6LS', 'Lucas Vance', 'contributor', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', 'Backend infrastructure engineer & IoT data pipeline specialist'),
(11, 'sarah_l@example.com', '$2b$12$8aJ4nSUSNzK6HVjCsDvd3.cCggrRDE1PKvWGVfS6eUQ3PoyKyu6LS', 'Sarah Lin', 'contributor', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200', 'Biomedical hardware designer & signal processing lead')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Organization Profiles
INSERT INTO organizations (id, user_id, name, website, description, logo_url, location, focus_area) VALUES
(1, 1, 'Apex Robotics Corp', 'https://apexrobotics.example.com', 'Leading autonomous drone & industrial robotics R&D laboratory delivering next-gen spatial navigation.', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200', 'Austin, Texas, USA', 'Autonomous Systems & Robotics'),
(2, 2, 'BioHealth Innovations', 'https://biohealth.example.com', 'Pioneering early diagnostic tools and micro-fluidic health tracking devices.', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200', 'Boston, MA, USA', 'Medical Devices & Healthcare ML'),
(3, 3, 'EcoClean Tech Solutions', 'https://ecoclean.example.com', 'Developing AI-driven energy optimization grid platforms for renewable energy integration.', 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=200', 'Seattle, WA, USA', 'Clean Energy & Smart Grids')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert University Profiles
INSERT INTO universities (id, user_id, name, description, location, domain, logo_url, focus_area) VALUES
(1, 4, 'Metropolis Institute of Technology', 'World-class engineering research institution pioneering breakthrough robotics and quantum computing research.', 'Cambridge, MA, USA', 'metropoltech.edu', 'https://images.unsplash.com/photo-1562774053-701939374585?w=200', 'Computer Science & AI Research'),
(2, 5, 'Stanford Innovation Labs', 'Premier center for applied biological engineering, venture innovation, and AI medical applications.', 'Palo Alto, CA, USA', 'stanford-innov.edu', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200', 'Bioengineering & Medical Systems')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Challenges (Spanning statuses: open, active, submission, review, completed)
INSERT INTO challenges (id, organization_id, title, description, problem_statement, category, reward, difficulty, max_team_size, status, deadline) VALUES
(1, 1, 'Autonomous Drone Navigation & Obstacle Avoidance', 'Design a real-time spatial navigation algorithm for un-GPS aerial drones operating in dense indoor environments.', 'GPS-denied environments pose severe challenges for autonomous inspection drones. Build a visual-SLAM based navigation stack capable of avoiding dynamic obstacles at 5m/s speeds.', 'Robotics & AI', '$15,000 + R&D Sponsorship', 'Hard', 4, 'open', CURRENT_TIMESTAMP + INTERVAL '30 days'),
(2, 2, 'AI-Powered Early Cancer Detection Diagnostic Tool', 'Develop a deep learning model to detect early stage pancreatic lesions from low-dose CT scan images.', 'Early detection of pancreatic cancer remains a key clinical challenge. We seek multi-modal neural network architectures achieving >95% sensitivity with under 3% false positive rates.', 'Healthcare', '$25,000 + Clinical Partnership', 'Hard', 5, 'active', CURRENT_TIMESTAMP + INTERVAL '15 days'),
(3, 3, 'Smart Grid Load Balancing & Optimization', 'Build a real-time reinforcement learning model for microgrid energy distribution balancing.', 'Fluctuating renewable supply creates severe grid instability. Design an RL agent to optimize battery storage and demand load balancing across 10,000 simulated nodes.', 'Clean Energy', '$10,000 + Tech Incubation', 'Medium', 4, 'submission', CURRENT_TIMESTAMP + INTERVAL '5 days'),
(4, 1, 'Next-Gen Bio-Sensors for Wearable Health Monitors', 'Design low-power micro-fluidic sensor firmware for continuous non-invasive biomarker tracking.', 'Continuous physiological monitoring requires micro-power signal acquisition. Implement optical sensor algorithms running on ARM Cortex-M microcontrollers drawing <5mW.', 'Bioengineering', '$20,000 + Research Grant', 'Hard', 3, 'review', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(5, 1, 'Autonomous Warehouse Swarm Logistics', 'Develop decentralized swarm coordination algorithms for 500+ autonomous mobile robots in fulfillment centers.', 'High-density fulfillment centers experience bottlenecking during peak volume. Create dynamic pathfinding algorithms that prevent deadlock and optimize pick-and-pack throughput.', 'Logistics & AI', '$30,000 Commercialization Contract', 'Hard', 4, 'completed', CURRENT_TIMESTAMP - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- Map Challenge Skills
INSERT INTO challenge_skills (challenge_id, skill_id) VALUES
(1, 2), (1, 4), (1, 6), -- Drone: Computer Vision, Robotics, C++
(2, 1), (2, 3), (2, 5), (2, 10), -- Cancer Detection: Python, ML, PyTorch, Bio Eng
(3, 1), (3, 3), (3, 9), -- Smart Grid: Python, ML, Data Analytics
(4, 7), (4, 8), (4, 10), -- Bio-Sensors: IoT, Embedded, Bio Eng
(5, 4), (5, 6), (5, 3) -- Swarm: Robotics, C++, ML
ON CONFLICT DO NOTHING;

-- 6. Insert Teams
INSERT INTO teams (id, leader_id, challenge_id, name, description) VALUES
(1, 6, 1, 'Alpha Aero Dynamics', 'Specialized team developing visual SLAM stacks and ROS2 navigation pipelines for UAVs.'),
(2, 9, 2, 'BioVision Analytics', 'Multidisciplinary research team combining biomedical data science with PyTorch deep learning models.'),
(3, 11, 4, 'PulseTech Sensors', 'Embedded systems and micro-fluidics hardware engineering team focused on wearable medical diagnostics.')
ON CONFLICT (id) DO NOTHING;

-- Insert Team Members
INSERT INTO team_members (team_id, user_id, role_in_team) VALUES
(1, 6, 'Leader'),
(1, 7, 'Member'),
(1, 8, 'Member'),
(2, 9, 'Leader'),
(2, 10, 'Member'),
(3, 11, 'Leader'),
(3, 7, 'Member')
ON CONFLICT DO NOTHING;

-- 7. Insert Submissions
INSERT INTO submissions (id, challenge_id, team_id, title, description, document_url, status, reviewer_notes, reviewed_at) VALUES
(1, 4, 3, 'Ultra-Low Power Micro-Fluidic Sensor Array', 'A multi-spectral optical sensor array designed for non-invasive continuous biomarker tracking with <4.8mW power draw, featuring real-time noise reduction.', 'https://github.com/pulsetech/biosensor-spec', 'under_review', 'Exceptional power consumption metrics and signal-to-noise ratio. Preliminary benchmark results are extremely promising. Moving to final review panel.', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(2, 5, 1, 'Distributed Swarm Intelligence Pathfinding Engine', 'Decentralized consensus algorithm for dynamic obstacle re-routing across 500+ mobile warehouse robots, eliminating single points of failure.', 'https://github.com/alpha-aero/swarm-pathfinding', 'accepted', 'Winner of Challenge #5! Implemented flawless dynamic collision avoidance in high-density warehouse simulation tests with zero recorded deadlocks.', CURRENT_TIMESTAMP - INTERVAL '8 days')
ON CONFLICT (id) DO NOTHING;
