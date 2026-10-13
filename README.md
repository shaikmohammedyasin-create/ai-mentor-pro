# AI Mentor Pro

AI Mentor Pro is a production-ready web application for career advisory, resume analysis, coding mentorship, and exam preparation. Built with Next.js 16, TypeScript, Tailwind CSS, Prisma, and Groq API. Developed for the IBM × Bharat Cares Vibe Coding project.

---

## Features
- **Modern Responsive Frontend**: Built with premium Tailwind CSS aesthetics, glassmorphism design, and clean typography.
- **AI Mentors & Personalities**: Switch between 10 specialized mentor personalities (Coding, Interview Prep, Resume Critic, Research Guide, etc.).
- **Streaming Chat**: Real-time streaming response completion (SSE) with abort support.
- **Resume Analyzer**: Dynamic ATS score calculation, checks for strengths/weaknesses/keyword gaps, and lists improved bullet suggestions.
- **Prompt Library**: Pre-built categorizable prompts with search and favorite indicators.
- **Analytics & Health Dashboard**: Usage statistics, tokens consumed, average latency, and live database health metrics.

---

## Project Structure

```
├── .next/                  # Built standalone server files (after build)
├── db/                     # SQLite database files
├── prisma/                 # Database schema definition
├── public/                 # Static assets (images, icons)
├── src/
│   ├── app/                # Next.js App Router and API routes
│   │   ├── api/            # Backend endpoints (chats, resume, health, etc.)
│   │   └── page.tsx        # Entry component (toggles Landing vs App Shell)
│   ├── components/         # Reusable Shadcn UI & page layout components
│   ├── hooks/              # State and helper hooks
│   └── lib/                # Database configuration, analytics & Groq SDK
├── next.config.ts          # Standalone and tracer compilation setup
├── package.json            # Application dependencies and task runners
└── tailwind.config.ts      # CSS token framework setup
```

---

## Installation & Local Development

### Prerequisites
- Node.js 18+ (Node 24 recommended)
- NPM or Bun package runner

### Steps
1. **Clone and Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory (based on `.env.example`):
   ```env
   DATABASE_URL=file:./db/custom.db
   GROQ_API_KEY=your_actual_groq_api_key
   GROQ_MODEL=llama-3.3-70b-versatile
   PORT=8000
   NODE_ENV=production
   ```

3. **Initialize Database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Build & Standalone Run

To build the application for production using Next.js standalone output:

```bash
npm run build
npm run start
```
The application will start in production mode, listening on the port configured in `.env` (default 8000).

---

## Docker Deployment

To build and run the application locally in Docker:

1. **Build the Container**:
   ```bash
   docker build -t ai-mentor-pro .
   ```

2. **Run the Container**:
   ```bash
   docker run -p 8000:8000 --env-file .env ai-mentor-pro
   ```

3. **Or run using Docker Compose**:
   ```bash
   docker-compose up --build
   ```

---

## AWS App Runner Deployment

For deploying the containerized app to **AWS App Runner**:
1. Push the Docker image to **Amazon ECR**.
2. Create a service in AWS App Runner choosing the ECR image URI.
3. Configure the container port to `8000`.
4. Set up the required environment variables (`DATABASE_URL`, `GROQ_API_KEY`, etc.).
5. Set Health Check path to `/api/health` on port `8000`.

*See [aws-deployment.md](aws-deployment.md) for full detailed instructions.*
