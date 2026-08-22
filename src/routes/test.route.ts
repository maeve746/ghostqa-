import { Router } from "express";
import { ZodError } from "zod";
import { runBrowserTest } from "../services/browser.service";
import { testRequestSchema } from "../types/test.types";

export const testRouter = Router();

testRouter.get("/", (_req, res) => {
  res.json({ message: "GhostQA test route is ready" });
});

testRouter.post("/", async (req, res, next) => {
  try {
    const testRequest = testRequestSchema.parse(req.body);
    const result = await runBrowserTest(testRequest);

    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: "Invalid test request",
        issues: error.issues,
      });
      return;
    }

    next(error);
  }
});
