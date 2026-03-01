import mongoose from "mongoose";

const LoanApplicationSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    monthlyIncome: { type: Number, required: true },
    employmentStatus: {
      type: String,
      enum: ["EMPLOYED", "SELF_EMPLOYED", "UNEMPLOYED", "STUDENT", "RETIRED"],
      required: true
    },
    creditScore: { type: Number, required: true },
    existingDebts: { type: Number, required: true },
    requestedAmount: { type: Number, required: true },
    purpose: {
      type: String,
      enum: ["BUSINESS", "EDUCATION", "PERSONAL", "HOME", "CAR", "MEDICAL", "OTHER"],
      required: true
    },

    // outputs
    debtToIncomeRatio: { type: Number, required: true }, // percentage
    decision: { type: String, enum: ["APPROVED", "REJECTED"], required: true },
    riskLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], required: true },
    recommendedAmount: { type: Number, required: true },
    explanation: { type: [String], default: [] },
    firedRules: { type: [String], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model("LoanApplication", LoanApplicationSchema);
