import { useState } from "react";

export default function History({ user, onLoad }) {
  const key = `history_${user.email}`;
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem(key) || "[]"));
  const [expanded, setExpanded] = useState(null);

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
      " · " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  };

  const deleteEntry = (id) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem(key, JSON.stringify(updated));
    if (expanded === id) setExpanded(null);
  };

  const recColor = (r) => ({
    Shortlist: "var(--success)", Maybe: "var(--warning)", Reject: "var(--danger)",
  }[r] || "var(--text3)");

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
          Screening History
        </h1>
        <p style={{ fontSize: 14, color: "var(--text2)" }}>
          All past screenings for {user.name || user.email}.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 24px" }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ margin: "0 auto 16px", display: "block" }}>
            <circle cx="20" cy="20" r="18" stroke="var(--border2)" strokeWidth="1.5" />
            <path d="M20 13v7.5l4 4" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text2)", marginBottom: 6 }}>No screenings yet</div>
          <div style={{ fontSize: 13, color: "var(--text3)" }}>
            Your completed screenings will appear here.
          </div>
        </div>
      ) : (
        <div>
          {history.map((entry) => {
            const isExpanded = expanded === entry.id;
            const candidates = entry.results?.candidates || [];

            return (
              <div
                key={entry.id}
                className="card"
                style={{ marginBottom: 12, borderColor: isExpanded ? "var(--border2)" : "var(--border)", transition: "border-color 0.15s" }}
              >
                {/* Summary row */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}
                  onClick={() => setExpanded(isExpanded ? null : entry.id)}
                >
                  {/* Date icon */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                    background: "var(--surface2)", border: "1px solid var(--border2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <rect x="2" y="3" width="14" height="13" rx="2.5" stroke="var(--text3)" strokeWidth="1.3" />
                      <path d="M6 1.5v3M12 1.5v3M2 7h14" stroke="var(--text3)" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 3 }}>
                      {entry.jd_preview.substring(0, 80)}{entry.jd_preview.length > 80 ? "..." : ""}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text3)" }}>{formatDate(entry.date)}</div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: "flex", gap: 20, flexShrink: 0 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>
                        {entry.candidate_count}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>Screened</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "var(--success)", lineHeight: 1 }}>
                        {entry.shortlisted}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>Shortlisted</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)", lineHeight: 1 }}>
                        {entry.top_score}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>Top Score</div>
                    </div>
                  </div>

                  {/* Chevron */}
                  <div style={{
                    color: "var(--text3)", transition: "transform 0.2s",
                    transform: isExpanded ? "rotate(180deg)" : "none", flexShrink: 0,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Expanded candidates */}
                {isExpanded && (
                  <div className="fade-up" style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
                      Candidates
                    </div>

                    {candidates.map((c, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "10px 14px", background: "var(--surface2)",
                        borderRadius: 8, marginBottom: 6, border: "1px solid var(--border)",
                      }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", minWidth: 100 }}>
                          {c.candidate_label}
                        </div>
                        <div style={{ flex: 1, fontSize: 12, color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {c.summary?.substring(0, 90)}...
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: c.overall_score >= 75 ? "var(--success)" : c.overall_score >= 50 ? "var(--warning)" : "var(--danger)", flexShrink: 0 }}>
                          {c.overall_score}
                        </div>
                        <span style={{
                          padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 500, flexShrink: 0,
                          background: recColor(c.recommendation) + "15",
                          color: recColor(c.recommendation),
                          border: `1px solid ${recColor(c.recommendation)}30`,
                        }}>
                          {c.recommendation}
                        </span>
                      </div>
                    ))}

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onLoad(entry.results, entry.jd_text)}
                      >
                        View Full Results
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => deleteEntry(entry.id)}
                        style={{ color: "var(--danger)", borderColor: "rgba(239,68,68,0.2)" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
