import LoanApplication from "../models/LoanApplication.js";

export async function getStats(req, res, next) {
  try {
    const total = await LoanApplication.countDocuments();

    const byRisk = await LoanApplication.aggregate([
      { $group: { _id: "$riskLevel", count: { $sum: 1 } } }
    ]);

    const byDecision = await LoanApplication.aggregate([
      { $group: { _id: "$decision", count: { $sum: 1 } } }
    ]);

    res.json({
      total,
      byRisk,
      byDecision
    });
  } catch (err) {
    next(err);
  }
}
