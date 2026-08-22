export interface ConsoleEvidence {
  type: string;
  text: string;
  timestamp: number;
}

export interface NetworkEvidence {
  method: string;
  url: string;
  status?: number;
  error?: string;
  timestamp: number;
}

export interface StepEvidence {
  step: number;

  action: unknown;

  before: {
    url: string;
    title: string;
    screenshot?: string;
    snapshot?: string;
  };

  after: {
    url: string;
    title: string;
    screenshot?: string;
    snapshot?: string;
  };

  consoleErrors: ConsoleEvidence[];
  networkErrors: NetworkEvidence[];

  startedAt: number;
  finishedAt: number;
  duration: number;
}