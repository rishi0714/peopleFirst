# peopleFirst

A React (Vite + React Router + Tailwind CSS) port of the peopleFirst leave management & wellbeing concierge web UI, plus the **unmodified** Spring Boot backend (H2 in-memory database, `dev` profile) and Kura AI agent CLI from the original [`peopleFirst`](https://github.com/rishi0714/peopleFirst) project. This repo bundles all three so the whole app runs from one place — no backend or database logic changes were made when moving it here.

```
.
├── backend/   Spring Boot API (Java 17+, Maven) — port 8080
├── agent/     Kura standalone CLI client (Python 3.8+, stdlib only)
└── src/       This React frontend (Vite) — port 5173
```

## Prerequisites

- Node.js 18+
- Java 17+ and Maven 3.8+ (for `backend/`)
- Python 3.8+ (optional, only for the `agent/` CLI client)

## 1. Start the backend

```bash
cd backend
mvn spring-boot:run
```

This boots on `http://localhost:8080` using the `dev` profile with the in-memory H2 database and seed demo users. The backend's CORS policy already allows any origin with credentials, so no configuration changes are needed to talk to this app. To use the AI features with a real model instead of the rule-based fallback, copy `.env.example` to `.env` and fill in `GEMINI_API_KEY` or `OPENAI_API_KEY`.

## 2. Run this React app

```bash
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

## 3. (Optional) Run the Kura agent CLI

A standalone terminal client for Kura, separate from the in-app chat widget:

```bash
python3 agent/agent_runner.py
```

Requires the backend to be running; log in with any demo account below.

## Demo accounts

All accounts share the password `password123`:

| Username | Role | Portal |
|---|---|---|
| `employee1` | Employee | Leave Dashboard |
| `manager1` | Manager | Team Approvals |
| `admin1` | Admin | Org Governance |
| `contractor1` | Contractor | Kura Agent Portal only (`/contractor`) |

## Project structure

```
src/
├── api/          fetch wrapper + REST client modules (1:1 with backend endpoints)
├── context/      AuthContext (JWT/session state in localStorage)
├── hooks/        useAgentChat (shared Kura chat logic)
├── utils/        date/format/validation helpers
├── components/   shared UI: layout shell, Sidebar, Navbar, ChatWidget, Modal, tables, badges
├── pages/        one component per route/screen
└── router.jsx    route table (react-router-dom)
```

## Notes

- The floating "Chat with Kura" widget appears on every authenticated page; contractors are routed to a dedicated full-page chat portal at `/contractor` instead of the sidebar portal, matching the original app's channel restrictions.
- All policy/validation rules (leave combinations, cutoffs, document requirements, etc.) are enforced by the backend; this app mirrors the same client-side checks the original did for fast feedback, but the backend remains the source of truth.
