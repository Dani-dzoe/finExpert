import { Router } from "express";
import {
  seedDefaultRules,
  listRules,
  getRule,
  createRule,
  updateRule,
  deleteRule
} from "../controllers/rulesController.js";

const router = Router();

router.post("/seed", seedDefaultRules);
router.get("/", listRules);
router.get("/:id", getRule);
router.post("/", createRule);
router.patch("/:id", updateRule);
router.delete("/:id", deleteRule);

export default router;
