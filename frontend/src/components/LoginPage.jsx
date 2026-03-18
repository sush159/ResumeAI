import { useState } from "react";

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) { setError("Please fill in all required fields."); return; }
    if (mode === "signup" && !form.name)  { setError("Please enter your name."); return; }
    if (form.password.length < 6)         { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    setTimeout(() => {
      const accounts = JSON.parse(localStorage.getItem("resumeai_accounts") || "{}");
      if (mode === "signin") {
        const account = accounts[form.email];
        if (!account || account.password !== form.password) {
          setError("Invalid email or password."); setLoading(false); return;
        }
        onLogin({ email: form.email, name: account.name });
      } else {
        if (accounts[form.email]) {
          setError("An account with this email already exists."); setLoading(false); return;
        }
        accounts[form.email] = { name: form.name, password: form.password };
        localStorage.setItem("resumeai_accounts", JSON.stringify(accounts));
        onLogin({ email: form.email, name: form.name });
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "Inter, sans-serif", background: "#060b17", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { -webkit-font-smoothing: antialiased; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float1 { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(30px,-20px) scale(1.05); } 66% { transform: translate(-20px,15px) scale(0.97); } }
        @keyframes float2 { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(-25px,20px) scale(1.03); } 66% { transform: translate(20px,-15px) scale(0.98); } }
        @keyframes float3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(15px,25px) scale(1.04); } }
        @keyframes fadeSlideIn { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

        .login-input {
          width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; color: #e4eaf8; font-family: 'Inter', sans-serif;
          font-size: 14px; padding: 12px 14px; outline: none; transition: all 0.2s;
        }
        .login-input:focus {
          border-color: rgba(99,102,241,0.6);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
          background: rgba(255,255,255,0.06);
        }
        .login-input::placeholder { color: rgba(255,255,255,0.2); }

        .login-btn {
          width: 100%; padding: 13px 20px;
          background: linear-gradient(135deg, #6366f1, #3b82f6);
          border: none; border-radius: 10px; color: white;
          font-size: 15px; font-weight: 600; cursor: pointer;
          font-family: 'Inter', sans-serif; letter-spacing: -0.01em;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(99,102,241,0.4);
        }
        .login-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(99,102,241,0.55); filter: brightness(1.08); }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .feature-item { display: flex; align-items: flex-start; gap: 14px; animation: fadeSlideIn 0.5s ease forwards; }
        .feature-icon {
          width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(8px);
        }
      `}</style>

      {/* ── Left Hero Panel ─────────────────────────────── */}
      <div style={{
        flex: "0 0 52%", position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #0d0f1e 0%, #0b1035 50%, #060b17 100%)",
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "60px 64px",
      }}>
        {/* Animated orbs */}
        <div style={{
          position: "absolute", width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
          top: "-120px", left: "-100px",
          animation: "float1 12s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
          bottom: "-80px", right: "-60px",
          animation: "float2 15s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)",
          top: "50%", right: "15%",
          animation: "float3 10s ease-in-out infinite",
        }} />

        {/* Grid overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, maxWidth: 480 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 64 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "linear-gradient(135deg, #6366f1, #3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
            }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="3" y="2" width="16" height="18" rx="3" stroke="white" strokeWidth="1.6"/>
                <path d="M7 7h8M7 11h6M7 15h4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="17" cy="17" r="4.5" fill="#22c55e" stroke="#0b1035" strokeWidth="1.5"/>
                <path d="M15.3 17l1.2 1.2L18.7 15.8" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#e4eaf8", letterSpacing: "-0.03em" }}>ResumeAI</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Precision Hiring Platform</div>
            </div>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 44, fontWeight: 800, lineHeight: 1.1,
            letterSpacing: "-0.04em", marginBottom: 18, color: "#e4eaf8",
          }}>
            Hire smarter,<br />
            <span style={{
              background: "linear-gradient(135deg, #6366f1, #3b82f6, #06b6d4)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              not harder.
            </span>
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, marginBottom: 52 }}>
            Screen resumes intelligently. Identify top candidates in minutes, not hours.
          </p>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              {
                icon: (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2l1.5 3.5 3.5.5-2.5 2.5.5 3.5L8 10.5 5 12l.5-3.5L3 6l3.5-.5z" stroke="#6366f1" strokeWidth="1.3" strokeLinejoin="round"/>
                  </svg>
                ),
                title: "AI-Powered Scoring",
                desc: "Each resume scored across JD match, skills, and custom criteria.",
              },
              {
                icon: (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="7" cy="6" r="3.5" stroke="#3b82f6" strokeWidth="1.3"/>
                    <path d="M2 14c0-2.76 2.24-5 5-5M11 10l1.5 1.5 2.5-2.5" stroke="#3b82f6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                title: "Candidate Management",
                desc: "Track status from first review to offer with a built-in pipeline.",
              },
              {
                icon: (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 12V5l5-3 5 3v7l-5 3z" stroke="#06b6d4" strokeWidth="1.3" strokeLinejoin="round"/>
                    <path d="M8 9V7M8 5v.5" stroke="#06b6d4" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                ),
                title: "Inclusive by Design",
                desc: "Resumes anonymized before scoring to reduce unconscious bias.",
              },
            ].map(({ icon, title, desc }, i) => (
              <div key={title} className="feature-item" style={{ animationDelay: `${i * 0.1}s`, opacity: 0, animationFillMode: "forwards" }}>
                <div className="feature-icon">{icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#e4eaf8", marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ─────────────────────────────── */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 48px",
      }}>
        <div style={{ width: "100%", maxWidth: 400, animation: "fadeSlideIn 0.4s ease forwards" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#e4eaf8", marginBottom: 6, letterSpacing: "-0.03em" }}>
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginBottom: 32, lineHeight: 1.6 }}>
            {mode === "signin"
              ? "Sign in to access your workspace."
              : "Get started with your free account."}
          </p>

          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Full Name
                </label>
                <input className="login-input" type="text" placeholder="Jane Smith" value={form.name} onChange={set("name")} />
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Email Address
              </label>
              <input className="login-input" type="email" placeholder="you@company.com" value={form.email} onChange={set("email")} />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Password
              </label>
              <input className="login-input" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} />
            </div>

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 9, padding: "11px 14px", marginBottom: 18,
                fontSize: 13, color: "#ef4444",
              }}>
                {error}
              </div>
            )}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading && (
                <span style={{
                  width: 15, height: 15, border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "white", borderRadius: "50%",
                  animation: "spin 0.7s linear infinite", display: "inline-block", flexShrink: 0,
                }} />
              )}
              {mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "28px 0" }} />

          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setForm({ name: "", email: "", password: "" }); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600, fontFamily: "Inter, sans-serif",
                background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}
            >
              {mode === "signin" ? "Create account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
