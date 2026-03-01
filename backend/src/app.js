import express from "express";
import cors from "cors";
import morgan from "morgan";
import rulesRouter from "./routes/rules.js";
import applicationsRouter from "./routes/applications.js";
import statsRouter from "./routes/stats.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.use("/api/stats", statsRouter);
app.use("/api/rules", rulesRouter);
app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/applications", applicationsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Server error"
  });
});

export default app;
