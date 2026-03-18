import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const StepBar = ({ current }) => (
  <div style={{ display: "flex", alignItems: "center", marginBottom: 40 }}>
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
          {i < 2 && <div style={{ width: 40, height: 1, background: done ? "var(--success)" : "var(--border)", margin: "0 12px" }} />}
        </div>
      );
    })}
  </div>
);

export default function ResumeScreener({ jdText, onBack, onResults }) {
  const [files, setFiles] = useState([]);
  const [customCriteria, setCustomCriteria] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const valid = Array.from(e.target.files).filter((f) => f.type === "application/pdf");
    if (valid.length !== e.target.files.length) setError("Only PDF files are accepted.");
    else setError("");
    setFiles(valid);
  };

  const removeFile = (i) => setFiles((p) => p.filter((_, idx) => idx !== i));

  const fmt = (b) => b < 1024 * 1024 ? (b / 1024).toFixed(1) + " KB" : (b / (1024 * 1024)).toFixed(1) + " MB";

  const handleScreen = async () => {
    if (!files.length) { setError("Please upload at least one resume."); return; }
    if (!jdText.trim()) { setError("No job description found. Please go back and add one."); return; }
    setError("");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("job_description", jdText);
      fd.append("custom_criteria", customCriteria);
      files.forEach((f) => fd.append("resumes", f));
      const res = await fetch(`${API_BASE}/screen-resumes`, { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Error ${res.status}`);
      }
      onResults(await res.json());
    } catch (e) {
      setError(e.message || "Request failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-up">
      <StepBar current={2} />

      <div style={{ marginBottom: 32 }}>
        <button
          onClick={onBack}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text3)", fontSize: 13, fontFamily: "Inter, sans-serif",
            display: "flex", alignItems: "center", gap: 6, marginBottom: 16, padding: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Upload Resumes</h1>
        <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.6 }}>
          Upload PDF resumes to screen. Each candidate will be assigned a label for consistent evaluation.
        </p>
      </div>

      {/* Upload Area */}
      <div className="card" style={{ marginBottom: 20 }}>
        <label>Resume Files</label>
        <label
          htmlFor="file-upload"
          style={{
            display: "block", border: "1px dashed var(--border2)", borderRadius: 10,
            padding: "36px 20px", textAlign: "center", cursor: "pointer",
            background: "var(--surface2)", transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "var(--accent-muted)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.background = "var(--surface2)"; }}
        >
          <div style={{ marginBottom: 8 }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ margin: "0 auto 10px", display: "block" }}>
              <rect x="5" y="3" width="18" height="22" rx="3" stroke="var(--text3)" strokeWidth="1.5" />
              <path d="M9 10h10M9 14h7M9 18h5" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text2)", marginBottom: 4 }}>
              Click to upload resumes
            </div>
            <div style={{ fontSize: 12, color: "var(--text3)" }}>PDF format only — multiple files supported</div>
          </div>
          <input id="file-upload" type="file" accept=".pdf" multiple onChange={handleFileChange} style={{ display: "none" }} />
        </label>

        {files.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10, fontWeight: 500 }}>
              {files.length} file{files.length > 1 ? "s" : ""} selected
            </div>
            {files.map((file, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 14px", background: "var(--surface2)",
                borderRadius: 8, marginBottom: 6, border: "1px solid var(--border)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, background: "var(--accent-muted)", borderRadius: 6,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid rgba(59,125,248,0.2)",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="2" y="1" width="10" height="12" rx="2" stroke="var(--accent)" strokeWidth="1.3" />
                      <path d="M4 5h6M4 8h4" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>
                      Candidate {String.fromCharCode(65 + i)}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>{fmt(file.size)}</div>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  style={{
                    background: "none", border: "none", color: "var(--text3)",
                    cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "2px 6px",
                    borderRadius: 4, transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--danger)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text3)")}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Criteria */}
      <div className="card" style={{ marginBottom: 20 }}>
        <label>Screening Criteria <span style={{ color: "var(--text3)", fontWeight: 400 }}>(Optional)</span></label>
        <textarea
          rows={4}
          placeholder="Specify any additional requirements, e.g. Must have 3+ years Python experience. React knowledge preferred."
          value={customCriteria}
          onChange={(e) => setCustomCriteria(e.target.value)}
        />
        <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 8 }}>
          Applied alongside the job description when scoring each candidate.
        </div>
      </div>

      {error && (
        <div style={{
          padding: "10px 14px", background: "var(--danger-muted)",
          border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8,
          fontSize: 13, color: "var(--danger)", marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      <button
        className="btn btn-primary btn-lg"
        onClick={handleScreen}
        disabled={loading || !files.length}
        style={{ minWidth: 200 }}
      >
        {loading
          ? <><span className="spinner" />Processing {files.length} Resume{files.length !== 1 ? "s" : ""}...</>
          : `Screen ${files.length > 0 ? files.length + " " : ""}Resume${files.length !== 1 ? "s" : ""}`
        }
      </button>
    </div>
  );
}
