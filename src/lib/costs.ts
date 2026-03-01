interface ModelCost {
  input: number;
  output: number;
}

const COST_PER_TOKEN: Record<string, ModelCost> = {
  "gpt-4.1-mini": {
    input: 0.40 / 1_000_000,
    output: 1.60 / 1_000_000,
  },
  "gpt-4o-mini": {
    input: 0.15 / 1_000_000,
    output: 0.60 / 1_000_000,
  },
  "gpt-3.5-turbo": {
    input: 0.50 / 1_000_000,
    output: 1.50 / 1_000_000,
  },
  "qwen3:8b": { input: 0, output: 0 },
};

export function calcCost(
  model: string,
  tokensPrompt: number,
  tokensCompletion: number
): number {
  const cost = COST_PER_TOKEN[model] ?? { input: 0, output: 0 };
  return tokensPrompt * cost.input + tokensCompletion * cost.output;
}

export const MONTHLY_MESSAGES = 120_000;