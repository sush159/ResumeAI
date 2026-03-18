import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function ResumeScreener({ jdText, onBack, onResults }) {
  const [files, setFiles] = useState([]);
  const [customCriteria, setCustomCriteria] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files).filter((f) => f.type === "application/pdf");
    if (selected.length !== e.target.files.length) {
      setError("Some files were skipped — only PDF files are supported.");
    } else {
      setError("");
    }
    setFiles(selected);
  };

  const removeFile = (index) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleScreen = async () => {
    if (files.length === 0) { setError("Please upload at least one resume."); return; }
    if (!jdText.trim()) { setError("No job description found. Please go back and add one."); return; }

    setError("");
    setLoading(true);
    setProgress(`Analyzing ${files.length} resume${files.length > 1 ? "s" : ""}...`);

    try {
      const formData = new FormData();
      formData.append("job_description", jdText);
      formData.append("custom_criteria", customCriteria);
      files.forEach((file) => formData.append("resumes", file));

      const res = await fetch(`${API_BASE}/screen-resumes`, { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const data = await res.json();
      onResults(data);
    } catch {
      setError("Something went wrong. Make sure the backend is running and your API key is set.");
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 40 }}>
        <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: 20, fontSize: 12 }}>
          ← Back
        </button>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 32, color: "white", marginBottom: 10 }}>
          Step 2 — Upload Resumes
        </div>
        <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6 }}>
          Upload PDF resumes to screen. All personal information is automatically removed before AI scoring to reduce bias.
        </p>
      </div>

      {/* File Upload */}
      <div className="card" style={{ marginBottom: 24 }}>
        <label>Upload PDF Resumes</label>
        <label
          htmlFor="file-upload"
          style={{
            display: "block",
            border: "2px dashed var(--border)",
            borderRadius: 10,
            padding: "40px 20px",
            textAlign: "center",
            cursor: "pointer",
            transition: "border-color 0.2s",
            background: "#0d0d15",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
          <div style={{ color: "var(--text)", fontSize: 14, marginBottom: 6 }}>Click to upload or drag & drop</div>
          <div style={{ color: "var(--muted)", fontSize: 12 }}>PDF files only — multiple allowed</div>
          <input
            id="file-upload"
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </label>

        {files.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
              {files.length} file{files.length > 1 ? "s" : ""} selected
            </div>
            {files.map((file, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "#0d0d15",
                  borderRadius: 8,
                  marginBottom: 6,
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "var(--accent)", fontSize: 16 }}>📋</span>
                  <div>
                    <div style={{ fontSize: 13, color: "var(--text)" }}>
                      Will be labeled as{" "}
                      <strong style={{ color: "var(--accent)" }}>
                        Candidate {String.fromCharCode(65 + i)}
                      </strong>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>{formatSize(file.size)}</div>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 18 }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Criteria */}
      <div className="card" style={{ marginBottom: 24 }}>
        <label>Custom Criteria (Optional)</label>
        <textarea
          rows={4}
          placeholder="e.g. Must have 3+ years of Python experience. Must have worked in a startup. React knowledge is a bonus."
          value={customCriteria}
          onChange={(e) => setCustomCriteria(e.target.value)}
        />
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>
          These rules are applied on top of the job description when scoring.
        </div>
      </div>

      {/* Bias Notice */}
      <div style={{
        padding: "14px 18px", borderRadius: 8,
        border: "1px solid #7c6af733", background: "#7c6af711",
        marginBottom: 24, fontSize: 13, color: "var(--muted)", lineHeight: 1.6,
      }}>
        🛡️ <strong style={{ color: "var(--accent)" }}>Bias protection active.</strong>{" "}
        Names, emails, phone numbers, and URLs are removed before scoring. Candidates are labeled A, B, C… for blind evaluation.
      </div>

      {error && (
        <div style={{
          color: "var(--red)", fontSize: 13, marginBottom: 16,
          padding: "10px 14px", background: "#f8717111",
          borderRadius: 8, border: "1px solid #f8717133",
        }}>
          {error}
        </div>
      )}

      <button
        className="btn btn-primary"
        onClick={handleScreen}
        disabled={loading || files.length === 0}
        style={{ width: "100%", padding: "16px", fontSize: 15 }}
      >
        {loading
          ? <><span className="spinner" style={{ marginRight: 10 }} />{progress}</>
          : `⚡ Screen ${files.length > 0 ? files.length : ""} Resume${files.length !== 1 ? "s" : ""}`
        }
      </button>
    </div>
  );
}
