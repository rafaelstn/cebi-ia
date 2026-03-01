"use client";
import type { ProviderResult } from "@/lib/types";

interface Props {
  role: "user" | "assistant";
  content: string;
  image?: string;
  metrics?: ProviderResult;
  color: "green" | "violet";
}

function formatContent(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
}

export default function MessageBubble({ role, content, image, metrics, color }: Props) {
  if (role === "user") {
    return (
      <div className="msg user">
        <div>
          {image && <img className="msg-image" src={image} alt="foto" />}
          <div className="msg-bubble">{content}</div>
        </div>
      </div>
    );
  }

  const hasError = metrics?.error;
  const usedAI = metrics && metrics.tokens_total > 0;
  const accentColor = color === "green" ? "var(--accent-green)" : "var(--accent-violet)";

  return (
    <div className="msg assistant">
      <div>
        {hasError ? (
          <div className="msg-error">
            <span>✕ {metrics.error}</span>
          </div>
        ) : (
          <div className="msg-bubble" dangerouslySetInnerHTML={{ __html: formatContent(content) }} />
        )}

        {metrics && !hasError && (
          <div className="msg-metrics">
            <span className="metric latency" style={{ color: accentColor }}>
              ⏱ {(metrics.latency_ms / 1000).toFixed(1)}s
            </span>
            {usedAI ? (
              <>
                <span className="metric tokens">{metrics.tokens_total} tok</span>
                {metrics.cost_usd > 0 ? (
                  <span className="metric cost-paid">{"$"}{metrics.cost_usd.toFixed(5)}</span>
                ) : (
                  <span className="metric cost-free">grátis</span>
                )}
              </>
            ) : (
              <span className="metric system-tag">resposta do sistema</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
