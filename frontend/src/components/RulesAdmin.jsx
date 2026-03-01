import { useEffect, useMemo, useState } from "react";
import { createRule, deleteRule, listRules, seedRules, updateRule } from "../api.js";

const emptyRule = {
  name: "",
  ruleId: "",
  priority: 50,
  enabled: true,
  conditions: [
    // example: { fact: "creditScore", op: ">=", value: 650 }
  ],
  actions: {
    decision: "APPROVED",
    riskLevel: "MEDIUM",
    affordabilityRate: 0.35,
    setRecommendedAmountToZero: false,
    reasons: []
  }
};

export default function RulesAdmin() {
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState(emptyRule);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const r = await listRules();
    setRules(r);
  }

  useEffect(() => {
    refresh().catch((e) => setErr(e.message));
  }, []);

  const sorted = useMemo(() => {
    return [...rules].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }, [rules]);

  function setField(path, value) {
    setForm((p) => {
      const next = structuredClone(p);
      const parts = path.split(".");
      let cur = next;
      for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
      cur[parts[parts.length - 1]] = value;
      return next;
    });
  }

  function addCondition() {
    setForm((p) => ({
      ...p,
      conditions: [...p.conditions, { fact: "creditScore", op: ">=", value: 650 }]
    }));
  }

  function removeCondition(idx) {
    setForm((p) => ({ ...p, conditions: p.conditions.filter((_, i) => i !== idx) }));
  }

  function addReason() {
    setForm((p) => ({
      ...p,
      actions: { ...p.actions, reasons: [...p.actions.reasons, ""] }
    }));
  }

  function removeReason(idx) {
    setForm((p) => ({
      ...p,
      actions: { ...p.actions, reasons: p.actions.reasons.filter((_, i) => i !== idx) }
    }));
  }

  async function onSeed() {
    setErr("");
    setBusy(true);
    try {
      await seedRules();
      await refresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function onCreate(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      // coerce numbers
      const payload = {
        ...form,
        priority: Number(form.priority),
        actions: {
          ...form.actions,
          affordabilityRate: Number(form.actions.affordabilityRate || 0)
        },
        conditions: form.conditions.map((c) => ({
          ...c,
          value: c.op === "in" && typeof c.value === "string"
            ? c.value.split(",").map((x) => x.trim()).filter(Boolean)
            : (typeof c.value === "string" && c.value !== "" && !Number.isNaN(Number(c.value)) ? Number(c.value) : c.value)
        }))
      };

      await createRule(payload);
      setForm(emptyRule);
      await refresh();
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleEnabled(rule) {
    setErr("");
    try {
      await updateRule(rule._id, { enabled: !rule.enabled });
      await refresh();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function remove(rule) {
    setErr("");
    try {
      await deleteRule(rule._id);
      await refresh();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="stack">
      <div className="row2">
        <button onClick={onSeed} disabled={busy}>Seed default rules</button>
        <span className="muted">
          Tip: Priorities decide which rule fires first (higher = earlier).
        </span>
      </div>

      {err ? <p className="error">{err}</p> : null}

      <div className="card">
        <h3>Create Rule</h3>
        <form className="form" onSubmit={onCreate}>
          <div className="row">
            <label>
              Name
              <input value={form.name} onChange={(e) => setField("name", e.target.value)} required />
            </label>
            <label>
              Rule ID
              <input value={form.ruleId} onChange={(e) => setField("ruleId", e.target.value)} required />
            </label>
          </div>

          <div className="row">
            <label>
              Priority
              <input type="number" value={form.priority} onChange={(e) => setField("priority", e.target.value)} />
            </label>
            <label>
              Enabled
              <select value={String(form.enabled)} onChange={(e) => setField("enabled", e.target.value === "true")}>
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            </label>
          </div>

          <h4>Conditions (AND)</h4>
          <div className="stack">
            {form.conditions.map((c, idx) => (
              <div className="cond" key={idx}>
                <input
                  value={c.fact}
                  onChange={(e) => {
                    const next = structuredClone(form);
                    next.conditions[idx].fact = e.target.value;
                    setForm(next);
                  }}
                  placeholder="fact (e.g. creditScore)"
                />
                <select
                  value={c.op}
                  onChange={(e) => {
                    const next = structuredClone(form);
                    next.conditions[idx].op = e.target.value;
                    setForm(next);
                  }}
                >
                  <option value=">">{">"}</option>
                  <option value=">=">{">="}</option>
                  <option value="<">{"<"}</option>
                  <option value="<=">{"<="}</option>
                  <option value="==">{"=="}</option>
                  <option value="!=">{"!="}</option>
                  <option value="in">{"in"}</option>
                </select>
                <input
                  value={String(c.value)}
                  onChange={(e) => {
                    const next = structuredClone(form);
                    next.conditions[idx].value = e.target.value;
                    setForm(next);
                  }}
                  placeholder={c.op === "in" ? "comma list (e.g. A,B,C)" : "value"}
                />
                <button type="button" onClick={() => removeCondition(idx)}>Remove</button>
              </div>
            ))}
            <button type="button" onClick={addCondition}>+ Add condition</button>
          </div>

          <h4>Actions</h4>
          <div className="row">
            <label>
              Decision
              <select value={form.actions.decision} onChange={(e) => setField("actions.decision", e.target.value)}>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </label>

            <label>
              Risk Level
              <select value={form.actions.riskLevel} onChange={(e) => setField("actions.riskLevel", e.target.value)}>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </label>
          </div>

          <div className="row">
            <label>
              Affordability rate (0–1)
              <input
                type="number"
                step="0.01"
                value={form.actions.affordabilityRate}
                onChange={(e) => setField("actions.affordabilityRate", e.target.value)}
              />
            </label>
            <label>
              Force recommended amount = 0
              <select
                value={String(form.actions.setRecommendedAmountToZero)}
                onChange={(e) => setField("actions.setRecommendedAmountToZero", e.target.value === "true")}
              >
                <option value="false">false</option>
                <option value="true">true</option>
              </select>
            </label>
          </div>

          <h4>Reasons</h4>
          <div className="stack">
            {form.actions.reasons.map((r, idx) => (
              <div className="cond" key={idx}>
                <input
                  value={r}
                  onChange={(e) => {
                    const next = structuredClone(form);
                    next.actions.reasons[idx] = e.target.value;
                    setForm(next);
                  }}
                  placeholder="Reason text"
                />
                <button type="button" onClick={() => removeReason(idx)}>Remove</button>
              </div>
            ))}
            <button type="button" onClick={addReason}>+ Add reason</button>
          </div>

          <button disabled={busy} type="submit">{busy ? "Saving..." : "Create rule"}</button>
        </form>
      </div>

      <div className="card">
        <h3>Existing Rules</h3>
        <div className="stack">
          {sorted.map((r) => (
            <div className="ruleRow" key={r._id}>
              <div>
                <div className="ruleTitle">
                  <b>{r.ruleId}</b> — {r.name}
                </div>
                <div className="muted">
                  priority: {r.priority} • enabled: {String(r.enabled)} • decision: {r.actions.decision} • risk: {r.actions.riskLevel}
                </div>
              </div>
              <div className="ruleBtns">
                <button type="button" onClick={() => toggleEnabled(r)}>
                  {r.enabled ? "Disable" : "Enable"}
                </button>
                <button type="button" onClick={() => remove(r)}>Delete</button>
              </div>
            </div>
          ))}
          {!sorted.length ? <p className="muted">No rules yet. Click “Seed default rules”.</p> : null}
        </div>
      </div>
    </div>
  );
}
