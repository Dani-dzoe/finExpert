import { Router } from "express";
import {
  createApplication,
  listApplications,
  getApplication
} from "../controllers/applicationsController.js";

const router = Router();

router.post("/", createApplication);
router.get("/", listApplications);
router.get("/:id", getApplication);

export default router;
