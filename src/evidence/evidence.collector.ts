import type { Page } from "playwright";
import { captureScreenshot } from "./screenshot";
import { observePage } from "../agent/observer";

export async function capturePageState(
  page: Page,
  runId: string,
  step: number,
  stage: "before" | "after",
) {
  const observation = await observePage(page);

  const screenshot = await captureScreenshot(page, runId, step, stage);

  return {
    url: observation.url,
    title: observation.title,
    screenshot,
    snapshot: JSON.stringify(observation.elements),
  };
}
