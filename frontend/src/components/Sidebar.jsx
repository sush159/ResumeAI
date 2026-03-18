const Logo = () => (
  <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" rx="10" fill="#3b7df8" />
    <rect x="10" y="11" width="20" height="2.5" rx="1.25" fill="white" />
    <rect x="10" y="17" width="14" height="2.5" rx="1.25" fill="white" />
    <rect x="10" y="23" width="16" height="2.5" rx="1.25" fill="white" />
    <circle cx="30" cy="29" r="6" fill="#22c55e" />
    <path d="M27.5 29l1.8 1.8L33 27" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NavIcon = ({ type }) => {
  if (type === "screening") return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 8h5M8 5.5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
  if (type === "history") return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 5v3.5l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
  return null;
};

export default function Sidebar({ user, page, setPage, onLogout, onNewScreening }) {
  const initials = (user.name || user.email).substring(0, 2).toUpperCase();

  const navItems = [
    { id: "screening", label: "New Screening" },
    { id: "history",   label: "History" },
  ];

  return (
    <aside style={{
      width: "var(--sidebar-w)",
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      padding: "28px 16px",
      flexShrink: 0,
      position: "sticky",
      top: 0,
      height: "100vh",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "0 8px", marginBottom: 36 }}>
        <Logo />
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.025em" }}>
            ResumeAI
          </div>
          <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1, letterSpacing: "0.02em" }}>
            Precision Hiring Platform
          </div>
        </div>
      </div>

      {/* Nav label */}
      <div style={{
        fontSize: 10, fontWeight: 600, color: "var(--text3)",
        textTransform: "uppercase", letterSpacing: "0.1em",
        padding: "0 10px", marginBottom: 6,
      }}>
        Workspace
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1 }}>
        {navItems.map((item) => {
          const isActive = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => item.id === "screening" ? onNewScreening() : setPage(item.id)}
              style={{
                width: "100%",
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 10px",
                background: isActive ? "var(--surface2)" : "transparent",
                border: isActive ? "1px solid var(--border2)" : "1px solid transparent",
                borderRadius: 8,
                color: isActive ? "var(--text)" : "var(--text2)",
                fontSize: 14,
                fontWeight: isActive ? 500 : 400,
                fontFamily: "Inter, sans-serif",
                cursor: "pointer",
                marginBottom: 2,
                transition: "all 0.15s",
                textAlign: "left",
                letterSpacing: "-0.01em",
              }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = "var(--surface2)"; e.currentTarget.style.color = "var(--text)"; } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text2)"; } }}
            >
              <span style={{ color: isActive ? "var(--accent)" : "currentColor", display: "flex" }}>
                <NavIcon type={item.id} />
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--border)", marginBottom: 16 }} />

      {/* User */}
      <div style={{ padding: "0 4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "var(--accent-muted)", border: "1px solid var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 600, color: "var(--accent)", flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.name || "User"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.email}
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 8,
            padding: "8px 10px", background: "transparent",
            border: "1px solid transparent", borderRadius: 8,
            color: "var(--text3)", fontSize: 13, fontFamily: "Inter, sans-serif",
            cursor: "pointer", transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--danger-muted)"; e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text3)"; e.currentTarget.style.borderColor = "transparent"; }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 2H2.5A1.5 1.5 0 001 3.5v7A1.5 1.5 0 002.5 12H5M9.5 9.5L13 7l-3.5-2.5M13 7H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
