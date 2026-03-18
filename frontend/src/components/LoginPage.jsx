import { useState } from "react";

const Logo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" rx="10" fill="#3b7df8" />
    <rect x="10" y="11" width="20" height="2.5" rx="1.25" fill="white" />
    <rect x="10" y="17" width="14" height="2.5" rx="1.25" fill="white" />
    <rect x="10" y="23" width="16" height="2.5" rx="1.25" fill="white" />
    <circle cx="30" cy="29" r="6" fill="#22c55e" />
    <path d="M27.5 29l1.8 1.8L33 27" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (mode === "signup" && !form.name) {
      setError("Please enter your name.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const accounts = JSON.parse(localStorage.getItem("resumeai_accounts") || "{}");

      if (mode === "signin") {
        const account = accounts[form.email];
        if (!account || account.password !== form.password) {
          setError("Invalid email or password.");
          setLoading(false);
          return;
        }
        onLogin({ email: form.email, name: account.name });
      } else {
        if (accounts[form.email]) {
          setError("An account with this email already exists.");
          setLoading(false);
          return;
        }
        accounts[form.email] = { name: form.name, password: form.password };
        localStorage.setItem("resumeai_accounts", JSON.stringify(accounts));
        onLogin({ email: form.email, name: form.name });
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#070c18",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Inter, sans-serif",
      padding: 24,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { -webkit-font-smoothing: antialiased; }
        input { outline: none; font-family: 'Inter', sans-serif; }
        input:focus { border-color: #3b7df8 !important; box-shadow: 0 0 0 3px rgba(59,125,248,0.12) !important; }
        input::placeholder { color: #4e607a; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <Logo />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f4", letterSpacing: "-0.03em" }}>
                ResumeAI
              </div>
              <div style={{ fontSize: 12, color: "#4e607a", letterSpacing: "0.02em" }}>
                Precision Hiring Platform
              </div>
            </div>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: "#0d1525",
          border: "1px solid #1e2d45",
          borderRadius: 16,
          padding: 36,
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "#e2e8f4", marginBottom: 6, letterSpacing: "-0.025em" }}>
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h2>
          <p style={{ fontSize: 14, color: "#4e607a", marginBottom: 28 }}>
            {mode === "signin"
              ? "Sign in to access your workspace."
              : "Set up your account to get started."}
          </p>

          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#8896b0", marginBottom: 6 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={set("name")}
                  style={{
                    width: "100%", background: "#121c30", border: "1px solid #253550",
                    borderRadius: 8, color: "#e2e8f4", fontSize: 14, padding: "10px 14px",
                    transition: "all 0.15s",
                  }}
                />
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#8896b0", marginBottom: 6 }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={set("email")}
                style={{
                  width: "100%", background: "#121c30", border: "1px solid #253550",
                  borderRadius: 8, color: "#e2e8f4", fontSize: 14, padding: "10px 14px",
                  transition: "all 0.15s",
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#8896b0", marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={set("password")}
                style={{
                  width: "100%", background: "#121c30", border: "1px solid #253550",
                  borderRadius: 8, color: "#e2e8f4", fontSize: 14, padding: "10px 14px",
                  transition: "all 0.15s",
                }}
              />
            </div>

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 8, padding: "10px 14px", marginBottom: 16,
                fontSize: 13, color: "#ef4444",
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "11px 20px", background: "#3b7df8",
                border: "none", borderRadius: 8, color: "white",
                fontSize: 15, fontWeight: 600, cursor: "pointer",
                fontFamily: "Inter, sans-serif", letterSpacing: "-0.01em",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                opacity: loading ? 0.7 : 1, transition: "all 0.15s",
              }}
            >
              {loading && (
                <span style={{
                  width: 15, height: 15, border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "white", borderRadius: "50%",
                  animation: "spin 0.7s linear infinite", display: "inline-block",
                }} />
              )}
              {mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div style={{ height: 1, background: "#1e2d45", margin: "24px 0" }} />

          <p style={{ fontSize: 13, color: "#4e607a", textAlign: "center" }}>
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setForm({ name: "", email: "", password: "" }); }}
              style={{
                background: "none", border: "none", color: "#3b7df8",
                cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "Inter, sans-serif",
              }}
            >
              {mode === "signin" ? "Create account" : "Sign in"}
            </button>
          </p>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "#4e607a", marginTop: 24 }}>
          ResumeAI — Precision Hiring Platform
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
