# NETFLOW - Educational Social Media Platform

> **"Connect. Discover. Learn. Grow."**

NETFLOW is a modern, high-performance educational social media network designed for students, teachers, educational institutions, and knowledge creators. It combines social feed discovery, structured open-access resources, interactive diagnostic quizzes, peer communities, short educational flows, and Google Gemini AI assistance.

---

## ⚡ Deploying to Vercel with GitHub (Step-by-Step)

NETFLOW is pre-configured for full-stack deployment on Vercel with serverless Express API routing via `vercel.json` and `/api/index.ts`.

### Step 1: Push Code to Your GitHub Repository
If you haven't already initialized your Git repository:

```bash
git init
git add .
git commit -m "feat: complete NETFLOW educational social platform"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/netflow.git
git push -u origin main
```

### Step 2: Import into Vercel
1. Navigate to **[vercel.com](https://vercel.com)** and sign in with GitHub.
2. In your dashboard, click **Add New...** → **Project**.
3. Under **Import Git Repository**, find your `netflow` repository and click **Import**.

### Step 3: Configure Settings & Environment Variables
Vercel will automatically read `vercel.json` and detect the configuration:
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build` (or `vite build`)
- **Output Directory**: `dist`

Under **Environment Variables**, add:
- `GEMINI_API_KEY`: Your Google Gemini API Key from Google AI Studio.
- `JWT_SECRET`: Any secure random secret (e.g. `netflow-super-secret-key-2026`).

### Step 4: Deploy
Click **Deploy**. 

Vercel will:
- Build the client-side SPA bundle into `/dist`.
- Spin up the serverless backend endpoint from `/api/index.ts` to power all Express `/api/*` endpoints (Auth, Feed, Quizzes, PDF Viewer, Communities, and Gemini AI).
- Every subsequent `git push` to `main` will automatically trigger continuous deployment with preview branches!

---

## 🛠️ Local Development & Full-Stack Architecture

- **Frontend**: React 19, Tailwind CSS v4, Motion, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js & Express.js (runs standalone via `tsx server.ts` or as a Vercel Serverless Function via `/api/index.ts`).
- **AI Engine**: Google Gemini API via `@google/genai` (model: `gemini-3.8-flash`).
- **Data Layer**: Simulated MongoDB/Mongoose document store with persistent collections.
- **Real-Time Communication**: Server-Sent Events (SSE) stream `/api/realtime/stream` for live updates.
- **PWA**: Web App Manifest (`manifest.json`), service icons, and in-app install buttons.

### Local Run:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
