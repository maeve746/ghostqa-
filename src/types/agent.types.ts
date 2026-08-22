export type AgentGoal = {
  url: string;
  instruction: string;
};

export type AgentElement = {
  id: number;
  tag: string;
  text: string;
  role: string | null;
  type: string | null;
  name: string | null;
  placeholder: string | null;
};

export type AgentPageState = {
  url: string;
  title?: string;
  elements: AgentElement[];
};

export type AgentAction = {
  type: "fill" | "click" | "finish" | "pass" | "fail";
  target?: string;
  value?: string;
  reason?: string | undefined;
};

export type AgentObservation = {
  url: string;
  title?: string;
  elements: AgentElement[];
};

export type AgentResult = {
  runId: string;
  success: boolean;
  status: "PASS" | "FAIL" | "ACTION_FAILED" | "MAX_STEPS_REACHED";
  reason?: string;
  history: unknown[];
  evidence: unknown[];
  trace?: string;
};
