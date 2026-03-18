import { useState } from "react";

export default function Results({ results, onReset }) {
  const [expandedCandidate, setExpandedCandidate] = useState(null);
  const [showFeedback, setShowFeedback] = useState({});

  if (!results?.candidates) {
    return <div style={{ color: "var(--muted)" }}>No results found.</div>;
  }

  const candidates = results.candidates;
  const shortlisted = candidates.filter((c) => c.recommendation === "Shortlist");
  const maybes = candidates.filter((c) => c.recommendation === "Maybe");
  const rejected = candidates.filter((c) => c.recommendation === "Reject");

  const scoreColor = (score) => {
    if (score >= 75) return "var(--green)";
    if (score >= 50) return "var(--yellow)";
    return "var(--red)";
  };

  const recColor = (rec) =>
    ({ Shortlist: "var(--green)", Maybe: "var(--yellow)", Reject: "var(--red)" }[rec] || "var(--muted)");

  const ScoreBar = ({ label, score }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {label}
        </span>
        <span style={{ fontSize: 12, color: scoreColor(score), fontWeight: "bold" }}>
          {score ?? "N/A"}
        </span>
      </div>
      {score != null && (
        <div className="score-bar-track">
          <div className="score-bar-fill" style={{ width: `${score}%`, background: scoreColor(score) }} />
        </div>
      )}
    </div>
  );

  const CandidateCard = ({ candidate, rank }) => {
    const isExpanded = expandedCandidate === candidate.candidate_label;
    const feedbackVisible = showFeedback[candidate.candidate_label];

    if (candidate.error) {
      return (
        <div className="card" style={{ marginBottom: 16, borderColor: "#f8717133" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ fontSize: 24, color: "var(--red)" }}>⚠</div>
            <div>
              <div style={{ color: "var(--text)", fontSize: 14 }}>{candidate.candidate_label}</div>
              <div style={{ color: "var(--red)", fontSize: 12 }}>{candidate.error}</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className="card fade-in"
        style={{ marginBottom: 16, borderColor: isExpanded ? "var(--accent)" : "var(--border)", transition: "border-color 0.2s" }}
      >
        {/* Card Header */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}
          onClick={() => setExpandedCandidate(isExpanded ? null : candidate.candidate_label)}
        >
          {/* Rank Badge */}
          <div style={{
            width: 40, height: 40, borderRadius: 8, flexShrink: 0,
            background: rank === 1 ? "#facc1522" : "var(--border)",
            border: `1px solid ${rank === 1 ? "#facc15" : "var(--border)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: rank === 1 ? 18 : 13,
            color: rank === 1 ? "var(--yellow)" : "var(--muted)",
          }}>
            {rank === 1 ? "🏆" : `#${rank}`}
          </div>

          {/* Label + Summary */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 16, color: "white", marginBottom: 4 }}>
              {candidate.candidate_label}
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {candidate.summary?.substring(0, 110)}…
            </p>
          </div>

          {/* Score */}
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{ fontSize: 28, fontWeight: "bold", color: scoreColor(candidate.overall_score), fontFamily: "'Syne', sans-serif" }}>
              {candidate.overall_score}
            </div>
            <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.08em" }}>SCORE</div>
          </div>

          {/* Recommendation */}
          <div style={{ flexShrink: 0 }}>
            <span className="tag" style={{
              background: recColor(candidate.recommendation) + "22",
              color: recColor(candidate.recommendation),
              border: `1px solid ${recColor(candidate.recommendation)}44`,
            }}>
              {candidate.recommendation}
            </span>
          </div>

          {/* Chevron */}
          <div style={{ color: "var(--muted)", fontSize: 12, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "none" }}>
            ▼
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="fade-in" style={{ marginTop: 24, borderTop: "1px solid var(--border)", paddingTop: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {/* Score Breakdown */}
              <div>
                <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
                  Score Breakdown
                </div>
                <ScoreBar label="JD Match" score={candidate.jd_match_score} />
                <ScoreBar label="Skills" score={candidate.skills_score} />
                <ScoreBar label="Custom Criteria" score={candidate.custom_criteria_score} />
                <ScoreBar label="Overall" score={candidate.overall_score} />
              </div>

              {/* Strengths & Gaps */}
              <div>
                <div style={{ fontSize: 11, color: "var(--green)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
                  Strengths
                </div>
                {candidate.strengths?.map((s, i) => (
                  <div key={i} style={{ fontSize: 12, color: "var(--text)", padding: "4px 0" }}>✓ {s}</div>
                ))}
                <div style={{ fontSize: 11, color: "var(--red)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 14, marginBottom: 10 }}>
                  Gaps
                </div>
                {candidate.gaps?.map((g, i) => (
                  <div key={i} style={{ fontSize: 12, color: "var(--muted)", padding: "4px 0" }}>✗ {g}</div>
                ))}
              </div>
            </div>

            {/* Full Summary */}
            <div style={{ marginTop: 20, padding: 14, background: "#0d0d15", borderRadius: 8, fontSize: 13, color: "var(--text)", lineHeight: 1.7 }}>
              {candidate.summary}
            </div>

            {/* Feedback Email */}
            <div style={{ marginTop: 16 }}>
              <button
                className="btn btn-secondary"
                style={{ fontSize: 12 }}
                onClick={() =>
                  setShowFeedback((prev) => ({ ...prev, [candidate.candidate_label]: !feedbackVisible }))
                }
              >
                {feedbackVisible ? "Hide" : "Show"} Candidate Feedback Email ✉
              </button>

              {feedbackVisible && (
                <div
                  className="fade-in"
                  style={{
                    marginTop: 12, padding: 16,
                    background: "#0d0d15",
                    border: "1px solid #7c6af733",
                    borderRadius: 8,
                    fontSize: 13, color: "var(--text)", lineHeight: 1.8, fontStyle: "italic",
                  }}
                >
                  <div style={{ fontSize: 10, color: "var(--accent)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10, fontStyle: "normal" }}>
                    📧 Suggested Feedback Email
                  </div>
                  {candidate.feedback_email}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 32, color: "white", marginBottom: 10 }}>
          Screening Results
        </div>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>
          {candidates.length} candidate{candidates.length !== 1 ? "s" : ""} screened and ranked.
          Remember: this is a decision-support tool — a human should make the final call.
        </p>
      </div>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Shortlisted", count: shortlisted.length, color: "var(--green)", icon: "✓" },
          { label: "Maybe", count: maybes.length, color: "var(--yellow)", icon: "?" },
          { label: "Not Selected", count: rejected.length, color: "var(--red)", icon: "✗" },
        ].map(({ label, count, color, icon }) => (
          <div key={label} className="card" style={{ textAlign: "center", borderColor: color + "33" }}>
            <div style={{ fontSize: 32, color, fontFamily: "'Syne', sans-serif", fontWeight: 800 }}>{count}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>
              {icon} {label}
            </div>
          </div>
        ))}
      </div>

      {/* Human-in-the-loop warning */}
      <div style={{
        padding: "12px 18px", background: "#facc1511",
        border: "1px solid #facc1533", borderRadius: 8,
        fontSize: 12, color: "var(--yellow)", marginBottom: 24, lineHeight: 1.6,
      }}>
        ⚠️ <strong>Important:</strong> AI screening is a decision-support tool, not a final decision-maker. Always have a human recruiter review and approve the shortlist before reaching out to candidates.
      </div>

      {/* Ranked Candidates */}
      {candidates.map((candidate, i) => (
        <CandidateCard key={candidate.candidate_label} candidate={candidate} rank={i + 1} />
      ))}

      <div style={{ textAlign: "center", marginTop: 32 }}>
        <button className="btn btn-secondary" onClick={onReset}>
          ↺ Start New Screening
        </button>
      </div>
    </div>
  );
}
