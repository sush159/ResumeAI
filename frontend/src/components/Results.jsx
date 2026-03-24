import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const STATUSES = ["To Review", "Contacted", "Interviewing", "Offer Sent", "Hired", "Declined"];
const statusColor = (s) => ({
  "To Review":    "var(--text3)",
  "Contacted":    "var(--accent)",
  "Interviewing": "var(--warning)",
  "Offer Sent":   "#a78bfa",
  "Hired":        "var(--success)",
  "Declined":     "var(--danger)",
}[s] || "var(--text3)");

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

const scoreColor = (s) => s >= 75 ? "var(--success)" : s >= 50 ? "var(--warning)" : "var(--danger)";
const recColor   = (r) => ({ Shortlist: "var(--success)", Maybe: "var(--warning)", Reject: "var(--danger)" }[r] || "var(--text3)");

// Circular SVG score ring
function ScoreRing({ score, size = 72, strokeWidth = 6 }) {
  if (score == null) return <div style={{ width: size, height: size, flexShrink: 0 }} />;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div style={{ width: size, height: size, position: "relative", flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--surface3)" strokeWidth={strokeWidth} />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s cubic-bezier(.22,.68,0,1.2)" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontSize: size === 72 ? 20 : 14, fontWeight: 800, color, lineHeight: 1, letterSpacing: "-0.03em" }}>{score}</div>
      </div>
    </div>
  );
}

// Score row with bar
const ScoreBar = ({ label, score }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
      <span style={{ fontSize: 12, color: "var(--text3)" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: score != null ? scoreColor(score) : "var(--text3)" }}>{score != null ? score : "—"}</span>
    </div>
    {score != null && (
      <div className="track">
        <div className="fill" style={{ width: `${score}%`, background: scoreColor(score) }} />
      </div>
    )}
  </div>
);

