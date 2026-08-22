import { Router } from "express";

export const testRouter = Router();

testRouter.get("/", (_req, res) => {
  res.json({ message: "GhostQA test route is ready" });
});
