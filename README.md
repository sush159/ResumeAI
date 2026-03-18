# ResumeAI — Unbiased AI Resume Screener

Full-stack HR tool that uses Claude to screen resumes fairly.

## Tech Stack
- **Frontend**: React + Vite
- **Backend**: Python, FastAPI
- **AI**: Claude API (claude-sonnet-4-6)
- **PDF Parsing**: pdfplumber

## Project Structure
```
HR/
├── backend/
│   ├── main.py              ← FastAPI server + all AI logic
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   └── components/
    │       ├── JDChecker.jsx
    │       ├── ResumeScreener.jsx
    │       └── Results.jsx
    ├── public/index.html
    ├── package.json
    └── vite.config.js
```

## Setup

### 1. Backend
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Set your Anthropic API key:
# Windows:
set ANTHROPIC_API_KEY=sk-ant-your-key-here
# Mac/Linux:
export ANTHROPIC_API_KEY=sk-ant-your-key-here

uvicorn main:app --reload
# → Running on http://localhost:8000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
# → Running on http://localhost:5173
```

## How It Works
1. **JD Checker** — Paste your job description; Claude flags biased language and suggests improvements
2. **Upload Resumes** — Upload PDF resumes; PII is stripped before AI sees them
3. **Results** — Candidates ranked by score with breakdown, strengths, gaps, and a draft feedback email
