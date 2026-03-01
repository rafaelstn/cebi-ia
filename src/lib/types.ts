export type AgentType = "arkas" | "os" | "rag";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  provider?: "ollama" | "openai";
}

export interface ArenaRequest {
  message: string;
  agent: AgentType;
  ollamaUrl: string | null;
  ollamaModel: string;
  history: ChatMessage[];
}

export interface ProviderResult {
  content: string;
  model: string;
  latency_ms: number;
  tokens_prompt: number;
  tokens_completion: number;
  tokens_total: number;
  cost_usd: number;
  error: string | null;
}

export interface ArenaResponse {
  ollama: ProviderResult | null;
  openai: ProviderResult;
}

export interface ArenaBubble {
  id: string;
  role: "user" | "assistant";
  ollama?: ProviderResult;
  openai?: ProviderResult;
  timestamp: number;
}

export interface ArenaConfig {
  ollamaUrl: string;
  ollamaModel: string;
  ollamaOnline: boolean;
  agent: AgentType;
}