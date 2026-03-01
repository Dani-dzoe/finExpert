export default function DecisionCard({ data }) {
  return (
    <div className="decision">
      <div className="badges">
        <span className={`badge ${data.decision === "APPROVED" ? "ok" : "no"}`}>
          {data.decision}
        </span>
        <span className="badge">{data.riskLevel} RISK</span>
      </div>

      <p><b>Debt-to-income:</b> {data.debtToIncomeRatio.toFixed(1)}%</p>
      <p><b>Recommended amount:</b> {data.recommendedAmount}</p>

      <h3>Explanation</h3>
      {data.explanation?.length ? (
        <ul>
          {data.explanation.map((x, i) => <li key={i}>{x}</li>)}
        </ul>
      ) : (
        <p className="muted">No explanation returned.</p>
      )}

      <details>
        <summary>Fired rules</summary>
        <pre>{JSON.stringify(data.firedRules, null, 2)}</pre>
      </details>
    </div>
  );
}
