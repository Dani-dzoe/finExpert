import Rule from "../models/Rule.js";

function compare(factValue, op, expected) {
  switch (op) {
    case ">": return factValue > expected;
    case ">=": return factValue >= expected;
    case "<": return factValue < expected;
    case "<=": return factValue <= expected;
    case "==": return factValue === expected;
    case "!=": return factValue !== expected;
    case "in": return Array.isArray(expected) && expected.includes(factValue);
    default: return false;
  }
}

function ruleMatches(rule, facts) {
  const conds = rule.conditions || [];
  // If no conditions, treat as always true (useful for fallback rules)
  if (conds.length === 0) return true;

  // AND logic
  return conds.every((c) => compare(facts[c.fact], c.op, c.value));
}

function recommendAmount(facts, affordabilityRate) {
  const annualIncome = facts.monthlyIncome * 12;
  const cap = annualIncome * affordabilityRate;

  const debtPenalty = Math.max(0.6, 1 - facts.existingDebts / Math.max(1, annualIncome));
  const suggested = cap * debtPenalty;

  return Math.max(0, Math.min(facts.requestedAmount, Math.round(suggested)));
}

export async function forwardChainingInfer(facts) {
  const rules = await Rule.find({ enabled: true }).sort({ priority: -1, createdAt: 1 });

  const firedRules = [];
  const explanation = [];

  for (const rule of rules) {
    if (ruleMatches(rule, facts)) {
      firedRules.push(rule.ruleId);

      const a = rule.actions;

      // Build recommendedAmount
      let recommendedAmount = 0;
      if (a.setRecommendedAmountToZero) {
        recommendedAmount = 0;
      } else {
        const rate = Number(a.affordabilityRate || 0);
        recommendedAmount = recommendAmount(facts, rate);
      }

      // reasons: include rule + reasons
      explanation.push(`Rule fired: ${rule.ruleId} (${rule.name})`);
      if (Array.isArray(a.reasons)) explanation.push(...a.reasons);

      return {
        decision: a.decision,
        riskLevel: a.riskLevel,
        recommendedAmount,
        firedRules,
        explanation
      };
    }
  }

  // If no rules found or none matched
  return {
    decision: "REJECTED",
    riskLevel: "HIGH",
    recommendedAmount: 0,
    firedRules,
    explanation: ["No enabled rule matched; default rejection applied."]
  };
}
