import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const StepBar = ({ current }) => (
  <div style={{ display: "flex", alignItems: "center", marginBottom: 40 }}>
    {["Job Description", "Upload Resumes", "Results"].map((label, i) => {
      const num = i + 1; const done = num < current; const active = num === current;
      return (
        <div key={label} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: done ? "var(--success)" : active ? "linear-gradient(135deg, var(--g1), var(--g2))" : "var(--surface2)",
              border: `1px solid ${done ? "var(--success)" : active ? "transparent" : "var(--border2)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 600, color: done || active ? "white" : "var(--text3)", flexShrink: 0,
              boxShadow: active ? "0 4px 14px rgba(99,102,241,0.4)" : "none",
            }}>
              {done ? <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg> : num}
            </div>
            <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "var(--text)" : done ? "var(--text2)" : "var(--text3)" }}>
              {label}
            </span>
          </div>
          {i < 2 && <div style={{ width: 44, height: 1, background: done ? "var(--success)" : "var(--border)", margin: "0 12px" }} />}
        </div>
      );
    })}
  </div>
);

export default function ResumeScreener({ jdText, onBack, onResults }) {
  const [files,          setFiles]          = useState([]);
  const [customCriteria, setCustomCriteria] = useState("");
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");
  const [dragOver,       setDragOver]       = useState(false);

  const handleFileChange = (e) => {
    const valid = Array.from(e.target.files).filter((f) => f.type === "application/pdf");
    if (valid.length !== e.target.files.length) setError("Only PDF files are accepted.");
    else setError("");
    setFiles((p) => {
      const combined = [...p, ...valid];
      const unique = combined.filter((f, i, arr) => arr.findIndex(x => x.name === f.name && x.size === f.size) === i);
      return unique;
    });
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files).filter((f) => f.type === "application/pdf");
    if (!dropped.length) { setError("Only PDF files are accepted."); return; }
    setError("");
    setFiles((p) => {
      const combined = [...p, ...dropped];
      return combined.filter((f, i, arr) => arr.findIndex(x => x.name === f.name && x.size === f.size) === i);
    });
  };

  const removeFile = (i) => setFiles((p) => p.filter((_, idx) => idx !== i));
  const fmt = (b) => b < 1024 * 1024 ? (b / 1024).toFixed(1) + " KB" : (b / (1024 * 1024)).toFixed(1) + " MB";

  const handleScreen = async () => {
    if (!files.length)   { setError("Please upload at least one resume."); return; }
    if (!jdText.trim())  { setError("No job description found. Please go back and add one."); return; }
    setError(""); setLoading(true);
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
    } finally { setLoading(false); }
  };

  const candidateColors = ["#6366f1", "#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#a78bfa", "#34d399"];

  return (
    <div className="fade-up">
      <StepBar current={2} />

      <div style={{ marginBottom: 32 }}>
        <button onClick={onBack} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "var(--text3)", fontSize: 13, fontFamily: "Inter, sans-serif",
          display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16, padding: 0,
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text3)")}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 8 }}>
          <span className="grad-text">Upload Resumes</span>
        </h1>
        <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.6 }}>
          Upload PDF resumes to screen. Each candidate will be anonymised and assigned a label for fair evaluation.
        </p>
      </div>

      {/* Drop zone */}
      <div className="card" style={{ marginBottom: 20 }}>
        <label style={{ marginBottom: 12 }}>Resume Files <span style={{ color: "var(--text3)", fontWeight: 400, textTransform: "none", fontSize: 12 }}>— PDF only</span></label>
        <label
          htmlFor="file-upload"
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 10,
            border: `2px dashed ${dragOver ? "var(--g1)" : "var(--border2)"}`,
            borderRadius: 12,
            padding: "44px 20px", textAlign: "center", cursor: "pointer",
            background: dragOver
              ? "linear-gradient(135deg, rgba(99,102,241,0.07), rgba(59,130,246,0.05))"
              : "var(--surface2)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { if (!dragOver) { e.currentTarget.style.borderColor = "var(--g2)"; e.currentTarget.style.background = "rgba(59,130,246,0.05)"; }}}
          onMouseLeave={(e) => { if (!dragOver) { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.background = "var(--surface2)"; }}}
        >
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(59,130,246,0.08))",
            border: "1px solid rgba(99,102,241,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 14V4M7 8l4-4 4 4" stroke="var(--g1)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 16v1a2 2 0 002 2h10a2 2 0 002-2v-1" stroke="var(--g2)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>
              {dragOver ? "Drop files here" : "Click to upload or drag & drop"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text3)" }}>PDF format only · Multiple files supported</div>
          </div>
          <input id="file-upload" type="file" accept=".pdf" multiple onChange={handleFileChange} style={{ display: "none" }} />
        </label>

        {/* File list */}
        {files.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {files.length} file{files.length > 1 ? "s" : ""} ready
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {files.map((file, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", background: "var(--surface2)",
                  borderRadius: 10, border: "1px solid var(--border)",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border2)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                >
                  {/* Candidate color dot + icon */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                    background: candidateColors[i % candidateColors.length] + "18",
                    border: `1px solid ${candidateColors[i % candidateColors.length]}33`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="2" y="1" width="10" height="12" rx="2" stroke={candidateColors[i % candidateColors.length]} strokeWidth="1.3"/>
                      <path d="M4.5 5h5M4.5 7.5h3.5M4.5 10h2" stroke={candidateColors[i % candidateColors.length]} strokeWidth="1.1" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 1 }}>
                      Candidate {String.fromCharCode(65 + i)}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {file.name} · {fmt(file.size)}
                    </div>
                  </div>
                  <button onClick={() => removeFile(i)} style={{
                    background: "none", border: "none", color: "var(--text3)",
                    cursor: "pointer", padding: "4px 6px", borderRadius: 6,
                    fontSize: 16, lineHeight: 1, transition: "color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.background = "var(--danger-muted)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text3)"; e.currentTarget.style.background = "none"; }}
                  >×</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Custom Criteria */}
      <div className="card" style={{ marginBottom: 24 }}>
        <label>
          Additional Screening Criteria
          <span style={{ color: "var(--text3)", fontWeight: 400, textTransform: "none", letterSpacing: "normal", fontSize: 12, marginLeft: 8 }}>Optional</span>
        </label>
        <textarea
          rows={4}
          placeholder="e.g. Must have 3+ years Python experience. React knowledge preferred. Startup background is a plus."
          value={customCriteria}
          onChange={(e) => setCustomCriteria(e.target.value)}
        />
        <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="var(--text3)" strokeWidth="1.2"/>
            <path d="M6 5.5v3M6 3.5v.5" stroke="var(--text3)" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Applied alongside the job description when scoring each candidate.
        </div>
      </div>

      {error && (
        <div style={{
          padding: "11px 14px", background: "var(--danger-muted)",
          border: "1px solid rgba(239,68,68,0.2)", borderRadius: 9,
          fontSize: 13, color: "var(--danger)", marginBottom: 18,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="var(--danger)" strokeWidth="1.3"/>
            <path d="M7 4v3.5M7 9.5v.5" stroke="var(--danger)" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}

      <button
        className="btn btn-primary btn-lg"
        onClick={handleScreen}
        disabled={loading || !files.length}
        style={{ minWidth: 220 }}
      >
        {loading ? (
          <>
            <span className="spinner" />
            Processing {files.length} Resume{files.length !== 1 ? "s" : ""}...
          </>
        ) : (
          <>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <circle cx="7.5" cy="7.5" r="6.5" stroke="white" strokeWidth="1.4"/>
              <path d="M5 7.5l2 2 3.5-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Screen {files.length > 0 ? `${files.length} ` : ""}Resume{files.length !== 1 ? "s" : ""}
          </>
        )}
      </button>
    </div>
  );
}
