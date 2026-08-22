import { chromium } from "playwright";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { runAgent } from "../agent/agent";
import type { TestRequest, TestResult } from "../types/test.types";

export async function runBrowserTest(request: TestRequest): Promise<TestResult> {
  const browser = await chromium.launch();

  try {
    const context = await browser.newContext();
    const runId = crypto.randomUUID();
    const tracePath = path.join("artifacts", runId, "trace.zip");
    let tracingStarted = false;

    try {
      await fs.mkdir(path.dirname(tracePath), { recursive: true });

      await context.tracing.start({
        screenshots: true,
        snapshots: true,
        sources: true,
      });

      tracingStarted = true;

      const page = await context.newPage();
      await page.goto(request.url, { waitUntil: "domcontentloaded", timeout: 30_000 });

      const result = await runAgent(page, request.goal, runId);

      return {
        ...result,
        trace: tracePath,
      };
    } finally {
      if (tracingStarted) {
        await context.tracing.stop({ path: tracePath });
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }
}
