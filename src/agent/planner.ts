import { decideNextAction } from "../services/llm.service";
import type {
  AgentAction,
  AgentGoal,
  AgentPageState,
} from "../types/agent.types";

export async function planNextAction(
  goal: AgentGoal,
  currentPage: AgentPageState,
  previousActions: AgentAction[],
): Promise<AgentAction> {
  try {
    return await decideNextAction(goal.instruction, currentPage, previousActions);
  } catch (error) {
    if (error instanceof Error && error.message === "LLM provider not implemented") {
      return decideFallbackAction(goal, currentPage, previousActions);
    }

    throw error;
  }
}

function decideFallbackAction(
  goal: AgentGoal,
  currentPage: AgentPageState,
  previousActions: AgentAction[],
): AgentAction {
  if (goal.instruction.toLowerCase().includes("login")) {
    return decideLoginAction(currentPage, previousActions);
  }

  return decideSignupAction(previousActions);
}

function decideLoginAction(
  currentPage: AgentPageState,
  previousActions: AgentAction[],
): AgentAction {
  if (pageLooksLikeDashboard(currentPage)) {
    return {
      type: "pass",
      reason: "Dashboard observed after login",
    };
  }

  if (!hasAction(previousActions, "click", "Login")) {
    return {
      type: "click",
      target: "Login",
    };
  }

  if (!hasAction(previousActions, "fill", "Email")) {
    return {
      type: "fill",
      target: "Email",
      value: "ghostqa@test.com",
    };
  }

  if (!hasAction(previousActions, "fill", "Password")) {
    return {
      type: "fill",
      target: "Password",
      value: "GhostQA123!",
    };
  }

  if (!hasLoginSubmitClick(previousActions)) {
    return {
      type: "click",
      target: "Login",
    };
  }

  return {
    type: "fail",
    reason: "Login was submitted, but dashboard was not observed",
  };
}

function hasAction(
  previousActions: AgentAction[],
  type: AgentAction["type"],
  target: string,
): boolean {
  return previousActions.some((action) => action.type === type && action.target === target);
}

function hasLoginSubmitClick(previousActions: AgentAction[]): boolean {
  const passwordIndex = previousActions.findIndex(
    (action) => action.type === "fill" && action.target === "Password",
  );

  if (passwordIndex === -1) {
    return false;
  }

  return previousActions
    .slice(passwordIndex + 1)
    .some((action) => action.type === "click" && action.target === "Login");
}

function decideSignupAction(previousActions: AgentAction[]): AgentAction {
  if (!previousActions.some((action) => action.type === "fill" && action.target === "Email")) {
    return {
      type: "fill",
      target: "Email",
      value: "ghostqa@test.com",
    };
  }

  if (!previousActions.some((action) => action.type === "fill" && action.target === "Password")) {
    return {
      type: "fill",
      target: "Password",
      value: "GhostQA123!",
    };
  }

  if (
    !previousActions.some(
      (action) => action.type === "click" && action.target === "Create Account",
    )
  ) {
    return {
      type: "click",
      target: "Create Account",
    };
  }

  return {
    type: "pass",
    reason: "Signup flow submitted",
  };
}

function pageLooksLikeDashboard(currentPage: AgentPageState): boolean {
  const pageText = [
    currentPage.url,
    currentPage.title ?? "",
    ...currentPage.elements.flatMap((element) => [
      element.text,
      element.name ?? "",
      element.placeholder ?? "",
    ]),
  ].join(" ");

  return /dashboard/i.test(pageText);
}
