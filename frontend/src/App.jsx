import { useState, useEffect } from "react";
import LoginPage      from "./components/LoginPage";
import Sidebar        from "./components/Sidebar";
import Dashboard      from "./components/Dashboard";
import JDChecker      from "./components/JDChecker";
import ResumeScreener from "./components/ResumeScreener";
import Results        from "./components/Results";
import History        from "./components/History";
import { apiFetch, setToken, clearToken } from "./api";

export default function App() {
  const [user,             setUser]             = useState(null);
  const [page,             setPage]             = useState("dashboard");
  const [step,             setStep]             = useState("jd");
  const [jdData,           setJdData]           = useState({ text: "", analysis: null });
  const [screeningResults, setScreeningResults] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Restore session from stored token on page load
  useEffect(() => {
    const token = localStorage.getItem("resumeai_token");
    if (!token) return;
    apiFetch("/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setUser(data); else clearToken(); })
      .catch(() => clearToken());
  }, []);

  const handleLogin = ({ token, user: u }) => {
    setToken(token);
    setUser(u);
  };

  const handleLogout = () => {
    clearToken();
    setUser(null); setPage("dashboard"); setStep("jd");
    setJdData({ text: "", analysis: null }); setScreeningResults(null); setCurrentSessionId(null);
  };

  // Save results to DB, then set session ID once we have the DB row ID
  const handleResults = async (data) => {
    setScreeningResults(data); setStep("results"); setPage("screening");
    try {
      const res = await apiFetch("/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date:            new Date().toISOString(),
          jd_preview:      jdData.text.substring(0, 100),
          jd_text:         jdData.text,
          candidate_count: data.candidates.length,
          shortlisted:     data.candidates.filter((c) => c.recommendation === "Shortlist").length,
          top_score:       Math.max(...data.candidates.map((c) => c.overall_score || 0)),
          results:         data,
        }),
      });
      if (res.ok) {
        const { id } = await res.json();
        setCurrentSessionId(id);
      }
    } catch (e) {
      console.error("Failed to save screening session:", e);
    }
  };

  const handleStatusChange = async (newStatuses) => {
    if (!currentSessionId) return;
    try {
      await apiFetch(`/history/${currentSessionId}/statuses`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statuses: newStatuses }),
      });
    } catch (e) {
      console.error("Failed to update statuses:", e);
    }
  };

  const startNewScreening = () => {
    setStep("jd"); setJdData({ text: "", analysis: null });
    setScreeningResults(null); setCurrentSessionId(null); setPage("screening");
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", fontFamily: "Inter, sans-serif" }}>
      <style>{globalStyles}</style>
      <Sidebar user={user} page={page} setPage={setPage} onLogout={handleLogout} onNewScreening={startNewScreening} />
      <main style={{ flex: 1, padding: "44px 52px", overflowY: "auto", maxHeight: "100vh" }}>
        {page === "dashboard" && <Dashboard user={user} onNewScreening={startNewScreening} />}
        {page === "history"   && (
          <History user={user} onLoad={(result, jd, sid) => {
            setJdData({ text: jd, analysis: null }); setScreeningResults(result);
            setCurrentSessionId(sid); setStep("results"); setPage("screening");
          }} />
        )}
        {page === "screening" && (
          <>
            {step === "jd"      && <JDChecker user={user} jdData={jdData} setJdData={setJdData} onNext={() => setStep("screen")} />}
            {step === "screen"  && <ResumeScreener jdText={jdData.text} onBack={() => setStep("jd")} onResults={handleResults} />}
            {step === "results" && <Results results={screeningResults} jdText={jdData.text} onReset={startNewScreening} onStatusChange={handleStatusChange} sessionId={currentSessionId} user={user} />}
          </>
        )}
      </main>
    </div>
  );
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #060b17;
    --surface: #0b1322;
    --surface2: #101c30;
    --surface3: #17253e;
    --border: #1c2e48;
    --border2: #243554;
    --g1: #6366f1;
    --g2: #3b82f6;
    --g3: #06b6d4;
    --accent: #5570f5;
    --accent-hover: #4460e8;
    --accent-muted: rgba(85,112,245,0.1);
    --text: #e4eaf8;
    --text2: #7a90b8;
    --text3: #3d5275;
    --success: #10b981;
    --success-muted: rgba(16,185,129,0.08);
    --warning: #f59e0b;
    --warning-muted: rgba(245,158,11,0.08);
    --danger: #ef4444;
    --danger-muted: rgba(239,68,68,0.08);
    --sidebar-w: 260px;
    --grad: linear-gradient(135deg, var(--g1), var(--g2), var(--g3));
  }

  body { background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }

  .grad-text {
    background: var(--grad);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .btn {
    padding: 10px 20px; border: none; border-radius: 9px;
    font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500;
    cursor: pointer; transition: all 0.2s; display: inline-flex;
    align-items: center; gap: 8px; letter-spacing: -0.01em; white-space: nowrap;
  }
  .btn-primary {
    background: linear-gradient(135deg, var(--g1), var(--g2));
    color: white; box-shadow: 0 4px 20px rgba(99,102,241,0.35);
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 28px rgba(99,102,241,0.5); filter: brightness(1.1); }
  .btn-secondary { background: var(--surface2); color: var(--text); border: 1px solid var(--border2); }
  .btn-secondary:hover { background: var(--surface3); border-color: var(--accent); color: var(--text); }
  .btn-ghost { background: transparent; color: var(--text2); }
  .btn-ghost:hover { background: var(--surface2); color: var(--text); }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
  .btn-lg { padding: 13px 28px; font-size: 15px; border-radius: 10px; }
  .btn-sm { padding: 6px 13px; font-size: 12px; border-radius: 7px; }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 24px;
    transition: border-color 0.2s;
  }
  .card:hover { border-color: var(--border2); }
  .card-glow {
    background: var(--surface);
    border: 1px solid rgba(99,102,241,0.25);
    border-radius: 14px;
    padding: 24px;
    box-shadow: 0 0 30px rgba(99,102,241,0.08);
  }

  input, textarea, select {
    width: 100%; background: var(--surface2); border: 1px solid var(--border2);
    border-radius: 9px; color: var(--text); font-family: 'Inter', sans-serif;
    font-size: 14px; padding: 11px 14px; outline: none;
    transition: all 0.2s; resize: vertical;
  }
  input:focus, textarea:focus, select:focus {
    border-color: var(--g2);
    box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
    background: var(--surface3);
  }
  input::placeholder, textarea::placeholder { color: var(--text3); }
  select option { background: var(--surface2); }
  label { display: block; font-size: 12px; font-weight: 600; color: var(--text2); margin-bottom: 7px; letter-spacing: 0.02em; text-transform: uppercase; }

  .track { height: 5px; background: var(--surface3); border-radius: 5px; overflow: hidden; }
  .fill  { height: 100%; border-radius: 5px; transition: width 0.9s cubic-bezier(.22,.68,0,1.2); }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  .fade-up { animation: fadeUp 0.35s ease forwards; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner { width: 15px; height: 15px; border: 2px solid var(--border2); border-top-color: var(--g2); border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }

  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.5; } }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 3px; }

  h1, h2, h3 { letter-spacing: -0.025em; }

  .modal-overlay { position: fixed; inset: 0; background: rgba(4,8,18,0.8); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 24px; }
  .modal { background: var(--surface); border: 1px solid var(--border2); border-radius: 16px; padding: 28px; width: 100%; max-width: 520px; box-shadow: 0 24px 80px rgba(0,0,0,0.6); }

  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 22px 24px;
    position: relative;
    overflow: hidden;
    transition: all 0.2s;
  }
  .stat-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: var(--grad);
  }
  .stat-card:hover { border-color: var(--border2); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }

  .candidate-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 20px 24px;
    margin-bottom: 12px;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }
  .candidate-card:hover { border-color: var(--border2); }
  .candidate-card.expanded { border-color: rgba(99,102,241,0.35); box-shadow: 0 0 30px rgba(99,102,241,0.08); }
  .candidate-card .rank-bar {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
  }

  .step-dot {
    width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 600; flex-shrink: 0;
    transition: all 0.3s;
  }
`;
