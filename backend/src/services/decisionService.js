import { forwardChainingInfer } from "./inferenceEngine.js";

export function computeFacts(input) {
  const monthlyIncome = Number(input.monthlyIncome);
  const existingDebts = Number(input.existingDebts);

  const debtToIncomeRatio =
    monthlyIncome > 0 ? (existingDebts / monthlyIncome) * 100 : 100;

  return {
    ...input,
    monthlyIncome,
    existingDebts,
    creditScore: Number(input.creditScore),
    requestedAmount: Number(input.requestedAmount),
    debtToIncomeRatio
  };
}

export async function decideLoan(input) {
  const facts = computeFacts(input);
  const result = await forwardChainingInfer(facts);
  return { facts, result };
}
