import { useState } from "react";
import { submitApplication } from "../api.js";

const initial = {
  fullName: "",
  monthlyIncome: 0,
  employmentStatus: "EMPLOYED",
  creditScore: 700,
  existingDebts: 0,
  requestedAmount: 1000,
  purpose: "PERSONAL"
};

export default function LoanForm({ onResult }) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  function setField(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      // ensure numbers are numbers
      const payload = {
        ...form,
        monthlyIncome: Number(form.monthlyIncome),
        creditScore: Number(form.creditScore),
        existingDebts: Number(form.existingDebts),
        requestedAmount: Number(form.requestedAmount)
      };

      const saved = await submitApplication(payload);
      onResult(saved);
    } catch (e2) {
      setErr(e2.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="form">
      <label>
        Full name
        <input
          value={form.fullName}
          onChange={(e) => setField("fullName", e.target.value)}
          placeholder="e.g. Ama Mensah"
          required
        />
      </label>

      <div className="row">
        <label>
          Monthly income
          <input
            type="number"
            min="0"
            value={form.monthlyIncome}
            onChange={(e) => setField("monthlyIncome", e.target.value)}
            required
          />
        </label>

        <label>
          Credit score
          <input
            type="number"
            min="0"
            max="900"
            value={form.creditScore}
            onChange={(e) => setField("creditScore", e.target.value)}
            required
          />
        </label>
      </div>

      <div className="row">
        <label>
          Existing monthly debts
          <input
            type="number"
            min="0"
            value={form.existingDebts}
            onChange={(e) => setField("existingDebts", e.target.value)}
            required
          />
        </label>

        <label>
          Requested amount
          <input
            type="number"
            min="1"
            value={form.requestedAmount}
            onChange={(e) => setField("requestedAmount", e.target.value)}
            required
          />
        </label>
      </div>

      <div className="row">
        <label>
          Employment status
          <select
            value={form.employmentStatus}
            onChange={(e) => setField("employmentStatus", e.target.value)}
          >
            <option value="EMPLOYED">EMPLOYED</option>
            <option value="SELF_EMPLOYED">SELF_EMPLOYED</option>
            <option value="UNEMPLOYED">UNEMPLOYED</option>
            <option value="STUDENT">STUDENT</option>
            <option value="RETIRED">RETIRED</option>
          </select>
        </label>

        <label>
          Purpose
          <select
            value={form.purpose}
            onChange={(e) => setField("purpose", e.target.value)}
          >
            <option value="BUSINESS">BUSINESS</option>
            <option value="EDUCATION">EDUCATION</option>
            <option value="PERSONAL">PERSONAL</option>
            <option value="HOME">HOME</option>
            <option value="CAR">CAR</option>
            <option value="MEDICAL">MEDICAL</option>
            <option value="OTHER">OTHER</option>
          </select>
        </label>
      </div>

      {err ? <p className="error">{err}</p> : null}

      <button disabled={loading} type="submit">
        {loading ? "Submitting..." : "Evaluate Loan"}
      </button>
    </form>
  );
}
