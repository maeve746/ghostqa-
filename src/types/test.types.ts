import { z } from "zod";
import type { AgentResult } from "./agent.types";

export const testRequestSchema = z.object({
  url: z.string().url(),
  goal: z.string().min(1),
});

export type TestRequest = z.infer<typeof testRequestSchema>;

export type TestResult = AgentResult;
