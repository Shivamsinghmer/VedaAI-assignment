# VedaAI — AI Assessment Creator

An AI-powered assessment creation tool for teachers. Built with Next.js, Express, MongoDB, Redis, BullMQ, WebSocket, and Groq LLM.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                        Frontend                         │
│              Next.js 15 + TypeScript + Zustand          │
│                                                         │
│  /assignments          → Dashboard (empty/filled state) │
│  /assignments/create   → Multi-step creation form       │
│  /assignments/[id]     → Live progress + paper output   │
└────────────────────┬─────────────────┬──────────────────┘
                     │ REST API         │ WebSocket
                     │                 │ (real-time updates)
┌────────────────────▼─────────────────▼──────────────────┐
│                        Backend                          │
│             Node.js + Express + TypeScript              │
│                                                         │
│  POST /api/assignments     → Create + enqueue job       │
│  GET  /api/assignments     → List (Redis-cached)        │
│  GET  /api/assignments/:id → Single (Redis-cached)      │
│  POST /api/assignments/:id/regenerate                   │
│  DELETE /api/assignments/:id                            │
│                                                         │
│  ws://localhost:4000/ws?assignmentId=<id>               │
└────────┬──────────────────────────────────────┬─────────┘
         │                                      │
┌────────▼────────┐  ┌──────────────────────────▼────────┐
│    MongoDB      │  │           Redis + BullMQ           │
│                 │  │                                    │
│  assignments    │  │  Queue: assignment-generation      │
│  (stores all    │  │  Cache: assignment list, papers    │
│   data + paper) │  │  Job state tracking                │
└─────────────────┘  └────────────────────────────────────┘
                                  │
                     ┌────────────▼────────────┐
                     │     Generation Worker    │
                     │                         │
                     │  1. Dequeue job          │
                     │  2. Build structured     │
                     │     prompt from form     │
                     │  3. Call Groq API        │
                     │     (llama-3.3-70b)      │
                     │  4. Parse + validate     │
                     │     JSON response        │
                     │  5. Save to MongoDB      │
                     │  6. Cache in Redis       │
                     │  7. Notify via WebSocket │
                     └─────────────────────────┘
```

## Flow

1. Teacher fills the creation form (title, subject, class, question types, marks)
2. Frontend `POST /api/assignments` with `multipart/form-data` (includes optional file)
3. Backend saves assignment → enqueues BullMQ job → returns `assignmentId`
4. Frontend navigates to `/assignments/[id]`, opens WebSocket connection
5. Worker picks up job → sends progress updates over WebSocket (10% → 30% → 80% → 100%)
6. Worker calls Groq API with a structured prompt → parses JSON response
7. Saves `GeneratedPaper` to MongoDB + Redis cache
8. Sends `job_completed` WebSocket event with the full paper
9. Frontend renders structured question paper with difficulty badges

---

## Setup

### Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`)
- Redis running locally (`redis://localhost:6379`)
- Groq API key → [https://console.groq.com](https://console.groq.com)

### 1. Install Dependencies

```bash
# From repo root
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Environment

```bash
# backend/.env
cp backend/.env.example backend/.env
# Fill in GROQ_API_KEY
```

```bash
# frontend/.env.local (already created)
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

### 3. Run

Open three terminals:

```bash
# Terminal 1 — API server
cd backend && npm run dev

# Terminal 2 — BullMQ Worker
cd backend && npm run worker

# Terminal 3 — Next.js Frontend
cd frontend && npm run dev
```

Then open [http://localhost:3000](http://localhost:3000)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| State | Zustand |
| Real-time | WebSocket (native `ws`) |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB + Mongoose |
| Cache | Redis + ioredis |
| Queue | BullMQ |
| AI | Groq API (`llama-3.3-70b-versatile`) |

---

## Features

- **Multi-section question papers** — configurable question types, counts, marks per question
- **Real-time progress** — WebSocket updates with animated progress bar
- **Difficulty tags** — Easy / Moderate / Challenging per question
- **Answer Key toggle** — show/hide model answers inline
- **Regenerate** — one-click to regenerate any paper
- **File upload** — upload PDF/text as reference material for context-aware questions
- **Redis caching** — assignments list and paper results cached for fast retrieval
- **PDF export** — browser print dialog with print-optimized CSS
- **Responsive** — desktop sidebar + mobile bottom tab bar
