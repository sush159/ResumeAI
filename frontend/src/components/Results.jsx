import { useState } from "react";

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
            <span style={{ fontSize: 13, fontWeight: active ? 500 : 400, color: active ? "var(--text)" : done ? "var(--text2)" : "var(--text3)" }}>
              {label}
            </span>
          </div>
          {i < 2 && <div style={{ width: 40, height: 1, background: done ? "var(--success)" : "var(--border)", margin: "0 12px" }} />}
        </div>
      );
    })}
  </div>
);

const scoreColor = (s) => s >= 75 ? "var(--success)" : s >= 50 ? "var(--warning)" : "var(--danger)";
const recColor   = (r) => ({ Shortlist: "var(--success)", Maybe: "var(--warning)", Reject: "var(--danger)" }[r] || "var(--text3)");

const ScoreBar = ({ label, score }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
      <span style={{ fontSize: 12, color: "var(--text3)", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: score != null ? scoreColor(score) : "var(--text3)" }}>
        {score != null ? score : "—"}
      </span>
    </div>
    {score != null && (
      <div className="track">
        <div className="fill" style={{ width: `${score}%`, background: scoreColor(score) }} />
      </div>
    )}
  </div>
);

function CandidateCard({ candidate, rank }) {
  const [expanded, setExpanded] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

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
    <div className="card fade-up" style={{
      marginBottom: 12,
      borderColor: expanded ? "var(--border2)" : "var(--border)",
      transition: "border-color 0.15s",
    }}>
      {/* Header row */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Rank */}
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: rank === 1 ? "var(--warning-muted)" : "var(--surface2)",
          border: `1px solid ${rank === 1 ? "rgba(234,179,8,0.3)" : "var(--border)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 600,
          color: rank === 1 ? "var(--warning)" : "var(--text3)",
        }}>
          #{rank}
        </div>

        {/* Label + summary */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 3, letterSpacing: "-0.01em" }}>
            {candidate.candidate_label}
          </div>
          <p style={{
            fontSize: 12, color: "var(--text3)", lineHeight: 1.4,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {candidate.summary?.substring(0, 120)}...
          </p>
        </div>

        {/* Score */}
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: scoreColor(candidate.overall_score), lineHeight: 1, letterSpacing: "-0.03em" }}>
            {candidate.overall_score}
          </div>
          <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>Score</div>
        </div>

        {/* Recommendation */}
        <div style={{ flexShrink: 0 }}>
          <span style={{
            padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500,
            background: recColor(candidate.recommendation) + "15",
            color: recColor(candidate.recommendation),
            border: `1px solid ${recColor(candidate.recommendation)}30`,
          }}>
            {candidate.recommendation}
          </span>
        </div>

        {/* Chevron */}
        <div style={{
          color: "var(--text3)", transition: "transform 0.2s",
          transform: expanded ? "rotate(180deg)" : "none", flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="fade-up" style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 20 }}>
            {/* Scores */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
                Score Breakdown
              </div>
              <ScoreBar label="JD Match" score={candidate.jd_match_score} />
              <ScoreBar label="Skills" score={candidate.skills_score} />
              <ScoreBar label="Custom Criteria" score={candidate.custom_criteria_score} />
              <ScoreBar label="Overall" score={candidate.overall_score} />
            </div>

            {/* Strengths & Gaps */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--success)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                Strengths
              </div>
              {candidate.strengths?.map((s, i) => (
                <div key={i} style={{ fontSize: 13, color: "var(--text2)", padding: "4px 0", lineHeight: 1.5 }}>
                  — {s}
                </div>
              ))}
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--danger)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 14, marginBottom: 10 }}>
                Gaps
              </div>
              {candidate.gaps?.length
                ? candidate.gaps.map((g, i) => (
                    <div key={i} style={{ fontSize: 13, color: "var(--text3)", padding: "4px 0", lineHeight: 1.5 }}>
                      — {g}
                    </div>
                  ))
                : <div style={{ fontSize: 13, color: "var(--text3)" }}>No significant gaps noted.</div>
              }
            </div>
          </div>

          {/* Summary */}
          <div style={{
            padding: 16, background: "var(--surface2)", borderRadius: 8,
            fontSize: 13, color: "var(--text2)", lineHeight: 1.7, marginBottom: 16,
            border: "1px solid var(--border)",
          }}>
            {candidate.summary}
          </div>

          {/* Feedback email */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowEmail(!showEmail)}
          >
            {showEmail ? "Hide" : "View"} Feedback Draft
          </button>

          {showEmail && (
            <div className="fade-up" style={{
              marginTop: 12, padding: 16, background: "var(--surface2)",
              border: "1px solid var(--border2)", borderRadius: 8,
              fontSize: 13, color: "var(--text2)", lineHeight: 1.8,
              fontStyle: "italic",
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, fontStyle: "normal" }}>
                Feedback Draft
              </div>
              {candidate.feedback_email}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Results({ results, onReset }) {
  if (!results?.candidates) return null;

  const candidates = results.candidates;
  const shortlisted = candidates.filter((c) => c.recommendation === "Shortlist").length;
  const maybe       = candidates.filter((c) => c.recommendation === "Maybe").length;
  const rejected    = candidates.filter((c) => c.recommendation === "Reject").length;

  return (
    <div className="fade-up">
      <StepBar current={3} />

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
          Screening Results
        </h1>
        <p style={{ fontSize: 14, color: "var(--text2)" }}>
          {candidates.length} candidate{candidates.length !== 1 ? "s" : ""} evaluated and ranked by overall fit.
        </p>
      </div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Shortlisted",    count: shortlisted, color: "var(--success)" },
          { label: "Under Review",   count: maybe,       color: "var(--warning)" },
          { label: "Not Progressing",count: rejected,    color: "var(--danger)"  },
        ].map(({ label, count, color }) => (
          <div key={label} className="card" style={{ textAlign: "center", borderColor: color + "22", padding: "20px 16px" }}>
            <div style={{ fontSize: 36, fontWeight: 700, color, lineHeight: 1, letterSpacing: "-0.03em" }}>{count}</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 6, fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Candidate list */}
      {candidates.map((c, i) => (
        <CandidateCard key={c.candidate_label} candidate={c} rank={i + 1} />
      ))}

      <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
        <button className="btn btn-secondary" onClick={onReset}>
          Start New Screening
        </button>
      </div>
    </div>
  );
}
