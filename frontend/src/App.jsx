import { useState } from "react";
import LoanForm from "./components/LoanForm.jsx";
import DecisionCard from "./components/DecisionCard.jsx";
import RulesAdmin from "./components/RulesAdmin.jsx";
import RiskDashboard from "./components/RiskDashboard.jsx";

export default function App() {
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState("APPLY"); // APPLY | RULES | DASH

  return (
    <div className="page">
      <header className="header">
        <div className="topRow">
          <div>
            <h1>FinExpert</h1>
            <p className="sub">
              Loan Approval Expert System (MongoDB rules + explanations + dashboard)
            </p>
          </div>
          <nav className="tabs">
            <button className={tab === "APPLY" ? "tab active" : "tab"} onClick={() => setTab("APPLY")}>
              Apply
            </button>
            <button className={tab === "RULES" ? "tab active" : "tab"} onClick={() => setTab("RULES")}>
              Rules
            </button>
            <button className={tab === "DASH" ? "tab active" : "tab"} onClick={() => setTab("DASH")}>
              Dashboard
            </button>
          </nav>
        </div>
      </header>

      {tab === "APPLY" ? (
        <main className="grid">
          <section className="card">
            <h2>Applicant Data</h2>
            <LoanForm onResult={setResult} />
          </section>

          <section className="card">
            <h2>Decision</h2>
            {result ? (
              <DecisionCard data={result} />
            ) : (
              <p className="muted">Submit an application to see the decision and explanation.</p>
            )}
          </section>
        </main>
      ) : null}

      {tab === "RULES" ? (
        <main className="wide">
          <h2>Rules Admin (CRUD)</h2>
          <RulesAdmin />
        </main>
      ) : null}

      {tab === "DASH" ? (
        <main className="wide">
          <RiskDashboard />
        </main>
      ) : null}

      <footer className="footer">
        <small>FinExpert demo project</small>
      </footer>
    </div>
  );
}
