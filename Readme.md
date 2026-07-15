# Task Completion — Full-Stack Auth Portal with AI Microservice

A pre-interview assessment project implementing a complete authentication system with a containerized, multi-service architecture: a **React** frontend, a **Node.js/Express** backend, a **Python/FastAPI** AI microservice, and a **MySQL** database — all orchestrated with Docker Compose.

## Overview

This project ("NagaEd Portal") demonstrates a production-style setup for user registration, login, and session-authenticated access, split across independently deployable services:

- **Frontend** – A React SPA for registration, login, and a protected dashboard.
- **Backend** – An Express REST API handling auth (JWT + cookies), password hashing, and MySQL persistence via Sequelize.
- **AI Service** – A FastAPI microservice that uses Groq's LLM API to generate creative username suggestions.
- **Database** – MySQL, run as its own container with a persistent volume.

## Architecture

```
┌────────────┐      ┌──────────────────┐      ┌──────────────────────┐
│  Frontend  │─────▶│  Backend (Node)  │─────▶│  AI Service (Python)  │
│  (React)   │      │  Express + JWT   │      │  FastAPI + Groq LLM   │
│  :8080     │      │  :3000           │      │  :8000                │
└────────────┘      └────────┬─────────┘      └──────────────────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │   MySQL 8.0 DB    │
                     │   :3306            │
                     └──────────────────┘
```

All services run in isolated Docker containers connected via a shared bridge network (`app-network`), defined in `docker-compose.yml`.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router, Vite, Tailwind CSS |
| Backend | Node.js, Express 5, Sequelize (ORM) |
| AI Service | Python, FastAPI, Groq SDK (Llama 3.3 70B) |
| Database | MySQL 8.0 |
| Auth | JWT (access + refresh tokens), bcrypt password hashing, HTTP-only cookies |
| Infrastructure | Docker, Docker Compose, Nginx (frontend serving) |

## Features

- **User registration** with duplicate username/email checks and address field
- **Secure login** with bcrypt-hashed passwords and dual JWT tokens (access + refresh)
- **Protected routes** guarded by a JWT-verification middleware
- **Consistent API responses** via reusable `ApiResponse` / `ApiError` utility classes
- **AI-powered username suggestions** — a FastAPI endpoint (`/api/suggest-username`) that calls Groq's LLM to generate three creative usernames from a list of user interests
- **Fully containerized** — one command spins up the database, backend, AI service, and frontend together

## Project Structure

```
task_completion/
├── backend/                 # Express REST API
│   ├── src/
│   │   ├── controllers/     # Route handlers (register, login, fetchUser)
│   │   ├── database/        # Sequelize/MySQL connection
│   │   ├── middlewares/     # JWT auth middleware
│   │   ├── models/          # User model (Sequelize)
│   │   ├── routers/         # /api routes
│   │   └── utility/         # ApiError / ApiResponse helpers
│   ├── app.js                # Express app & middleware setup
│   ├── server.js             # DB connection + server bootstrap
│   ├── index.js
│   └── Dockerfile
│
├── ai-service/               # FastAPI microservice
│   ├── main.py                # /api/suggest-username endpoint (Groq LLM)
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── components/       # Login, Register
│   │   ├── pages/             # Dashboard
│   │   └── App.jsx
│   └── Dockerfile
│
└── docker-compose.yml         # Orchestrates db, backend, ai-service, frontend
```

## API Endpoints

### Backend (`http://localhost:3000/api`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/register` | Register a new user | No |
| POST | `/login` | Log in and receive JWT cookies | No |
| GET | `/users/:id` | Fetch a user's profile | Yes |

### AI Service (`http://localhost:8000`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/suggest-username` | Generate 3 creative usernames from a list of interests |

## Getting Started

### Prerequisites

- Docker & Docker Compose
- A [Groq API key](https://console.groq.com) (for the AI service)

### Environment Variables

Create a `.env` file in the project root:

```env
MYSQL_ROOT_PASSWORD=your_mysql_password
MYSQL_DATABASE=task_completion_db
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d
GROQ_API_KEY=your_groq_api_key
```

### Run with Docker Compose

```bash
git clone https://github.com/RohitBCA456/task_completion.git
cd task_completion
docker-compose up --build
```

This starts:

- **MySQL** on `localhost:3306`
- **Backend** on `localhost:3000`
- **AI Service** on `8000` (internal, exposed to the backend network)
- **Frontend** on `localhost:8080`

### Run Locally (without Docker)

**Backend**
```bash
cd backend
npm install
npm run dev
```

**AI Service**
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

## Author

**Rohit** — [@RohitBCA456](https://github.com/RohitBCA456)

*Built as a pre-interview technical assessment.*