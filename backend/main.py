"""
AI Resume Screener - Backend API
Built with FastAPI + Google Gemini API + PostgreSQL

Layers:
1. Auth    — register/login with bcrypt-hashed passwords + JWT tokens
2. Data    — history & JD templates stored in PostgreSQL via SQLAlchemy
3. AI      — PDF extraction, anonymization, Gemini scoring, JD quality check
4. Email   — candidate feedback emails via Gmail SMTP
"""

from dotenv import load_dotenv
load_dotenv()

from database import init_db, get_db, User, ScreeningSession, JDTemplate
from auth import hash_password, verify_password, create_access_token, get_current_user

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
import pdfplumber
from google import genai
import json, re, io, os
from typing import List
from datetime import datetime

# ── App Setup ──────────────────────────────────────────────────────────────────
app = FastAPI(title="AI Resume Screener API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()  # create tables on startup if they don't exist

# ── Gemini Client ──────────────────────────────────────────────────────────────
client       = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
GEMINI_MODEL = "gemini-2.5-flash"


# ── Helper: Extract Text from PDF ─────────────────────────────────────────────
def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()


# ── Helper: Anonymize Resume ───────────────────────────────────────────────────
def anonymize_resume(text: str) -> str:
    """Strip PII to reduce bias before AI scoring."""
    text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[EMAIL]', text)
    text = re.sub(r'(\+?\d[\d\s\-().]{7,}\d)', '[PHONE]', text)
    text = re.sub(r'https?://\S+|www\.\S+', '[URL]', text)
    text = re.sub(r'linkedin\.com/in/\S+', '[LINKEDIN]', text)
    return text


# ── Helper: Call Gemini and parse JSON ────────────────────────────────────────
def call_gemini(prompt: str) -> dict:
    response = client.models.generate_content(model=GEMINI_MODEL, contents=prompt)
    text = response.text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\n?", "", text)
        text = re.sub(r"\n?```$", "", text)
    return json.loads(text.strip())


# ── Helper: Score a Single Resume ─────────────────────────────────────────────
def score_resume_with_gemini(
    resume_text: str,
    job_description: str,
    custom_criteria: str,
    candidate_label: str,
) -> dict:
    prompt = f"""You are a fair, unbiased hiring assistant. Evaluate resumes purely on skills, experience, and role relevance.

RULES:
- Do NOT consider gender, age, ethnicity, nationality, or personal characteristics
- Do NOT favour any university based on prestige
- Do NOT penalize employment gaps without clear professional reasons
- Be consistent — apply the same standards to every resume
- Focus ONLY on demonstrated skills, relevant experience, and role fit

---
JOB DESCRIPTION:
{job_description}

---
CUSTOM CRITERIA (if any):
{custom_criteria if custom_criteria else "None"}

---
RESUME ({candidate_label}):
{resume_text}

---
Respond ONLY with a valid JSON object in this exact format (no markdown, no extra text):
{{
  "jd_match_score": <0-100>,
  "skills_score": <0-100>,
  "custom_criteria_score": <0-100 or null if no custom criteria>,
  "overall_score": <0-100, weighted average>,
  "summary": "<2-3 sentence summary of the candidate>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "gaps": ["<gap 1>", "<gap 2>"],
  "recommendation": "<Shortlist / Maybe / Reject>",
  "feedback_email": "<Kind, constructive 3-4 sentence email to the candidate. Address them as 'Dear Candidate'.>"
}}"""
    return call_gemini(prompt)


# ── Helper: Check JD Quality ───────────────────────────────────────────────────
def check_jd_quality_with_gemini(job_description: str) -> dict:
    prompt = f"""You are an expert in inclusive hiring practices. Analyze this job description for quality and bias.

JOB DESCRIPTION:
{job_description}

Check for:
1. Biased language (e.g. "rockstar", "ninja", "young", "energetic", "digital native")
2. Gendered language (e.g. "dominant", "aggressive" vs "nurturing")
3. Unnecessarily restrictive requirements
4. Vague requirements that could be interpreted inconsistently
5. Missing information candidates need (salary range, remote policy, etc.)

Respond ONLY with a valid JSON object in this exact format (no markdown, no extra text):
{{
  "quality_score": <0-100>,
  "biased_phrases": ["<phrase 1>", "<phrase 2>"],
  "issues": ["<issue 1>", "<issue 2>"],
  "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"],
  "overall_verdict": "<Good / Needs Improvement / Poor>",
  "summary": "<2-3 sentence overall assessment>"
}}"""
    return call_gemini(prompt)


# ── Auth Routes ────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: str
    name: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/auth/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if not payload.email or not payload.name or not payload.password:
        raise HTTPException(status_code=400, detail="All fields are required.")
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    user = User(
        email=payload.email,
        name=payload.name,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id)
    return {"token": token, "user": {"email": user.email, "name": user.name}}

@app.post("/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    token = create_access_token(user.id)
    return {"token": token, "user": {"email": user.email, "name": user.name}}

@app.get("/auth/me")
def me(current_user: User = Depends(get_current_user)):
    return {"email": current_user.email, "name": current_user.name}


# ── History Routes ─────────────────────────────────────────────────────────────
class SaveSessionRequest(BaseModel):
    date: str
    jd_preview: str
    jd_text: str
    candidate_count: int
    shortlisted: int
    top_score: int
    results: dict

class UpdateStatusesRequest(BaseModel):
    statuses: dict

@app.get("/history")
def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sessions = (
        db.query(ScreeningSession)
        .filter(ScreeningSession.user_id == current_user.id)
        .order_by(ScreeningSession.date.desc())
        .all()
    )
    return [
        {
            "id":              s.id,
            "date":            s.date.isoformat(),
            "jd_preview":      s.jd_preview,
            "jd_text":         s.jd_text,
            "candidate_count": s.candidate_count,
            "shortlisted":     s.shortlisted,
            "top_score":       s.top_score,
            "results":         json.loads(s.results_json  or "{}"),
            "statuses":        json.loads(s.statuses_json or "{}"),
        }
        for s in sessions
    ]

@app.post("/history")
def save_session(
    payload: SaveSessionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = ScreeningSession(
        user_id=current_user.id,
        date=datetime.fromisoformat(payload.date),
        jd_preview=payload.jd_preview,
        jd_text=payload.jd_text,
        candidate_count=payload.candidate_count,
        shortlisted=payload.shortlisted,
        top_score=payload.top_score,
        results_json=json.dumps(payload.results),
        statuses_json="{}",
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"id": session.id}

@app.patch("/history/{session_id}/statuses")
def update_statuses(
    session_id: int,
    payload: UpdateStatusesRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.query(ScreeningSession).filter(
        ScreeningSession.id == session_id,
        ScreeningSession.user_id == current_user.id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    session.statuses_json = json.dumps(payload.statuses)
    db.commit()
    return {"success": True}

@app.delete("/history/{session_id}")
def delete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.query(ScreeningSession).filter(
        ScreeningSession.id == session_id,
        ScreeningSession.user_id == current_user.id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    db.delete(session)
    db.commit()
    return {"success": True}


# ── Template Routes ────────────────────────────────────────────────────────────
class SaveTemplateRequest(BaseModel):
    name: str
    text: str

@app.get("/templates")
def get_templates(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    templates = (
        db.query(JDTemplate)
        .filter(JDTemplate.user_id == current_user.id)
        .order_by(JDTemplate.created_at.desc())
        .all()
    )
    return [
        {"id": t.id, "name": t.name, "text": t.text, "date": t.created_at.isoformat()}
        for t in templates
    ]

@app.post("/templates")
def save_template(
    payload: SaveTemplateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Enforce max 20 templates per user — remove oldest if needed
    count = db.query(JDTemplate).filter(JDTemplate.user_id == current_user.id).count()
    if count >= 20:
        oldest = (
            db.query(JDTemplate)
            .filter(JDTemplate.user_id == current_user.id)
            .order_by(JDTemplate.created_at.asc())
            .first()
        )
        if oldest:
            db.delete(oldest)
    template = JDTemplate(user_id=current_user.id, name=payload.name, text=payload.text)
    db.add(template)
    db.commit()
    db.refresh(template)
    return {"id": template.id, "name": template.name, "text": template.text, "date": template.created_at.isoformat()}

@app.delete("/templates/{template_id}")
def delete_template(
    template_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    template = db.query(JDTemplate).filter(
        JDTemplate.id == template_id,
        JDTemplate.user_id == current_user.id,
    ).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found.")
    db.delete(template)
    db.commit()
    return {"success": True}


# ── AI Routes ──────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "AI Resume Screener API is running!"}

@app.post("/check-jd")
async def check_jd(job_description: str = Form(...)):
    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")
    try:
        result = check_jd_quality_with_gemini(job_description)
        return JSONResponse(content=result)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}")

@app.post("/screen-resumes")
async def screen_resumes(
    job_description: str = Form(...),
    custom_criteria: str = Form(""),
    resumes: List[UploadFile] = File(...),
):
    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description is required.")
    if not resumes:
        raise HTTPException(status_code=400, detail="At least one resume is required.")

    results = []
    for index, resume_file in enumerate(resumes):
        candidate_label = f"Candidate {chr(65 + index)}"
        try:
            file_bytes      = await resume_file.read()
            raw_text        = extract_text_from_pdf(file_bytes)
            if not raw_text:
                results.append({"candidate_label": candidate_label, "original_filename": resume_file.filename, "error": "Could not extract text from this PDF."})
                continue
            anonymized_text = anonymize_resume(raw_text)
            score_data      = score_resume_with_gemini(anonymized_text, job_description, custom_criteria, candidate_label)
            score_data["candidate_label"]    = candidate_label
            score_data["original_filename"]  = resume_file.filename
            results.append(score_data)
        except Exception as e:
            results.append({"candidate_label": candidate_label, "original_filename": resume_file.filename, "error": f"Failed to process: {str(e)}"})

    results.sort(key=lambda x: x.get("overall_score", 0), reverse=True)
    return JSONResponse(content={"candidates": results})


# ── Email Endpoint ─────────────────────────────────────────────────────────────
import smtplib
import asyncio
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class EmailRequest(BaseModel):
    to_email: str
    candidate_label: str
    feedback_text: str

def _send_via_gmail(gmail_user: str, gmail_password: str, to_email: str, subject: str, body: str):
    msg = MIMEMultipart()
    msg["From"]    = f"ResumeAI <{gmail_user}>"
    msg["To"]      = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))
    with smtplib.SMTP("smtp.gmail.com", 587, timeout=30) as server:
        server.starttls()
        server.login(gmail_user, gmail_password)
        server.sendmail(gmail_user, to_email, msg.as_string())

@app.post("/send-email")
async def send_email(payload: EmailRequest):
    gmail_user     = os.getenv("GMAIL_USER", "")
    gmail_password = os.getenv("GMAIL_APP_PASSWORD", "")
    if not gmail_user or not gmail_password:
        raise HTTPException(status_code=503, detail="Email service is not configured. Add GMAIL_USER and GMAIL_APP_PASSWORD to your environment variables.")
    try:
        await asyncio.to_thread(
            _send_via_gmail,
            gmail_user, gmail_password,
            payload.to_email,
            f"Your Application Update — {payload.candidate_label}",
            payload.feedback_text,
        )
        return {"success": True}
    except smtplib.SMTPAuthenticationError:
        raise HTTPException(status_code=401, detail="Gmail authentication failed. Check your GMAIL_USER and GMAIL_APP_PASSWORD.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
