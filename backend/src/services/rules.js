// Simple production rules for FinExpert (IF-THEN).
// Forward chaining: evaluate facts -> fire first matching rule in priority order.

export const rules = [
  {
    id: "R4_UNEMPLOYED_REJECT",
    priority: 100,
    when: (f) => f.employmentStatus === "UNEMPLOYED",
    then: (f) => ({
      decision: "REJECTED",
      riskLevel: "HIGH",
      recommendedAmount: 0,
      reasons: ["Employment status is UNEMPLOYED, so the application is rejected."]
    })
  },

  {
    id: "R3_BAD_CREDIT_OR_HIGH_DTI_REJECT",
    priority: 90,
    when: (f) => f.creditScore < 600 || f.debtToIncomeRatio > 50,
    then: (f) => ({
      decision: "REJECTED",
      riskLevel: "HIGH",
      recommendedAmount: 0,
      reasons: [
        f.creditScore < 600
          ? `Credit score (${f.creditScore}) is below 600.`
          : null,
        f.debtToIncomeRatio > 50
          ? `Debt-to-income ratio (${f.debtToIncomeRatio.toFixed(1)}%) is above 50%.`
          : null,
        "High risk application based on credit/debt rules."
      ].filter(Boolean)
    })
  },

  {
    id: "R1_STRONG_APPROVAL_LOW_RISK",
    priority: 80,
    when: (f) =>
      f.creditScore >= 750 &&
      f.monthlyIncome >= 5000 &&
      f.debtToIncomeRatio < 30,
    then: (f) => ({
      decision: "APPROVED",
      riskLevel: "LOW",
      recommendedAmount: recommendAmount(f, 0.45),
      reasons: [
        `Credit score (${f.creditScore}) ≥ 750.`,
        `Monthly income (${f.monthlyIncome}) ≥ 5000.`,
        `Debt-to-income ratio (${f.debtToIncomeRatio.toFixed(1)}%) < 30%.`,
        "Low risk profile."
      ]
    })
  },

  {
    id: "R2_STANDARD_APPROVAL_MEDIUM_RISK",
    priority: 70,
    when: (f) =>
      f.creditScore >= 650 &&
      f.monthlyIncome >= 3000 &&
      f.debtToIncomeRatio < 40,
    then: (f) => ({
      decision: "APPROVED",
      riskLevel: "MEDIUM",
      recommendedAmount: recommendAmount(f, 0.35),
      reasons: [
        `Credit score (${f.creditScore}) ≥ 650.`,
        `Monthly income (${f.monthlyIncome}) ≥ 3000.`,
        `Debt-to-income ratio (${f.debtToIncomeRatio.toFixed(1)}%) < 40%.`,
        "Medium risk profile."
      ]
    })
  },

  // Fallback rule
  {
    id: "R0_FALLBACK_REVIEW",
    priority: 10,
    when: (f) => true,
    then: (f) => ({
      decision: "REJECTED",
      riskLevel: "HIGH",
      recommendedAmount: 0,
      reasons: [
        "Application does not meet approval thresholds.",
        "Rejected by fallback rule."
      ]
    })
  }
];

function recommendAmount(facts, affordabilityRate) {
  // A simple recommended amount: affordabilityRate * annual income, capped by requestedAmount
  const annualIncome = facts.monthlyIncome * 12;
  const cap = annualIncome * affordabilityRate;

  // Also reduce based on higher debts (soft penalty)
  const debtPenalty = Math.max(0.6, 1 - facts.existingDebts / Math.max(1, annualIncome));
  const suggested = cap * debtPenalty;

  return Math.max(0, Math.min(facts.requestedAmount, Math.round(suggested)));
}
