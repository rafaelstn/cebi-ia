"use client";

import { useState, useEffect, useCallback } from "react";
import ChatPanel from "@/components/ChatPanel";
import MessageInput from "@/components/MessageInput";
import MetricsBar from "@/components/MetricsBar";
import Toolbar from "@/components/Toolbar";
import type { ProviderResult } from "@/lib/types";

interface PanelMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
  metrics?: ProviderResult;
}

type ViewMode = "cebi" | "comparison" | "openia";
type Agent = "arkas" | "os" | "rag";

export default function ArenaPage() {
  const [baseUrl] = useState("http://localhost:8002");
  const [localOnline, setLocalOnline] = useState(false);
  const [openiaOnline, setOpeniaOnline] = useState(false);
  const [localMessages, setLocalMessages] = useState<PanelMessage[]>([]);
  const [openiaMessages, setOpeniaMessages] = useState<PanelMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("arena-" + Date.now());
  const [totalMessages, setTotalMessages] = useState(0);
  const [localTotalLatency, setLocalTotalLatency] = useState(0);
  const [openiaTotalLatency, setOpeniaTotalLatency] = useState(0);
  const [mode, setMode] = useState<ViewMode>("comparison");
  const [openaiModel, setOpenaiModel] = useState("gpt-4.1-mini");
  const [agent, setAgent] = useState<Agent>("arkas");

  useEffect(() => {
    async function autoConnect() {
      try {
        const res = await fetch("/api/test-ollama", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ baseUrl }),
        });
        const data = await res.json();
        setLocalOnline(data.local === "online");
        setOpeniaOnline(data.openia === "online");
      } catch {
        /* silent */
      }
    }
    autoConnect();
    const interval = setInterval(autoConnect, 30000);
    return () => clearInterval(interval);
  }, [baseUrl]);

  const resetConversation = useCallback(() => {
    setLocalMessages([]);
    setOpeniaMessages([]);
    setTotalMessages(0);
    setLocalTotalLatency(0);
    setOpeniaTotalLatency(0);
    setSessionId("arena-" + Date.now());
  }, []);

  const sendMessage = useCallback(
    async (message: string, imageBase64?: string) => {
      if (loading) return;
      const msgId = Date.now().toString();
      const userMsg: PanelMessage = {
        id: "u-" + msgId,
        role: "user",
        content: message,
        image: imageBase64,
      };

      if (mode !== "openia") setLocalMessages((p) => [...p, userMsg]);
      if (mode !== "cebi") setOpeniaMessages((p) => [...p, userMsg]);
      setLoading(true);

      try {
        const res = await fetch("/api/arena", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            image: imageBase64 || null,
            localUrl: mode !== "openia" && localOnline ? baseUrl : null,
            openiaUrl: mode !== "cebi" && openiaOnline ? baseUrl.replace(":8002", ":8003") : null,
            sessionId,
            openaiModel,
            agent,
          }),
        });
        const data = await res.json();

        if (data.local && mode !== "openia") {
          setLocalMessages((p) => [
            ...p,
            {
              id: "l-" + msgId,
              role: "assistant",
              content: data.local.error ? "" : data.local.content,
              metrics: data.local,
            },
          ]);
          if (!data.local.error) setLocalTotalLatency((p) => p + data.local.latency_ms);
        }

        if (data.openia && mode !== "cebi") {
          setOpeniaMessages((p) => [
            ...p,
            {
              id: "o-" + msgId,
              role: "assistant",
              content: data.openia.error ? "" : data.openia.content,
              metrics: data.openia,
            },
          ]);
          if (!data.openia.error) setOpeniaTotalLatency((p) => p + data.openia.latency_ms);
        }

        setTotalMessages((p) => p + 1);
      } catch (err) {
        const errMsg: PanelMessage = {
          id: "e-" + msgId,
          role: "assistant",
          content: "",
          metrics: {
            content: "",
            model: "",
            latency_ms: 0,
            tokens_prompt: 0,
            tokens_completion: 0,
            tokens_total: 0,
            cost_usd: 0,
            error: err instanceof Error ? err.message : "Erro",
          },
        };
        if (mode !== "openia") setLocalMessages((p) => [...p, errMsg]);
        if (mode !== "cebi") setOpeniaMessages((p) => [...p, errMsg]);
      }
      setLoading(false);
    },
    [loading, baseUrl, localOnline, openiaOnline, sessionId, mode, openaiModel, agent]
  );

  const agentLabels: Record<Agent, string> = {
    arkas: "Agência Arkas",
    os: "Gerenciador OS",
    rag: "Base Conhecimento",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header */}
      <div className="arena-header">
        <div className="logo-group">
          <div className="logo-mark">CA</div>
          <div className="logo-text">
            <h1>CEBI Arena</h1>
            <p>Comparativo de Inteligência Artificial</p>
          </div>
        </div>
        <div className="header-right">
          <button className="reset-btn" onClick={resetConversation}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2.5 2.5v4h4" />
              <path d="M2.8 6.5A5.5 5.5 0 1 1 3 10" />
            </svg>
            Nova conversa
          </button>
          <div className="header-status">
            <div className={"status-pill " + (localOnline ? "online-green" : "offline")}>
              <div className="dot" /> Local {localOnline ? "✓" : "—"}
            </div>
            <div className={"status-pill " + (openiaOnline ? "online-violet" : "offline")}>
              <div className="dot" /> OpenIA {openiaOnline ? "✓" : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar
        mode={mode}
        setMode={setMode}
        openaiModel={openaiModel}
        setOpenaiModel={setOpenaiModel}
        agent={agent}
        setAgent={setAgent}
      />

      {/* Arena */}
      <div className="arena-container">
        {mode !== "openia" && (
          <ChatPanel
            title="IA CEBI"
            subtitle={"Qwen3 8B · " + agentLabels[agent]}
            color="green"
            icon="/cebi.png"
            messages={localMessages}
            loading={loading && localOnline}
            offline={!localOnline}
            offlineMessage="Backend local offline"
          />
        )}
        {mode === "comparison" && <div className="arena-divider" />}
        {mode !== "cebi" && (
          <ChatPanel
            title="OpenAI"
            subtitle={openaiModel + " · " + agentLabels[agent]}
            color="violet"
            icon="/openIA.png"
            messages={openiaMessages}
            loading={loading && openiaOnline}
            offline={!openiaOnline}
            offlineMessage="Backend OpenIA offline"
          />
        )}
      </div>

      <MetricsBar
        totalMessages={totalMessages}
        localLatency={localTotalLatency}
        openiaLatency={openiaTotalLatency}
      />
      <MessageInput onSend={sendMessage} disabled={loading} />
    </div>
  );
}