// Email Modal
function EmailModal({ candidate, onClose }) {
  const [email,   setEmail]   = useState("");
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");
  const [status,  setStatus]  = useState("");

  // Poll until the server responds (handles Render free tier cold start)
  const waitForServer = async (maxWaitMs = 90000) => {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      try {
        const r = await fetch(`${API_BASE}/`);
        if (r.ok) return true;
      } catch {}
      await new Promise((r) => setTimeout(r, 3000));
    }
    return false;
  };

  const handleSend = async () => {
    if (!email.trim()) { setError("Please enter a recipient email address."); return; }
    setSending(true); setError(""); setStatus("");
    try {
      setStatus("Waking up server...");
      const alive = await waitForServer();
      if (!alive) throw new Error("Server did not respond in time. Please try again.");

      setStatus("Sending email...");
      const res = await fetch(`${API_BASE}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to_email: email, candidate_label: candidate.candidate_label, feedback_text: candidate.feedback_email }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.detail || `Error ${res.status}`);
      setSent(true);
    } catch (e) {
      setError(e.message || "Failed to send email.");
    } finally { setSending(false); setStatus(""); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal fade-up" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>Send Feedback Email</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{candidate.candidate_label}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "4px 8px" }}>×</button>
        </div>

        {sent ? (
          <div style={{ textAlign: "center", padding: "28px 0" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", margin: "0 auto 16px",
              background: "var(--success-muted)", border: "2px solid var(--success)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l4.5 4.5L19 7" stroke="var(--success)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>Email sent successfully</div>
            <div style={{ fontSize: 13, color: "var(--text3)" }}>Feedback sent to {email}</div>
            <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ marginTop: 20 }}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <label>Recipient Email Address</label>
              <input type="email" placeholder="candidate@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label>Feedback Message</label>
              <div style={{
                padding: 14, background: "var(--surface2)", border: "1px solid var(--border2)",
                borderRadius: 9, fontSize: 13, color: "var(--text2)", lineHeight: 1.7,
                maxHeight: 180, overflowY: "auto",
              }}>
                {candidate.feedback_email}
              </div>
            </div>
            {error && (
              <div style={{ padding: "10px 14px", background: "var(--danger-muted)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, fontSize: 13, color: "var(--danger)", marginBottom: 16 }}>
                {error}
              </div>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleSend} disabled={sending}>
                {sending ? <><span className="spinner" />{status || "Sending..."}</> : "Send Email"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CandidateCard({ candidate, rank, status, onStatusChange }) {
  const [expanded,  setExpanded]  = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  const rankColors = {
    1: { bg: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.08))", border: "rgba(245,158,11,0.35)", text: "#f59e0b" },
    2: { bg: "linear-gradient(135deg, rgba(148,163,184,0.1), rgba(100,116,139,0.06))", border: "rgba(148,163,184,0.2)", text: "#94a3b8" },
    3: { bg: "linear-gradient(135deg, rgba(180,120,60,0.1), rgba(120,80,40,0.06))", border: "rgba(180,120,60,0.2)", text: "#c47c3e" },
  };
  const rankStyle = rankColors[rank] || { bg: "var(--surface2)", border: "var(--border)", text: "var(--text3)" };

  if (candidate.error) {
    return (
      <div className="card" style={{ marginBottom: 12, borderColor: "rgba(239,68,68,0.25)" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text2)" }}>{candidate.candidate_label}</div>
          <div style={{ fontSize: 13, color: "var(--danger)" }}>{candidate.error}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showEmail && <EmailModal candidate={candidate} onClose={() => setShowEmail(false)} />}
      <div style={{
        background: "var(--surface)", border: `1px solid ${expanded ? "rgba(99,102,241,0.3)" : "var(--border)"}`,
        borderRadius: 14, padding: "18px 22px", marginBottom: 10,
        transition: "all 0.2s",
        boxShadow: expanded ? "0 0 30px rgba(99,102,241,0.06)" : "none",
      }}>
        {/* Rank bar accent */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
          background: rank <= 3 ? rankStyle.text : "transparent",
          borderRadius: "14px 0 0 14px",
        }} />

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Rank badge */}
          <div style={{
            width: 38, height: 38, borderRadius: 9, flexShrink: 0,
            background: rankStyle.bg,
            border: `1px solid ${rankStyle.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: rankStyle.text,
          }}>#{rank}</div>

          {/* Label + summary */}
          <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 3, letterSpacing: "-0.01em" }}>
              {candidate.candidate_label}
            </div>
            <p style={{ fontSize: 12, color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {candidate.summary?.substring(0, 115)}...
            </p>
          </div>

          {/* Status dropdown */}
          <select
            value={status || "To Review"}
            onChange={(e) => onStatusChange(candidate.candidate_label, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "auto", padding: "5px 10px", fontSize: 12, flexShrink: 0,
              color: statusColor(status || "To Review"),
              borderColor: statusColor(status || "To Review") + "44",
              background: statusColor(status || "To Review") + "11",
            }}
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Score ring */}
          <div style={{ cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
            <ScoreRing score={candidate.overall_score} size={52} strokeWidth={5} />
          </div>

          {/* Recommendation badge */}
          <span style={{
            padding: "5px 13px", borderRadius: 7, fontSize: 12, fontWeight: 600, flexShrink: 0,
            background: recColor(candidate.recommendation) + "15",
            color: recColor(candidate.recommendation),
            border: `1px solid ${recColor(candidate.recommendation)}30`,
          }}>{candidate.recommendation}</span>

          {/* Chevron */}
          <div style={{ color: "var(--text3)", transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "none", flexShrink: 0, cursor: "pointer" }}
            onClick={() => setExpanded(!expanded)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="fade-up" style={{ marginTop: 22, paddingTop: 22, borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginBottom: 20 }}>
              {/* Score breakdown */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Score Breakdown</div>
                <ScoreBar label="JD Match"        score={candidate.jd_match_score} />
                <ScoreBar label="Skills"          score={candidate.skills_score} />
                <ScoreBar label="Custom Criteria" score={candidate.custom_criteria_score} />
                <ScoreBar label="Overall"         score={candidate.overall_score} />
              </div>
              {/* Strengths & Gaps */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--success)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Strengths</div>
                {candidate.strengths?.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--text2)", marginBottom: 6, lineHeight: 1.4 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--success)", flexShrink: 0, marginTop: 5 }} />
                    {s}
                  </div>
                ))}
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--danger)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 18, marginBottom: 12 }}>Gaps</div>
                {candidate.gaps?.length
                  ? candidate.gaps.map((g, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--text3)", marginBottom: 6, lineHeight: 1.4 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--danger)", flexShrink: 0, marginTop: 5 }} />
                        {g}
                      </div>
                    ))
                  : <div style={{ fontSize: 13, color: "var(--text3)" }}>No significant gaps noted.</div>
                }
              </div>
            </div>

            {/* Summary */}
            <div style={{
              padding: "14px 16px", background: "var(--surface2)", borderRadius: 10,
              fontSize: 13, color: "var(--text2)", lineHeight: 1.75,
              marginBottom: 16, border: "1px solid var(--border)",
            }}>
              {candidate.summary}
            </div>

            <button className="btn btn-secondary btn-sm" onClick={() => setShowEmail(true)}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <rect x="1" y="2.5" width="11" height="8" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M1 4.5l5.5 3.5 5.5-3.5" stroke="currentColor" strokeWidth="1.3"/>
              </svg>
              Send Feedback Email
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function Results({ results, onReset, onStatusChange, sessionId, user }) {
  const [statuses, setStatuses] = useState(() => {
    if (!sessionId || !user) return {};
    const history = JSON.parse(localStorage.getItem(`history_${user?.email}`) || "[]");
    const entry   = history.find((h) => h.id === sessionId);
    return entry?.statuses || {};
  });

  if (!results?.candidates) return null;
  const candidates  = results.candidates;
  const shortlisted = candidates.filter((c) => c.recommendation === "Shortlist").length;
  const maybe       = candidates.filter((c) => c.recommendation === "Maybe").length;
  const rejected    = candidates.filter((c) => c.recommendation === "Reject").length;

  const handleStatusChange = (label, status) => {
    const updated = { ...statuses, [label]: status };
    setStatuses(updated);
    onStatusChange?.(updated);
  };

  const exportCSV = () => {
    const headers = ["Rank", "Candidate", "Status", "Overall Score", "JD Match", "Skills Score", "Recommendation", "Summary"];
    const rows    = candidates.map((c, i) => [
      i + 1, c.candidate_label, statuses[c.candidate_label] || "To Review",
      c.overall_score, c.jd_match_score, c.skills_score, c.recommendation,
      `"${(c.summary || "").replace(/"/g, '""')}"`,
    ]);
    const csv  = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `screening_results_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fade-up">
      <StepBar current={3} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 8 }}>
            <span className="grad-text">Screening Results</span>
          </h1>
          <p style={{ fontSize: 14, color: "var(--text2)" }}>
            {candidates.length} candidate{candidates.length !== 1 ? "s" : ""} evaluated and ranked by overall fit.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={exportCSV} style={{ flexShrink: 0, marginLeft: 20 }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1v8M3.5 6.5l3 2.5 3-2.5M1.5 11h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Export CSV
        </button>
      </div>

      {/* Summary stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 32 }}>
        {[
          { label: "Shortlisted",     count: shortlisted, color: "var(--success)", muted: "var(--success-muted)", grad: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.08))" },
          { label: "Under Review",    count: maybe,       color: "var(--warning)", muted: "var(--warning-muted)", grad: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(217,119,6,0.06))" },
          { label: "Not Progressing", count: rejected,    color: "var(--danger)",  muted: "var(--danger-muted)",  grad: "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(220,38,38,0.05))" },
        ].map(({ label, count, color, grad }) => (
          <div key={label} style={{
            borderRadius: 14, padding: "20px 22px",
            background: grad,
            border: `1px solid ${color}22`,
            textAlign: "center",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
          >
            <div style={{ fontSize: 42, fontWeight: 800, color, lineHeight: 1, letterSpacing: "-0.04em", marginBottom: 6 }}>{count}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color, opacity: 0.85 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Candidate Cards */}
      <div style={{ position: "relative" }}>
        {candidates.map((c, i) => (
          <CandidateCard
            key={c.candidate_label}
            candidate={c}
            rank={i + 1}
            status={statuses[c.candidate_label]}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
        <button className="btn btn-secondary" onClick={onReset}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 6.5A4.5 4.5 0 1 1 6.5 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M2 3.5v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Start New Screening
        </button>
      </div>
    </div>
  );
}
