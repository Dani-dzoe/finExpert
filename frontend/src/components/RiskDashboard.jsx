import { useEffect, useMemo, useState } from "react";
import { getStats } from "../api.js";

function normalize(arr) {
  const out = {};
  for (const x of arr || []) out[x._id] = x.count;
  return out;
}

function BarChart({ title, data }) {
  const entries = Object.entries(data);
  const max = Math.max(1, ...entries.map(([, v]) => v));

  return (
    <div className="card">
      <h3>{title}</h3>
      <svg viewBox="0 0 400 180" width="100%" height="180" role="img">
        {entries.map(([k, v], i) => {
          const barW = 110;
          const gap = 20;
          const x = 20 + i * (barW + gap);
          const h = Math.round((v / max) * 120);
          const y = 140 - h;
          return (
            <g key={k}>
              <rect x={x} y={y} width={barW} height={h} rx="10" />
              <text x={x + barW / 2} y={165} textAnchor="middle" fontSize="12">
                {k}
              </text>
              <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize="12">
                {v}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="muted">Bars scale to the maximum value in this chart.</p>
    </div>
  );
}

export default function RiskDashboard() {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((e) => setErr(e.message));
  }, []);

  const byRisk = useMemo(() => {
    const m = normalize(stats?.byRisk);
    return { LOW: m.LOW || 0, MEDIUM: m.MEDIUM || 0, HIGH: m.HIGH || 0 };
  }, [stats]);

  const byDecision = useMemo(() => {
    const m = normalize(stats?.byDecision);
    return { APPROVED: m.APPROVED || 0, REJECTED: m.REJECTED || 0 };
  }, [stats]);

  return (
    <div className="stack">
      {err ? <p className="error">{err}</p> : null}

      <div className="card">
        <h2>Risk Visualization</h2>
        <p className="muted">
          Overview of stored applications: risk distribution and outcomes.
        </p>
        <div className="kpis">
          <div className="kpi">
            <div className="muted">Total Applications</div>
            <div className="kpiVal">{stats?.total ?? "—"}</div>
          </div>
          <div className="kpi">
            <div className="muted">Approvals</div>
            <div className="kpiVal">{byDecision.APPROVED}</div>
          </div>
          <div className="kpi">
            <div className="muted">Rejections</div>
            <div className="kpiVal">{byDecision.REJECTED}</div>
          </div>
        </div>
      </div>

      <div className="grid2">
        <BarChart title="Applications by Risk Level" data={byRisk} />
        <BarChart title="Applications by Decision" data={byDecision} />
      </div>
    </div>
  );
}
