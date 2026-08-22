import { Page } from "playwright";
import type { AgentObservation } from "../types/agent.types";

export async function observePage(page: Page): Promise<AgentObservation> {
  const title = await page.title();
  const url = page.url();

  const elements = await page
    .locator("button, a, input, textarea, select, [role]")
    .evaluateAll((nodes) =>
      nodes.slice(0, 150).map((node, index) => {
        const el = node as HTMLElement;

        return {
          id: index,
          tag: el.tagName.toLowerCase(),
          text:
            el.innerText ||
            el.getAttribute("aria-label") ||
            el.getAttribute("placeholder") ||
            "",
          role: el.getAttribute("role"),
          type: el.getAttribute("type"),
          name: el.getAttribute("name"),
          placeholder: el.getAttribute("placeholder"),
        };
      }),
    );

  return {
    url,
    title,
    elements,
  };
}
