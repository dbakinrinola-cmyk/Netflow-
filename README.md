# NETFLOW - Educational Social Media Platform

> **"Connect. Discover. Learn. Grow."**

NETFLOW is a modern, high-performance educational social media network designed for students, teachers, educational institutions, and knowledge creators. It fuses the intuitive usability and engagement of Instagram, TikTok, and Threads with academic rigor, structured open-access resources, interactive diagnostic quizzes, peer communities, and Google Gemini AI assistance.

---

## 🚀 Key Features

1. **Authentication & Academic Identities**
   - Student & Teacher registration with institution affiliations.
   - Verified Educator badges.
   - Comprehensive profile management with followers, following, posts, and saved collections.
   - Multi-role 1-click test drive (Alex Chen [Student], Dr. Elena Vance [Physics Professor], Marcus Thorne [CS Mentor], Maya Patel [Biologist]).
   - Secure password recovery workflow with reset tokens.

2. **Educational Social Feed**
   - Rich media posts (Text, scientific diagrams, formulas, video clips).
   - Embedded PDF Notes Reader with multi-page preview and instant download.
   - Interactive in-feed Quiz runner with instant evaluation and scientific explanations.
   - Likes, threaded comments, reposts, and study collection bookmarks.
   - 14 Dedicated Academic Categories filtering (Mathematics, Physics, Computer Science, AI, Biology, History, Economics, etc.).

3. **NETFLOW AI Studio (Google Gemini 3.8 Flash)**
   - **Academic Tutor Chat**: Socratic question answering, derivations, and follow-up guidance.
   - **Concept Explainer**: Adjustable comprehension levels (Elementary, High School, Undergraduate, Graduate) with analogies.
   - **Homework Guidance**: Progressive hints and milestone checks without giving away answers.
   - **Notes Summarizer**: Text/lecture note summarization with active-recall flashcards.
   - **Quiz Generator**: Auto-generates 4-question diagnostic assessments with instant grading.
   - **7-Day Study Planner**: Custom schedules tailored to student goals and daily hours.

4. **Educational Flows (Reels/Shorts)**
   - Micro-lesson vertical feed for rapid learning.
   - Interactive flashcards and concept takeaways attached to each lesson.
   - Play/pause, audio toggle, and direct author interaction.

5. **Student Communities & Study Lounges**
   - Subject-based laboratories and school/university networks.
   - Announcement boards, conduct rules, and discussion threads.
   - Direct messaging between students and professors with study attachments.

6. **Progressive Web App (PWA)**
   - Full PWA compliance with Web App Manifest, icon assets, and standalone mode detection.
   - Integrated `PWAInstallButton` with guided instructions for Chromium, Android, and iOS Safari.
   - Offline connectivity indicator.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Tailwind CSS v4, Motion, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js & Express.js.
- **AI Engine**: Google Gemini API via `@google/genai` (model: `gemini-3.8-flash`).
- **Data Layer**: Simulated MongoDB/Mongoose document store with persistent collections.
- **Real-Time Communication**: Server-Sent Events (SSE) stream `/api/realtime/stream` for live updates.
- **Security**: JWT-compatible token generation and authentication middleware.

---

## 📦 Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy the example template:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key:
   ```env
   GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
   PORT=3000
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

4. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```
