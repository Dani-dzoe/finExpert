import { z } from "zod";
import LoanApplication from "../models/LoanApplication.js";
import { decideLoan } from "../services/decisionService.js";

const schema = z.object({
  fullName: z.string().min(2),
  monthlyIncome: z.number().nonnegative(),
  employmentStatus: z.enum(["EMPLOYED", "SELF_EMPLOYED", "UNEMPLOYED", "STUDENT", "RETIRED"]),
  creditScore: z.number().int().min(0).max(900),
  existingDebts: z.number().nonnegative(),
  requestedAmount: z.number().positive(),
  purpose: z.enum(["BUSINESS", "EDUCATION", "PERSONAL", "HOME", "CAR", "MEDICAL", "OTHER"])
});

export async function createApplication(req, res, next) {
  try {
    const parsed = schema.parse(req.body);
    const { facts, result } = await decideLoan(parsed);

    const saved = await LoanApplication.create({
      ...parsed,
      debtToIncomeRatio: facts.debtToIncomeRatio,
      decision: result.decision,
      riskLevel: result.riskLevel,
      recommendedAmount: result.recommendedAmount,
      explanation: result.explanation,
      firedRules: result.firedRules
    });

    res.status(201).json(saved);
  } catch (err) {
    err.status = 400;
    next(err);
  }
}

export async function listApplications(req, res, next) {
  try {
    const items = await LoanApplication.find().sort({ createdAt: -1 }).limit(50);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function getApplication(req, res, next) {
  try {
    const item = await LoanApplication.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
}
