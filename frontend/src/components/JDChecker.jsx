import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function JDChecker({ jdData, setJdData, onNext }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analysis = jdData.analysis;

  const scoreColor = (score) => {
    if (score >= 75) return "var(--green)";
    if (score >= 50) return "var(--yellow)";
    return "var(--red)";
  };

  const verdictColor = (verdict) =>
    ({ Good: "var(--green)", "Needs Improvement": "var(--yellow)", Poor: "var(--red)" }[verdict] || "var(--muted)");

  const handleAnalyze = async () => {
    if (!jdData.text.trim()) {
      setError("Please paste a job description first.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("job_description", jdData.text);
      const res = await fetch(`${API_BASE}/check-jd`, { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setJdData((prev) => ({ ...prev, analysis: data }));
    } catch (e) {
      setError(e.message || "Something went wrong. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 32, color: "white", marginBottom: 10 }}>
          Step 1 — Check Your Job Description
        </div>
        <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6 }}>
          Before screening resumes, let's make sure your JD is clear, inclusive, and bias-free.
          Biased JDs attract fewer diverse candidates before screening even begins.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <label>Paste Your Job Description</label>
        <textarea
          rows={10}
          placeholder='e.g. We are looking for a rockstar developer who is passionate about...'
          value={jdData.text}
          onChange={(e) => setJdData((prev) => ({ ...prev, text: e.target.value, analysis: null }))}
        />
        {error && (
          <div style={{ color: "var(--red)", fontSize: 12, marginTop: 10 }}>{error}</div>
        )}
        <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center" }}>
          <button className="btn btn-primary" onClick={handleAnalyze} disabled={loading}>
            {loading ? <><span className="spinner" style={{ marginRight: 8 }} />Analyzing...</> : "🔍 Analyze JD"}
          </button>
          {analysis && (
            <button className="btn btn-secondary" onClick={onNext}>
              Continue to Upload →
            </button>
          )}
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="fade-in">
          {/* Score Header */}
          <div className="card" style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 48, fontWeight: "bold", color: scoreColor(analysis.quality_score), fontFamily: "'Syne', sans-serif" }}>
                {analysis.quality_score}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Quality Score
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 8 }}>
                <span className="tag" style={{
                  background: verdictColor(analysis.overall_verdict) + "22",
                  color: verdictColor(analysis.overall_verdict),
                  border: `1px solid ${verdictColor(analysis.overall_verdict)}44`,
                }}>
                  {analysis.overall_verdict}
                </span>
              </div>
              <p style={{ color: "var(--text)", fontSize: 14, lineHeight: 1.6 }}>{analysis.summary}</p>
            </div>
          </div>

          {/* Biased Phrases */}
          {analysis.biased_phrases?.length > 0 && (
            <div className="card" style={{ marginBottom: 16, borderColor: "#f8717133" }}>
              <div style={{ fontSize: 12, color: "var(--red)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
                ⚠ Potentially Biased Phrases
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {analysis.biased_phrases.map((phrase, i) => (
                  <span key={i} className="tag" style={{ background: "#f8717122", color: "var(--red)", border: "1px solid #f8717133" }}>
                    "{phrase}"
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Issues & Suggestions */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div className="card">
              <div style={{ fontSize: 12, color: "var(--yellow)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
                Issues Found
              </div>
              {analysis.issues?.length
                ? analysis.issues.map((issue, i) => (
                    <div key={i} style={{ fontSize: 13, color: "var(--text)", padding: "6px 0", borderBottom: i < analysis.issues.length - 1 ? "1px solid var(--border)" : "none" }}>
                      • {issue}
                    </div>
                  ))
                : <div style={{ color: "var(--muted)", fontSize: 13 }}>No major issues found!</div>
              }
            </div>
            <div className="card">
              <div style={{ fontSize: 12, color: "var(--green)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
                Suggestions
              </div>
              {analysis.suggestions?.map((s, i) => (
                <div key={i} style={{ fontSize: 13, color: "var(--text)", padding: "6px 0", borderBottom: i < analysis.suggestions.length - 1 ? "1px solid var(--border)" : "none" }}>
                  ✓ {s}
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <button className="btn btn-primary" onClick={onNext} style={{ padding: "14px 40px", fontSize: 14 }}>
              Proceed to Upload Resumes →
            </button>
          </div>
        </div>
      )}

      {!analysis && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={onNext}>
            Skip this step →
          </button>
        </div>
      )}
    </div>
  );
}
