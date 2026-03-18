import { useState, useEffect } from "react";
import LoginPage from "./components/LoginPage";
import Sidebar from "./components/Sidebar";
import JDChecker from "./components/JDChecker";
import ResumeScreener from "./components/ResumeScreener";
import Results from "./components/Results";
import History from "./components/History";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("screening");
  const [step, setStep] = useState("jd");
  const [jdData, setJdData] = useState({ text: "", analysis: null });
  const [screeningResults, setScreeningResults] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("resumeai_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem("resumeai_user", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("resumeai_user");
    setUser(null);
    setPage("screening");
    setStep("jd");
    setJdData({ text: "", analysis: null });
    setScreeningResults(null);
  };

  const handleResults = (data) => {
    setScreeningResults(data);
    setStep("results");
    const key = `history_${user.email}`;
    const history = JSON.parse(localStorage.getItem(key) || "[]");
    history.unshift({
      id: Date.now(),
      date: new Date().toISOString(),
      jd_preview: jdData.text.substring(0, 100),
      candidate_count: data.candidates.length,
      shortlisted: data.candidates.filter((c) => c.recommendation === "Shortlist").length,
      top_score: Math.max(...data.candidates.map((c) => c.overall_score || 0)),
      results: data,
      jd_text: jdData.text,
    });
    localStorage.setItem(key, JSON.stringify(history.slice(0, 50)));
  };

  const startNewScreening = () => {
    setStep("jd");
    setJdData({ text: "", analysis: null });
    setScreeningResults(null);
    setPage("screening");
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", fontFamily: "Inter, sans-serif" }}>
      <style>{globalStyles}</style>
      <Sidebar user={user} page={page} setPage={setPage} onLogout={handleLogout} onNewScreening={startNewScreening} />
      <main style={{ flex: 1, padding: "44px 52px", overflowY: "auto", maxHeight: "100vh" }}>
        {page === "history" ? (
          <History
            user={user}
            onLoad={(result, jd) => {
              setJdData({ text: jd, analysis: null });
              setScreeningResults(result);
              setStep("results");
              setPage("screening");
            }}
          />
        ) : (
          <>
            {step === "jd" && (
              <JDChecker jdData={jdData} setJdData={setJdData} onNext={() => setStep("screen")} />
            )}
            {step === "screen" && (
              <ResumeScreener jdText={jdData.text} onBack={() => setStep("jd")} onResults={handleResults} />
            )}
            {step === "results" && (
              <Results results={screeningResults} onReset={startNewScreening} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #070c18;
    --surface: #0d1525;
    --surface2: #121c30;
    --surface3: #1a2640;
    --border: #1e2d45;
    --border2: #253550;
    --accent: #3b7df8;
    --accent-hover: #2563eb;
    --accent-muted: rgba(59,125,248,0.1);
    --text: #e2e8f4;
    --text2: #8896b0;
    --text3: #4e607a;
    --success: #22c55e;
    --success-muted: rgba(34,197,94,0.08);
    --warning: #eab308;
    --warning-muted: rgba(234,179,8,0.08);
    --danger: #ef4444;
    --danger-muted: rgba(239,68,68,0.08);
    --sidebar-w: 256px;
  }

  body { background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }

  .btn {
    padding: 9px 18px;
    border: none;
    border-radius: 8px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    letter-spacing: -0.01em;
    white-space: nowrap;
  }
  .btn-primary { background: var(--accent); color: white; }
  .btn-primary:hover { background: var(--accent-hover); }
  .btn-secondary { background: var(--surface2); color: var(--text); border: 1px solid var(--border2); }
  .btn-secondary:hover { background: var(--surface3); }
  .btn-ghost { background: transparent; color: var(--text2); }
  .btn-ghost:hover { background: var(--surface2); color: var(--text); }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-lg { padding: 12px 24px; font-size: 15px; }
  .btn-sm { padding: 6px 12px; font-size: 13px; }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 24px;
  }

  input, textarea {
    width: 100%;
    background: var(--surface2);
    border: 1px solid var(--border2);
    border-radius: 8px;
    color: var(--text);
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    padding: 10px 14px;
    outline: none;
    transition: border-color 0.15s;
    resize: vertical;
  }
  input:focus, textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-muted); }
  input::placeholder, textarea::placeholder { color: var(--text3); }

  label { display: block; font-size: 13px; font-weight: 500; color: var(--text2); margin-bottom: 6px; }

  .badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
  }

  .track { height: 4px; background: var(--surface3); border-radius: 4px; overflow: hidden; }
  .fill  { height: 100%; border-radius: 4px; transition: width 0.8s ease; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-up { animation: fadeUp 0.3s ease forwards; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner {
    width: 15px; height: 15px;
    border: 2px solid var(--border2);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 3px; }

  h1, h2, h3 { letter-spacing: -0.025em; }
  .divider { height: 1px; background: var(--border); margin: 20px 0; }
`;
