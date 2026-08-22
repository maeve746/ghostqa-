import type { AgentAction } from "../types/agent.types";

export async function decideNextAction(
  goal: string,
  observation: unknown,
  history: unknown[],
): Promise<AgentAction> {
  void goal;
  void observation;
  void history;

  throw new Error("LLM provider not implemented");
}
