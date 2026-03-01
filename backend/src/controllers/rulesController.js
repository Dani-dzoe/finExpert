import { z } from "zod";
import Rule from "../models/Rule.js";

const condSchema = z.object({
  fact: z.string().min(1),
  op: z.enum([">", ">=", "<", "<=", "==", "!=", "in"]),
  value: z.any()
});

const ruleSchema = z.object({
  name: z.string().min(2),
  ruleId: z.string().min(2),
  priority: z.number().int().optional().default(0),
  enabled: z.boolean().optional().default(true),
  conditions: z.array(condSchema).optional().default([]),
  actions: z.object({
    decision: z.enum(["APPROVED", "REJECTED"]),
    riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]),
    affordabilityRate: z.number().optional().default(0),
    setRecommendedAmountToZero: z.boolean().optional().default(false),
    reasons: z.array(z.string()).optional().default([])
  })
});

export async function seedDefaultRules(req, res, next) {
  try {
    const count = await Rule.countDocuments();
    if (count > 0) return res.json({ ok: true, message: "Rules already exist." });

    const defaults = [
      {
        name: "Reject if unemployed",
        ruleId: "R4_UNEMPLOYED_REJECT",
        priority: 100,
        enabled: true,
        conditions: [{ fact: "employmentStatus", op: "==", value: "UNEMPLOYED" }],
        actions: {
          decision: "REJECTED",
          riskLevel: "HIGH",
          setRecommendedAmountToZero: true,
          reasons: ["Employment status is UNEMPLOYED, so the application is rejected."]
        }
      },
      {
        name: "Reject if bad credit OR high DTI",
        ruleId: "R3_BAD_CREDIT_OR_HIGH_DTI_REJECT",
        priority: 90,
        enabled: true,
        // NOTE: this is AND-only engine, so we model OR using two separate rules:
        // (a) creditScore < 600
        conditions: [{ fact: "creditScore", op: "<", value: 600 }],
        actions: {
          decision: "REJECTED",
          riskLevel: "HIGH",
          setRecommendedAmountToZero: true,
          reasons: ["Credit score is below 600.", "High risk application based on credit rules."]
        }
      },
      {
        name: "Reject if DTI > 50",
        ruleId: "R3B_HIGH_DTI_REJECT",
        priority: 89,
        enabled: true,
        conditions: [{ fact: "debtToIncomeRatio", op: ">", value: 50 }],
        actions: {
          decision: "REJECTED",
          riskLevel: "HIGH",
          setRecommendedAmountToZero: true,
          reasons: ["Debt-to-income ratio is above 50%.", "High risk application based on debt rules."]
        }
      },
      {
        name: "Strong approval (low risk)",
        ruleId: "R1_STRONG_APPROVAL_LOW_RISK",
        priority: 80,
        enabled: true,
        conditions: [
          { fact: "creditScore", op: ">=", value: 750 },
          { fact: "monthlyIncome", op: ">=", value: 5000 },
          { fact: "debtToIncomeRatio", op: "<", value: 30 }
        ],
        actions: {
          decision: "APPROVED",
          riskLevel: "LOW",
          affordabilityRate: 0.45,
          reasons: ["Meets strong approval thresholds (score/income/DTI)."]
        }
      },
      {
        name: "Standard approval (medium risk)",
        ruleId: "R2_STANDARD_APPROVAL_MEDIUM_RISK",
        priority: 70,
        enabled: true,
        conditions: [
          { fact: "creditScore", op: ">=", value: 650 },
          { fact: "monthlyIncome", op: ">=", value: 3000 },
          { fact: "debtToIncomeRatio", op: "<", value: 40 }
        ],
        actions: {
          decision: "APPROVED",
          riskLevel: "MEDIUM",
          affordabilityRate: 0.35,
          reasons: ["Meets standard approval thresholds (score/income/DTI)."]
        }
      },
      {
        name: "Fallback reject",
        ruleId: "R0_FALLBACK_REJECT",
        priority: 1,
        enabled: true,
        conditions: [],
        actions: {
          decision: "REJECTED",
          riskLevel: "HIGH",
          setRecommendedAmountToZero: true,
          reasons: ["Application does not meet approval thresholds."]
        }
      }
    ];

    await Rule.insertMany(defaults);
    res.status(201).json({ ok: true, inserted: defaults.length });
  } catch (err) {
    next(err);
  }
}

export async function listRules(req, res, next) {
  try {
    const rules = await Rule.find().sort({ priority: -1, createdAt: 1 });
    res.json(rules);
  } catch (err) {
    next(err);
  }
}

export async function getRule(req, res, next) {
  try {
    const r = await Rule.findById(req.params.id);
    if (!r) return res.status(404).json({ error: "Not found" });
    res.json(r);
  } catch (err) {
    next(err);
  }
}

export async function createRule(req, res, next) {
  try {
    const parsed = ruleSchema.parse(req.body);
    const created = await Rule.create(parsed);
    res.status(201).json(created);
  } catch (err) {
    err.status = 400;
    next(err);
  }
}

export async function updateRule(req, res, next) {
  try {
    const parsed = ruleSchema.partial().parse(req.body);
    const updated = await Rule.findByIdAndUpdate(req.params.id, parsed, { new: true });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    err.status = 400;
    next(err);
  }
}

export async function deleteRule(req, res, next) {
  try {
    const deleted = await Rule.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
