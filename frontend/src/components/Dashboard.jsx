export default function Dashboard({ user, onNewScreening }) {
  const history = JSON.parse(localStorage.getItem(`history_${user.email}`) || "[]");

  const totalScreenings  = history.length;
  const totalCandidates  = history.reduce((s, h) => s + (h.candidate_count || 0), 0);
  const totalShortlisted = history.reduce((s, h) => s + (h.shortlisted || 0), 0);
  const avgTopScore      = totalScreenings
    ? Math.round(history.reduce((s, h) => s + (h.top_score || 0), 0) / totalScreenings)
    : 0;

  const formatDate = (iso) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const recColor = (r) => ({ Shortlist: "var(--success)", Maybe: "var(--warning)", Reject: "var(--danger)" }[r] || "var(--text3)");

  const statCards = [
    {
      label: "Total Screenings",
      value: totalScreenings,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="3" y="2" width="14" height="16" rx="3" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M7 7h6M7 10.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      ),
      color: "var(--accent)",
    },
    {
      label: "Candidates Reviewed",
      value: totalCandidates,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="8" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M2 17c0-3.314 2.686-6 6-6M14 13l1.5 1.5L18 11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "var(--text2)",
    },
    {
      label: "Total Shortlisted",
      value: totalShortlisted,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M6.5 10l2.5 2.5L13.5 7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "var(--success)",
    },
    {
      label: "Avg Top Score",
      value: avgTopScore || "—",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 14l4-4 3 3 4-5 3 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "var(--warning)",
    },
  ];

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
          Welcome back, {user.name?.split(" ")[0] || "there"}
        </h1>
        <p style={{ fontSize: 14, color: "var(--text2)" }}>
          Here is an overview of your hiring activity.
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 36 }}>
        {statCards.map(({ label, value, icon, color }) => (
          <div key={label} className="card" style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text3)" }}>{label}</div>
              <div style={{ color }}>{icon}</div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.03em", lineHeight: 1 }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Screenings */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>Recent Screenings</div>
          </div>
          {history.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
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
                  <tr key={entry.id} style={{ borderTop: i > 0 ? "1px solid var(--border)" : "none" }}>
                    <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text3)", whiteSpace: "nowrap" }}>
                      {formatDate(entry.date)}
                    </td>
                    <td style={{ padding: "12px 20px", fontSize: 13, color: "var(--text2)", maxWidth: 220 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {entry.jd_preview}
                      </div>
                    </td>
                    <td style={{ padding: "12px 20px", fontSize: 13, color: "var(--text)", fontWeight: 500 }}>
                      {entry.candidate_count}
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--success)" }}>
                        {entry.shortlisted}
                      </span>
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      <span style={{
                        fontSize: 13, fontWeight: 600,
                        color: entry.top_score >= 75 ? "var(--success)" : entry.top_score >= 50 ? "var(--warning)" : "var(--danger)",
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

        {/* Quick Actions + Breakdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Quick Actions */}
          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>Quick Actions</div>
            <button className="btn btn-primary" onClick={onNewScreening} style={{ width: "100%", justifyContent: "center", marginBottom: 8 }}>
              Start New Screening
            </button>
          </div>

          {/* Recommendation Breakdown */}
          {totalCandidates > 0 && (
            <div className="card">
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>Outcome Breakdown</div>
              {[
                { label: "Shortlisted",     color: "var(--success)", count: totalShortlisted },
                { label: "Under Review",    color: "var(--warning)", count: history.reduce((s, h) => s + (h.results?.candidates?.filter(c => c.recommendation === "Maybe").length || 0), 0) },
                { label: "Not Progressing", color: "var(--danger)",  count: history.reduce((s, h) => s + (h.results?.candidates?.filter(c => c.recommendation === "Reject").length || 0), 0) },
              ].map(({ label, color, count }) => (
                <div key={label} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "var(--text2)" }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color }}>{count}</span>
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
