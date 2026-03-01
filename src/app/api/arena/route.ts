import { NextRequest, NextResponse } from "next/server";

interface ProviderResult {
  content: string;
  model: string;
  latency_ms: number;
  tokens_prompt: number;
  tokens_completion: number;
  tokens_total: number;
  cost_usd: number;
  error: string | null;
}

async function callBackend(
  baseUrl: string,
  message: string,
  sessionId: string,
  providerName: string,
  timeout: number = 120000,
  openaiModel?: string
): Promise<ProviderResult> {
  const start = performance.now();
  try {
    const body: Record<string, unknown> = {
      messages: [{ role: "user", content: message }],
      model: "agencia-arkas",
      session_id: sessionId,
    };

    // Se openaiModel foi passado, envia pro backend OpenIA
    if (openaiModel) {
      body.openai_model = openaiModel;
    }

    const res = await fetch(baseUrl + "/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeout),
    });
    const data = await res.json();
    const latency = Math.round(performance.now() - start);
    const rawContent = data.choices?.[0]?.message?.content ?? "";
    let content = rawContent;
    try {
      const parsed = JSON.parse(rawContent);
      content = parsed.Mensagem || rawContent;
    } catch {
      /* not JSON */
    }
    const usage = data.usage ?? {};
    return {
      content,
      model: data.model || providerName,
      latency_ms: latency,
      tokens_prompt: usage.prompt_tokens ?? 0,
      tokens_completion: usage.completion_tokens ?? 0,
      tokens_total: (usage.prompt_tokens ?? 0) + (usage.completion_tokens ?? 0),
      cost_usd: 0,
      error: null,
    };
  } catch (err) {
    return {
      content: "",
      model: providerName,
      latency_ms: Math.round(performance.now() - start),
      tokens_prompt: 0,
      tokens_completion: 0,
      tokens_total: 0,
      cost_usd: 0,
      error: err instanceof Error ? err.message : "Erro",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, localUrl, openiaUrl, sessionId, openaiModel } = body;
    if (!message?.trim()) {
      return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });
    }

    const sid = sessionId || "arena-" + Date.now();

    const effectiveLocal = localUrl ? localUrl.replace(/\/+$/, "") : null;
    const effectiveOpenia = openiaUrl
      ? openiaUrl.replace(/\/+$/, "")
      : localUrl
        ? localUrl.replace(/\/+$/, "").replace(":8002", ":8003")
        : null;

    const [localResult, openiaResult] = await Promise.all([
      effectiveLocal
        ? callBackend(effectiveLocal, message, sid, "qwen3:8b", 120000)
        : Promise.resolve(null),
      effectiveOpenia
        ? callBackend(effectiveOpenia, message, sid, openaiModel || "gpt-4.1-mini", 30000, openaiModel)
        : Promise.resolve(null),
    ]);

    return NextResponse.json({ local: localResult, openia: openiaResult });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno" },
      { status: 500 }
    );
  }
}
