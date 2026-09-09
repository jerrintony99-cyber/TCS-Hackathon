# TestGen AI - Enterprise QA Test Case Generator

TestGen AI is an AI-powered quality engineering platform that converts natural-language user stories and software requirements into actionable, structured, and comprehensive test case suites.

## Core Problem Solved
Manual test case authoring in fast-paced agile cycles is slow, leads to inconsistent test coverage, misses critical edge cases, and delays testing. TestGen AI behaves as an experienced Senior QA Architect to:
- Comprehend business logic, actors, and constraints.
- Generate happy path, negative, boundary/edge cases, security, and performance scenarios.
- Make and display explicit assumptions for ambiguous requirements.
- Calculate test coverage and relevance metrics (>85%+).
- Enable interactive editing, regeneration, and export to CSV, JSON, Markdown, and Test Plans.

---

## Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                     React 19 Frontend                   │
│   Dashboard • Generation Controls • Coverage Matrix     │
│   Interactive Table/Card View • History • Export Suite   │
└────────────────────────────┬────────────────────────────┘
                             │ REST / JSON
┌────────────────────────────▼────────────────────────────┐
│                  Full-Stack Server                      │
│        (Express + TypeScript on Port 3000 /             │
│            FastAPI Python in backend/app)               │
└────────────────────────────┬────────────────────────────┘
                             │
     ┌───────────────────────┼───────────────────────┐
     ▼                       ▼                       ▼
Gemini 3.8 Flash         Ollama / Local          Synthetic QA
(Server-side SDK)     (Llama, Gemma, Qwen)     Enterprise Engine
```

---

## Quick Start

### 1. Web Application (Pre-configured)
The live workspace runs the Express + Vite server with server-side `@google/genai` integration:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### 2. Python FastAPI Backend (Optional Local Runner)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r ../requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## Environment Variables (`.env`)
```env
# Gemini API Key (managed via Settings > Secrets in Google AI Studio)
GEMINI_API_KEY="your-gemini-api-key"

# Optional Ollama Base URL for local models
OLLAMA_BASE_URL="http://localhost:11434"
```

---

## API Endpoints
- `GET /api/health` - System health and provider status
- `GET /api/config` - Available LLM providers and configuration
- `POST /api/generate-test-cases` - Generate structured test cases from user story
- `POST /api/regenerate-test-case` - Refine or regenerate an individual test case
- `GET /api/history` - List previous generation runs
- `GET /api/history/:id` - Fetch details for a specific run
- `DELETE /api/history/:id` - Delete a history run

---

## Running with Local Models via Ollama
1. Install Ollama from [ollama.com](https://ollama.com)
2. Pull your model of choice:
   ```bash
   ollama pull llama3
   # or
   ollama pull gemma2
   ```
3. Select "Ollama / Local Models" in the provider dropdown in TestGen AI.
