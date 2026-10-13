# Project Report: AI Mentor Pro

## 1. Technical Architecture
AI Mentor Pro is designed as a single-page web app built on **Next.js 16 (React 19)** using standalone build outputs.
- **Client Side**: Utilizes Zustand for client-side view state routing and theme management.
- **Server Side (APIs)**: Serves endpoints for Chat completions, Resume analysis, Prompts library, Folders management, and Uptime Health.
- **Data Layer**: SQLite database accessed via Prisma ORM.

```
┌─────────────────────────────────────────────────────────┐
│                   Next.js Client (UI)                   │
└───────────┬─────────────────────────────────▲───────────┘
            │ API Requests (JSON/SSE)         │ Render State
┌───────────▼─────────────────────────────────┴───────────┐
│                   Next.js Server API                    │
└───────────┬─────────────────────────────────▲───────────┘
            │ Prisma Client                   │ SDK completion
┌───────────▼───────────┐           ┌─────────┴───────────┐
│  SQLite (custom.db)   │           │    Groq Cloud API   │
└───────────────────────┘           └─────────────────────┘
```

---

## 2. Prompt Engineering Workflow
- **System Prompts Injection**: Dynamically matches system prompts based on 10 customized personality keys.
- **ATS Resume Review Instructions**: Incorporates structured response constraints, mandating that the model separates its output into an exact `===JSON===` metadata block (containing ATS score, strengths, weaknesses) followed by a full markdown report.
- **Session History Truncation**: Truncates history feeds to the last 20 messages to balance context sizes and minimize inference token expenses.

---

## 3. Development Phases
1. **Foundation & Setup**: Next.js scaffold configuration with tailwind and shadcn component definitions.
2. **Database Integration**: Defining relational schemas in Prisma and setting up local SQLite databases.
3. **Core Feature Build**: Developing chat UI, SSE stream endpoints, and the resume reviewer forms.
4. **Stabilization & Fixes**: Restoring package setups, resolving Next.js standalone file-tracing configurations, and cleaning unused assets.
5. **Containerization & Delivery**: Building Docker setups and generating AWS deployment materials.

---

## 4. Challenges & Solutions
- **Challenge**: Prisma client throws `Cannot find module '.prisma/client/default'` at production standalone runtime.
  - **Solution**: Removed `@prisma/client` from Webpack transpilation package configurations (`transpilePackages`) and registered it under `serverExternalPackages` inside `next.config.ts`.
- **Challenge**: Standalone build outputs were nested in `Downloads/IBM` instead of the standalone root folder.
  - **Solution**: Explicitly set the `outputFileTracingRoot` to the current directory (`path.join(__dirname)`) in `next.config.ts` to override Next.js's workspace root directory inference.
- **Challenge**: Relative database URLs in Prisma fail when resolving directory paths in standalone mode.
  - **Solution**: Added logic in `src/lib/db.ts` to dynamically resolve any relative `file:` database URLs to absolute file paths at runtime.

---

## 5. Testing & Verification
- **Compilation Check**: Ensured type safety with `tsc --noEmit` and resolved lint checks.
- **Automated Integration Verification**: Executed a PowerShell script to test each endpoint (`GET /api/health`, `POST /api/chat`, `POST /api/resume`, etc.), confirming status codes, responses, database transactions, and correct SSE format headers.

---

## 6. Deployment Strategy
- **Containerization**: Configured multi-stage Dockerfiles that build the next application and packages the output in standalone bundles.
- **Platform**: Targeted AWS App Runner by pulling images from Amazon ECR, configuring environment files, and pointing health checks to `/api/health`.

---

## 7. Key Learnings
- Next.js 15+ standalone outputs are highly efficient for production environments, reducing container sizes by including only necessary node dependencies.
- Standardizing SQLite database configurations to use dynamic absolute paths resolves path resolution inconsistencies between development machines and production docker instances.
