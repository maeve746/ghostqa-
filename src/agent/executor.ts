import type { Locator, Page } from "playwright";
import type { AgentAction } from "../types/agent.types";

export async function executeAction(page: Page, action: AgentAction): Promise<void> {
  if (action.type === "finish" || action.type === "pass" || action.type === "fail") {
    return;
  }

  if (!action.target) {
    throw new Error(`Action "${action.type}" requires a target`);
  }

  if (action.type === "fill") {
    await findFillTarget(page, action.target).fill(action.value ?? "");
    return;
  }

  if (action.type === "click") {
    await findClickTarget(page, action.target).click();
  }
}

function findFillTarget(page: Page, target: string): Locator {
  return page
    .getByLabel(target)
    .or(page.getByPlaceholder(target))
    .or(page.locator(`[name="${escapeAttributeValue(target)}"]`))
    .or(page.locator(target))
    .first();
}

function findClickTarget(page: Page, target: string): Locator {
  return page
    .getByRole("button", { name: target })
    .or(page.getByRole("link", { name: target }))
    .or(page.getByText(target, { exact: true }))
    .or(page.locator(target))
    .first();
}

function escapeAttributeValue(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"");
}
