import type { Page } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

export async function captureScreenshot(
  page: Page,
  runId: string,
  step: number,
  stage: "before" | "after",
): Promise<string> {
  const directory = path.join("artifacts", runId);

  await fs.mkdir(directory, {
    recursive: true,
  });

  const filename = `step-${step}-${stage}.png`;

  const filepath = path.join(directory, filename);

  await page.screenshot({
    path: filepath,
    fullPage: true,
  });

  return filepath;
}
