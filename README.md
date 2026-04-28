# PraMuse — The Skill Barter Revolution 🔄

PraMuse is a production-grade, AI-powered peer-to-peer marketplace where users exchange skills instead of capital. Built with a premium, zero-latency interface, the platform utilizes cutting-edge Large Language Models (LLMs) to identify complementary capabilities and match users seamlessly. 

---

## 💎 Project Overview (Presentation Highlights)

- **The Problem:** Up-skilling is expensive. Traditional tutoring platforms gate quality education behind high subscriptions.
- **The Solution:** A decentralized marketplace leveraging human capital as currency. Trade *UI Design* for *Python*, or *Guitar Lessons* for *French*. 
- **The Core Value:** "Your Talent is your Currency."

---

## 🛠️ Technology Stack

| Layer | Technology Used |
| :--- | :--- |
| **Frontend Framework** | Next.js 15 (App Router, Server Components) |
| **Styling & UI** | Tailwind CSS (v4) + Framer Motion (Micro-animations) |
| **State Management** | Zustand (Persistent state integration) |
| **Database ORM** | Prisma v5 (Vercel deployment certified) |
| **Database Layer** | Supabase PostgreSQL (Managed Infrastructure) |
| **Authentication** | Supabase Magic Link OTP Flow |
| **AI Matching Engine** | Groq API (Llama-3-8b-8192) |

---

## 🚀 Key Features

### 1. 🤖 AI Magic Matchmaker (Powered by Groq)
Rather than endlessly filtering search results, our native AI engine acts as a concierge. By extracting vectors across the "Offered Skills" and "Seeking Skills", the system matches partners with highly complementary operational overlaps.

### 2. 🔀 Secure Skill-Barter Swap Workflows
Users initiate direct proposals on listed items. Once both parties accept, secure bidirectional paths open up mapping specific expectations to the timeline.

### 3. 💬 Real-Time Direct Messaging
Fully internal, poll-backed messaging threads remove reliance on third-party channels (like Discord or WhatsApp), ensuring engagement stays secured inside the application lifecycle.

### 4. 🛡️ The Trust & Reputation Economy
Trust scores aggregate based on post-session cross-evaluations out of a 5.0 scale. High reliability increases matching probabilities algorithmically.

### 5. 🌓 Adaptive Billion-Dollar Design System
Includes high-fidelity dark modes mapped perfectly to standard design specifications. 

---

## 📊 Database Architecture

The schema maps cleanly against Prisma models:
- `User`: Handles identity indexing, profile avatars, and global Trust metrics.
- `Skill`: Relational tracking of individual categorical proficiencies.
- `SwapRequest`: Manages multi-state agreements (`PENDING`, `ACCEPTED`, `COMPLETED`).
- `Message`: Facilitates text histories.

---

## 🏃 Run the Application Locally

1. Clone the repository.
2. Enter the workspace root:
   ```bash
   cd frontend
   ```
3. Install platform dependencies:
   ```bash
   npm install
   ```
4. Define environment variables in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `GROQ_API_KEY`
5. Generate client schemas and start local server:
   ```bash
   npx prisma generate
   npm run dev
   ```