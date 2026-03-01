import mongoose from "mongoose";

const ConditionSchema = new mongoose.Schema(
  {
    fact: { type: String, required: true },         // e.g. "creditScore"
    op: { type: String, required: true },           // ">", ">=", "<", "<=", "==", "!=", "in"
    value: { type: mongoose.Schema.Types.Mixed, required: true } // number/string/array
  },
  { _id: false }
);

const ActionSchema = new mongoose.Schema(
  {
    decision: { type: String, enum: ["APPROVED", "REJECTED"], required: true },
    riskLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], required: true },
    // recommended amount formula parameters
    affordabilityRate: { type: Number, default: 0 }, // e.g. 0.45
    setRecommendedAmountToZero: { type: Boolean, default: false },
    reasons: { type: [String], default: [] }
  },
  { _id: false }
);

const RuleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },          // friendly name
    ruleId: { type: String, required: true, unique: true }, // e.g. "R1_STRONG_APPROVAL"
    priority: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true },

    // AND-combined conditions by default
    conditions: { type: [ConditionSchema], default: [] },

    // rule output
    actions: { type: ActionSchema, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Rule", RuleSchema);
