import type { Page } from "playwright";
import crypto from "node:crypto";

import { observePage } from "./observer";
import { executeAction } from "./executor";
import { planNextAction } from "./planner";
import { capturePageState } from "../evidence/evidence.collector";
import { attachBrowserListeners } from "../evidence/browser.listeners";
import type { AgentAction, AgentResult } from "../types/agent.types";

export async function runAgent(
  page: Page,
  goal: string,
  runId = crypto.randomUUID(),
): Promise<AgentResult> {
  const history: any[] = [];
  const evidence: any[] = [];

  const browserEvents =
    attachBrowserListeners(page);

  let lastConsoleIndex = 0;
  let lastNetworkIndex = 0;

  const MAX_STEPS = 20;

  for (
    let step = 1;
    step <= MAX_STEPS;
    step++
  ) {
    const startedAt = Date.now();

    const observation =
      await observePage(page);

    const action =
      await planNextAction(
        {
          url: page.url(),
          instruction: goal,
        },
        observation,
        history.map((item) => (item as { action: AgentAction }).action),
      );

    const before =
      await capturePageState(
        page,
        runId,
        step,
        "before"
      );

    history.push({
      step,
      action,
      observation,
    });

    if (
      action.type === "pass" ||
      action.type === "fail"
    ) {
      const finishedAt = Date.now();

      const after =
        await capturePageState(
          page,
          runId,
          step,
          "after"
        );

      evidence.push({
        step,
        action,
        before,
        after,
        consoleErrors:
          browserEvents.consoleErrors.slice(
            lastConsoleIndex
          ),
        networkErrors:
          browserEvents.networkErrors.slice(
            lastNetworkIndex
          ),
        startedAt,
        finishedAt,
        duration:
          finishedAt - startedAt,
      });

      return {
        runId,
        success:
          action.type === "pass",
        status:
          action.type === "pass"
            ? "PASS"
            : "FAIL",
        reason: action.reason,
        history,
        evidence,
      };
    }

    try {
      await executeAction(
        page,
        action
      );
    } catch (error) {
      const finishedAt = Date.now();

      const after =
        await capturePageState(
          page,
          runId,
          step,
          "after"
        );

      evidence.push({
        step,
        action,
        before,
        after,

        consoleErrors:
          browserEvents.consoleErrors.slice(
            lastConsoleIndex
          ),

        networkErrors:
          browserEvents.networkErrors.slice(
            lastNetworkIndex
          ),

        startedAt,
        finishedAt,
        duration:
          finishedAt - startedAt,

        executionError:
          error instanceof Error
            ? error.message
            : "Unknown action error",
      });

      return {
        runId,
        success: false,
        status: "ACTION_FAILED",
        reason:
          error instanceof Error
            ? error.message
            : "Unknown action failure",
        history,
        evidence,
      };
    }

    await page.waitForTimeout(500);

    const after =
      await capturePageState(
        page,
        runId,
        step,
        "after"
      );

    const finishedAt = Date.now();

    const stepConsole =
      browserEvents.consoleErrors.slice(
        lastConsoleIndex
      );

    const stepNetwork =
      browserEvents.networkErrors.slice(
        lastNetworkIndex
      );

    lastConsoleIndex =
      browserEvents.consoleErrors.length;

    lastNetworkIndex =
      browserEvents.networkErrors.length;

    evidence.push({
      step,
      action,
      before,
      after,
      consoleErrors: stepConsole,
      networkErrors: stepNetwork,
      startedAt,
      finishedAt,
      duration:
        finishedAt - startedAt,
    });
  }

  return {
    runId,
    success: false,
    status: "MAX_STEPS_REACHED",
    history,
    evidence,
  };
}
