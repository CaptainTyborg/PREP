# PREP.ng — JAMB UTME CBT Simulator

A full-featured Computer-Based Test (CBT) simulator for Nigerian students preparing for JAMB UTME examinations.

## Features

- **17 JAMB Subjects** — Use of English (250 questions), Mathematics, Physics, Chemistry, Biology, Literature in English, Government, Economics, Geography, Agricultural Science, Civic Education, CRS, Islamic Studies, Commerce, Financial Accounting, Marketing, Office Practice
- **Timed Exam** — 120-minute countdown matching real JAMB format
- **Keyboard Shortcuts** — A/B/C/D to answer, Arrow keys / N/P to navigate
- **AI Tutor** — Post-exam explanations powered by OpenAI
- **Leaderboard** — Public ranking of top students
- **Admin Dashboard** — Monitor student progress and attempt history

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Shadcn UI
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **State**: Zustand
- **AI**: OpenAI API

## Deployment

Hosted on [Render](https://render.com) — see `render.yaml` for configuration.

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```
DATABASE_URL=postgresql://...
SESSION_SECRET=...
OPENAI_API_KEY=...
```

## Local Development

```bash
npm install
npm run dev
```

## Database Setup

```bash
npm run db:push
```
