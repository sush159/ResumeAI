export default function Dashboard({ user, onNewScreening }) {
  const history = JSON.parse(localStorage.getItem(`history_${user.email}`) || "[]");

  const totalScreenings  = history.length;
  const totalCandidates  = history.reduce((s, h) => s + (h.candidate_count || 0), 0);
  const totalShortlisted = history.reduce((s, h) => s + (h.shortlisted || 0), 0);
  const avgTopScore      = totalScreenings
    ? Math.round(history.reduce((s, h) => s + (h.top_score || 0), 0) / totalScreenings)
    : 0;

  const formatDate = (iso) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const statCards = [
    {
      label: "Total Screenings",
      value: totalScreenings,
      delta: totalScreenings > 0 ? `${totalScreenings} session${totalScreenings !== 1 ? "s" : ""}` : "No sessions yet",
      gradient: "linear-gradient(135deg, #6366f1, #4f46e5)",
      glow: "rgba(99,102,241,0.3)",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="3" y="2" width="16" height="18" rx="3" stroke="white" strokeWidth="1.5"/>
          <path d="M7 8h8M7 12h6M7 16h4" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: "Candidates Reviewed",
      value: totalCandidates,
      delta: totalCandidates > 0 ? `Across ${totalScreenings} screening${totalScreenings !== 1 ? "s" : ""}` : "Upload resumes to start",
      gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
      glow: "rgba(59,130,246,0.3)",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="9" cy="7.5" r="4" stroke="white" strokeWidth="1.5"/>
          <path d="M3 19c0-3.866 2.686-7 6-7M15 14l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: "Total Shortlisted",
      value: totalShortlisted,
      delta: totalCandidates > 0 ? `${totalCandidates ? Math.round((totalShortlisted / totalCandidates) * 100) : 0}% shortlist rate` : "—",
      gradient: "linear-gradient(135deg, #10b981, #059669)",
      glow: "rgba(16,185,129,0.3)",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="1.5"/>
          <path d="M7 11l2.5 2.5L15 8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: "Avg Top Score",
      value: avgTopScore || "—",
      delta: avgTopScore > 0 ? (avgTopScore >= 75 ? "Strong candidates" : avgTopScore >= 50 ? "Moderate fit" : "Low fit pool") : "No data yet",
      gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
      glow: "rgba(245,158,11,0.3)",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M4 16l4.5-5 3.5 3.5 5-7 3 2" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="18" cy="6" r="2" fill="white"/>
        </svg>
      ),
    },
  ];

  const shortlistCount = history.reduce((s, h) => s + (h.results?.candidates?.filter(c => c.recommendation === "Shortlist").length || 0), 0);
  const maybeCount = history.reduce((s, h) => s + (h.results?.candidates?.filter(c => c.recommendation === "Maybe").length || 0), 0);
  const rejectCount = history.reduce((s, h) => s + (h.results?.candidates?.filter(c => c.recommendation === "Reject").length || 0), 0);

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text3)", marginBottom: 6, letterSpacing: "0.02em" }}>
          WORKSPACE OVERVIEW
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 6, lineHeight: 1.2 }}>
          <span style={{ color: "var(--text)" }}>Welcome back, </span>
          <span className="grad-text">{user.name?.split(" ")[0] || "there"}</span>
        </h1>
        <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>
          Here is a summary of your hiring activity.
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 40 }}>
        {statCards.map(({ label, value, delta, gradient, glow, icon }) => (
          <div key={label} style={{
            borderRadius: 14, padding: "20px 22px", position: "relative", overflow: "hidden",
            background: gradient,
            boxShadow: `0 8px 28px ${glow}`,
            transition: "transform 0.2s, box-shadow 0.2s",
            cursor: "default",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 14px 36px ${glow.replace("0.3", "0.45")}`; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = `0 8px 28px ${glow}`; }}
          >
            {/* Decorative circle */}
            <div style={{
              position: "absolute", right: -16, top: -16,
              width: 80, height: 80, borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
            }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: "rgba(255,255,255,0.15)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}>
                  {icon}
                </div>
              </div>
              <div style={{ fontSize: 38, fontWeight: 800, color: "white", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 6 }}>
                {value}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{delta}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
        {/* Recent Screenings Table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Recent Screenings</div>
            {history.length > 0 && (
              <div style={{
                fontSize: 11, fontWeight: 500, color: "var(--text3)",
                padding: "3px 10px", background: "var(--surface2)", borderRadius: 6,
                border: "1px solid var(--border2)",
              }}>
                {history.length} total
              </div>
            )}
          </div>
          {history.length === 0 ? (
            <div style={{ padding: "60px 24px", textAlign: "center" }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14, margin: "0 auto 16px",
                background: "var(--surface2)", border: "1px solid var(--border2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="4" stroke="var(--text3)" strokeWidth="1.4"/>
                  <path d="M8 12h8M12 8v8" stroke="var(--text3)" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={{ fontSize: 14, color: "var(--text3)", marginBottom: 16 }}>No screenings yet.</div>
              <button className="btn btn-primary btn-sm" onClick={onNewScreening}>
                Start your first screening
              </button>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--surface2)" }}>
                  {["Date", "Job Description", "Candidates", "Shortlisted", "Top Score"].map((h) => (
                    <th key={h} style={{
                      padding: "10px 20px", textAlign: "left",
                      fontSize: 11, fontWeight: 600, color: "var(--text3)",
                      textTransform: "uppercase", letterSpacing: "0.07em",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 8).map((entry, i) => (
                  <tr key={entry.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text3)", whiteSpace: "nowrap" }}>
                      {formatDate(entry.date)}
                    </td>
                    <td style={{ padding: "12px 20px", fontSize: 13, color: "var(--text2)", maxWidth: 200 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {entry.jd_preview}
                      </div>
                    </td>
                    <td style={{ padding: "12px 20px", fontSize: 13, color: "var(--text)", fontWeight: 600 }}>
                      {entry.candidate_count}
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        fontSize: 13, fontWeight: 600, color: "var(--success)",
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", display: "inline-block" }} />
                        {entry.shortlisted}
                      </span>
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      <span style={{
                        display: "inline-block", padding: "2px 10px", borderRadius: 6,
                        fontSize: 12, fontWeight: 700,
                        color: entry.top_score >= 75 ? "var(--success)" : entry.top_score >= 50 ? "var(--warning)" : "var(--danger)",
                        background: entry.top_score >= 75 ? "var(--success-muted)" : entry.top_score >= 50 ? "var(--warning-muted)" : "var(--danger-muted)",
                      }}>
                        {entry.top_score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Quick Actions */}
          <div className="card-glow" style={{ padding: "20px" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 14 }}>Quick Actions</div>
            <button className="btn btn-primary" onClick={onNewScreening} style={{ width: "100%", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Start New Screening
            </button>
          </div>

          {/* Outcome Breakdown */}
          {totalCandidates > 0 && (
            <div className="card" style={{ padding: "20px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 18 }}>Outcome Breakdown</div>
              {[
                { label: "Shortlisted",     color: "var(--success)", count: shortlistCount,  bg: "var(--success-muted)" },
                { label: "Under Review",    color: "var(--warning)", count: maybeCount,      bg: "var(--warning-muted)" },
                { label: "Not Progressing", color: "var(--danger)",  count: rejectCount,     bg: "var(--danger-muted)" },
              ].map(({ label, color, count, bg }) => (
                <div key={label} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "var(--text2)" }}>{label}</span>
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: 700, color,
                      padding: "1px 8px", borderRadius: 5, background: bg,
                    }}>{count}</span>
                  </div>
                  <div className="track">
                    <div className="fill" style={{
                      width: totalCandidates ? `${(count / totalCandidates) * 100}%` : "0%",
                      background: color,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
