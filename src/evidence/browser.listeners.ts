import type { Page } from "playwright";
import type {
  ConsoleEvidence,
  NetworkEvidence,
} from "../types/evidence.types";

export function attachBrowserListeners(page: Page) {
  const consoleErrors: ConsoleEvidence[] = [];
  const networkErrors: NetworkEvidence[] = [];

  page.on("console", (message) => {
    if (
      message.type() === "error" ||
      message.type() === "warning"
    ) {
      consoleErrors.push({
        type: message.type(),
        text: message.text(),
        timestamp: Date.now(),
      });
    }
  });

  page.on("requestfailed", (request) => {
    networkErrors.push({
      method: request.method(),
      url: request.url(),
      error:
        request.failure()?.errorText ??
        "Unknown network error",
      timestamp: Date.now(),
    });
  });

  page.on("response", (response) => {
    if (response.status() >= 400) {
      networkErrors.push({
        method: response.request().method(),
        url: response.url(),
        status: response.status(),
        timestamp: Date.now(),
      });
    }
  });

  return {
    consoleErrors,
    networkErrors,
  };
}
