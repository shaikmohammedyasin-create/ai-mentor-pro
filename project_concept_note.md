# Project Concept Note: AI Mentor Pro

## Project Title
**AI Mentor Pro**

---

## Objective
To build a highly responsive, personalized, and accessible web application that serves as an AI-powered tutor and career advisor for students, young professionals, and developers. The application helps users optimize their career paths through resume analysis, mock interview coaching, programming mentoring, and tailored learning guides.

---

## Problem Statement
Traditional education and career coaching are often generic, expensive, and unavailable 24/7. Students and entry-level developers struggle to get customized mentorship, code feedback, and objective ATS resume evaluations. This skills gap and lack of personalized career pathing creates barriers for individuals trying to break into modern technical roles.

---

## Target Users
- **Students & Graduates**: Seeking structured study schedules, career navigation guidance, and conceptual explanations.
- **Entry-level Developers**: Looking for real-time coding assistants, syntax explanations, and architecture advice.
- **Job Seekers**: Requiring ATS-compatible resume optimizations and mock interview simulations.

---

## Technology Stack
- **Frontend Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS 4 with custom glassmorphism design system
- **Database**: Prisma ORM with local SQLite database
- **Deployment**: Docker containerization and AWS App Runner compatibility
- **State Management**: Zustand (Client)

---

## Groq Model Used
- **Primary LLM**: `llama-3.3-70b-versatile` (Inference via Groq SDK)
- **Selection Rationale**: Extremely fast inference latencies (tokens per second), high context capacity, and state-of-the-art coding and reasoning capabilities.

---

## Key Features
1. **Multilateral AI Personalities**: 10 distinct career and academic personas (Coding Mentor, Resume Critic, Research Guide, etc.).
2. **Streaming AI Chat**: Real-time SSE streaming for fluid dialogue interfaces.
3. **ATS Resume Analyzer**: Automatically parses resume texts and scores them against job titles, generating structured keyword lists and rewritten impact bullet points.
4. **Prompt Templates Library**: A built-in repository of categorizable, search-friendly prompts that users can favorite.
5. **System Health & Analytics**: Tracking of token usage counts, response durations, and server/database uptime checkups.

---

## Expected Outcomes
- **Enhanced Career Preparedness**: Job seekers receive constructive, immediate feedback to optimize their resumes for ATS platforms.
- **Improved Coding Confidence**: Developers get immediate explanations of complex logic, lowering learning curves.
- **Accessible Coaching**: Uptime-guided mentorship is made accessible to all users for free, with no authentication barriers.
