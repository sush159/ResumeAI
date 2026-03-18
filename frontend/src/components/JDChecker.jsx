import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const StepBar = ({ current }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 40 }}>
    {["Job Description", "Upload Resumes", "Results"].map((label, i) => {
      const num = i + 1;
      const done = num < current;
      const active = num === current;
      return (
        <div key={label} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%",
              background: done ? "var(--success)" : active ? "var(--accent)" : "var(--surface2)",
              border: `1px solid ${done ? "var(--success)" : active ? "var(--accent)" : "var(--border2)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 600, color: done || active ? "white" : "var(--text3)",
              flexShrink: 0,
            }}>
              {done ? (
                <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              ) : num}
            </div>
            <span style={{
              fontSize: 13, fontWeight: active ? 500 : 400,
              color: active ? "var(--text)" : done ? "var(--text2)" : "var(--text3)",
            }}>
              {label}
            </span>
          </div>
          {i < 2 && (
            <div style={{ width: 40, height: 1, background: done ? "var(--success)" : "var(--border)", margin: "0 12px" }} />
          )}
        </div>
      );
    })}
  </div>
);

export default function JDChecker({ jdData, setJdData, onNext }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analysis = jdData.analysis;

  const scoreColor = (s) => s >= 75 ? "var(--success)" : s >= 50 ? "var(--warning)" : "var(--danger)";
  const verdictColor = (v) => ({ Good: "var(--success)", "Needs Improvement": "var(--warning)", Poor: "var(--danger)" }[v] || "var(--text2)");

  const handleAnalyze = async () => {
    if (!jdData.text.trim()) { setError("Please paste a job description."); return; }
    setError("");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("job_description", jdData.text);
      const res = await fetch(`${API_BASE}/check-jd`, { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Error ${res.status}`);
      }
      const data = await res.json();
      setJdData((p) => ({ ...p, analysis: data }));
    } catch (e) {
      setError(e.message || "Request failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-up">
      <StepBar current={1} />

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
          Job Description Review
        </h1>
        <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.6 }}>
          Paste your job description below to review it for clarity, completeness, and language quality before screening candidates.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <label>Job Description</label>
        <textarea
          rows={10}
          placeholder="Paste your full job description here..."
          value={jdData.text}
          onChange={(e) => setJdData((p) => ({ ...p, text: e.target.value, analysis: null }))}
        />
        {error && (
          <div style={{
            marginTop: 12, padding: "9px 14px",
            background: "var(--danger-muted)", border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 8, fontSize: 13, color: "var(--danger)",
          }}>
            {error}
          </div>
        )}
        <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
          <button className="btn btn-primary" onClick={handleAnalyze} disabled={loading}>
            {loading ? <><span className="spinner" />Analyzing...</> : "Analyze"}
          </button>
          {analysis && (
            <button className="btn btn-secondary" onClick={onNext}>
              Continue to Upload
            </button>
          )}
        </div>
      </div>

      {analysis && (
        <div className="fade-up">
          {/* Score + Verdict */}
          <div className="card" style={{ marginBottom: 16, display: "flex", gap: 28, alignItems: "center" }}>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 52, fontWeight: 700, color: scoreColor(analysis.quality_score), lineHeight: 1, letterSpacing: "-0.03em" }}>
                {analysis.quality_score}
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Quality Score
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{
                display: "inline-block", padding: "3px 10px", borderRadius: 6,
                fontSize: 12, fontWeight: 500,
                background: verdictColor(analysis.overall_verdict) + "18",
                color: verdictColor(analysis.overall_verdict),
                border: `1px solid ${verdictColor(analysis.overall_verdict)}33`,
                marginBottom: 10,
              }}>
                {analysis.overall_verdict}
              </span>
              <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>{analysis.summary}</p>
            </div>
          </div>

          {/* Language Issues */}
          {analysis.biased_phrases?.length > 0 && (
            <div className="card" style={{ marginBottom: 16, borderColor: "rgba(239,68,68,0.25)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--danger)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                Language Issues Detected
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {analysis.biased_phrases.map((p, i) => (
                  <span key={i} style={{
                    padding: "3px 10px", borderRadius: 6, fontSize: 13,
                    background: "var(--danger-muted)", color: "var(--danger)",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }}>"{p}"</span>
                ))}
              </div>
            </div>
          )}

          {/* Issues + Suggestions */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
            <div className="card">
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--warning)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
                Issues
              </div>
              {analysis.issues?.length
                ? analysis.issues.map((item, i) => (
                    <div key={i} style={{
                      fontSize: 13, color: "var(--text2)", padding: "7px 0",
                      borderBottom: i < analysis.issues.length - 1 ? "1px solid var(--border)" : "none",
                      lineHeight: 1.5,
                    }}>
                      {item}
                    </div>
                  ))
                : <div style={{ fontSize: 13, color: "var(--text3)" }}>No issues detected.</div>
              }
            </div>
            <div className="card">
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--success)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
                Recommendations
              </div>
              {analysis.suggestions?.map((s, i) => (
                <div key={i} style={{
                  fontSize: 13, color: "var(--text2)", padding: "7px 0",
                  borderBottom: i < analysis.suggestions.length - 1 ? "1px solid var(--border)" : "none",
                  lineHeight: 1.5,
                }}>
                  {s}
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-primary btn-lg" onClick={onNext}>
            Continue to Upload Resumes
          </button>
        </div>
      )}

      {!analysis && (
        <button className="btn btn-ghost btn-sm" onClick={onNext} style={{ marginTop: 8 }}>
          Skip this step
        </button>
      )}
    </div>
  );
}
