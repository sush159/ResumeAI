"""
AI Resume Screener - Backend API
Built with FastAPI + Google Gemini API

Layers:
1. Receives resumes (PDFs) and a job description from the frontend
2. Extracts text from the PDFs
3. Anonymizes the resumes (removes names, emails, phone numbers, URLs)
4. Sends them one-by-one to Gemini for scoring
5. Returns ranked results + feedback + JD quality check
"""

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pdfplumber
from google import genai
import json
import re
import io
import os
from typing import List

# ── App Setup ──────────────────────────────────────────────────────────────────
app = FastAPI(title="AI Resume Screener API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Gemini Client ──────────────────────────────────────────────────────────────
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
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
    # Strip markdown code fences if Gemini wraps the JSON
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


# ── Routes ─────────────────────────────────────────────────────────────────────
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
        candidate_label = f"Candidate {chr(65 + index)}"  # A, B, C ...

        try:
            file_bytes = await resume_file.read()
            raw_text = extract_text_from_pdf(file_bytes)

            if not raw_text:
                results.append({
                    "candidate_label": candidate_label,
                    "original_filename": resume_file.filename,
                    "error": "Could not extract text from this PDF.",
                })
                continue

            anonymized_text = anonymize_resume(raw_text)

            score_data = score_resume_with_gemini(
                resume_text=anonymized_text,
                job_description=job_description,
                custom_criteria=custom_criteria,
                candidate_label=candidate_label,
            )

            score_data["candidate_label"] = candidate_label
            score_data["original_filename"] = resume_file.filename
            results.append(score_data)

        except Exception as e:
            results.append({
                "candidate_label": candidate_label,
                "original_filename": resume_file.filename,
                "error": f"Failed to process: {str(e)}",
            })

    results.sort(key=lambda x: x.get("overall_score", 0), reverse=True)
    return JSONResponse(content={"candidates": results})
