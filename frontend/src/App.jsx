import { useState } from "react";
import JDChecker from "./components/JDChecker";
import ResumeScreener from "./components/ResumeScreener";
import Results from "./components/Results";

export default function App() {
  const [step, setStep] = useState("jd"); // 'jd' → 'screen' → 'results'
  const [jdData, setJdData] = useState({ text: "", analysis: null });
  const [screeningResults, setScreeningResults] = useState(null);

  const steps = ["jd", "screen", "results"];
  const stepLabels = ["JD Check", "Upload", "Results"];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'DM Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0a0a0f;
          --surface: #12121a;
          --border: #1e1e2e;
          --accent: #7c6af7;
          --accent2: #f7a26a;
          --green: #4ade80;
          --red: #f87171;
          --yellow: #facc15;
          --text: #e2e2f0;
          --muted: #6b6b8a;
        }

        body { background: var(--bg); color: var(--text); }

        .btn {
          padding: 12px 28px;
          border: none;
          border-radius: 8px;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.05em;
        }
        .btn-primary { background: var(--accent); color: white; }
        .btn-primary:hover { background: #6a58e8; transform: translateY(-1px); }
        .btn-secondary { background: transparent; color: var(--muted); border: 1px solid var(--border); }
        .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }

        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 28px;
        }

        .tag {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 4px;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        textarea, input[type="text"] {
          width: 100%;
          background: #0d0d15;
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text);
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          padding: 14px;
          outline: none;
          transition: border 0.2s;
          resize: vertical;
        }
        textarea:focus, input[type="text"]:focus { border-color: var(--accent); }

        label {
          display: block;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 8px;
        }

        .score-bar-track {
          height: 6px;
          background: var(--border);
          border-radius: 4px;
          overflow: hidden;
          margin-top: 6px;
        }
        .score-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.8s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.4s ease forwards; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
          vertical-align: middle;
        }
      `}</style>

      {/* Header */}
      <header style={{
        borderBottom: "1px solid #1e1e2e",
        padding: "20px 40px",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}>
        <div style={{
          width: 36, height: 36,
          background: "var(--accent)",
          borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>⚡</div>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "white" }}>
            ResumeAI
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.08em" }}>
            UNBIASED RESUME SCREENING
          </div>
        </div>

        {/* Step Indicator */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: step === s ? "var(--accent)" : (steps.indexOf(step) > i ? "var(--green)" : "var(--border)"),
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: "bold", color: "white",
                transition: "all 0.3s",
              }}>
                {steps.indexOf(step) > i ? "✓" : i + 1}
              </div>
              <span style={{
                fontSize: 11,
                color: step === s ? "var(--text)" : "var(--muted)",
                letterSpacing: "0.05em",
              }}>
                {stepLabels[i]}
              </span>
              {i < 2 && <div style={{ width: 24, height: 1, background: "var(--border)" }} />}
            </div>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px" }}>
        {step === "jd" && (
          <JDChecker
            jdData={jdData}
            setJdData={setJdData}
            onNext={() => setStep("screen")}
          />
        )}
        {step === "screen" && (
          <ResumeScreener
            jdText={jdData.text}
            onBack={() => setStep("jd")}
            onResults={(data) => { setScreeningResults(data); setStep("results"); }}
          />
        )}
        {step === "results" && (
          <Results
            results={screeningResults}
            onReset={() => {
              setStep("jd");
              setJdData({ text: "", analysis: null });
              setScreeningResults(null);
            }}
          />
        )}
      </main>
    </div>
  );
}
