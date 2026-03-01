"use client";

type ViewMode = "cebi" | "comparison" | "openia";
type Agent = "arkas" | "os" | "rag";

const MODELS: Record<string, string> = {
  "gpt-4.1-mini": "$0.40 / $1.60 por 1M tok",
  "gpt-4o-mini": "$0.15 / $0.60 por 1M tok",
  "gpt-3.5-turbo": "$0.50 / $1.50 por 1M tok",
};

const AGENTS: { id: Agent; emoji: string; label: string }[] = [
  { id: "arkas", emoji: "🏢", label: "Arkas" },
  { id: "os", emoji: "🔧", label: "OS-Agent" },
  { id: "rag", emoji: "📚", label: "RAG" },
];

interface ToolbarProps {
  mode: ViewMode;
  setMode: (m: ViewMode) => void;
  openaiModel: string;
  setOpenaiModel: (m: string) => void;
  agent: Agent;
  setAgent: (a: Agent) => void;
}

export default function Toolbar({ mode, setMode, openaiModel, setOpenaiModel, agent, setAgent }: ToolbarProps) {
  const modeBtnClass = (m: ViewMode) => {
    if (mode !== m) return "mode-btn";
    if (m === "cebi") return "mode-btn active-green";
    if (m === "openia") return "mode-btn active-violet";
    return "mode-btn active-both";
  };

  return (
    <div className="arena-toolbar">
      <div className="toolbar-left">
        {/* Agent selector */}
        <div className="agent-group">
          {AGENTS.map((a) => (
            <button
              key={a.id}
              className={"agent-btn" + (agent === a.id ? " active" : "")}
              onClick={() => setAgent(a.id)}
            >
              <span className="emoji">{a.emoji}</span> {a.label}
            </button>
          ))}
        </div>

        <div className="toolbar-sep" />

        {/* Mode selector */}
        <div className="mode-group">
          <button className={modeBtnClass("cebi")} onClick={() => setMode("cebi")}>IA CEBI</button>
          <button className={modeBtnClass("comparison")} onClick={() => setMode("comparison")}>COMPARAÇÃO</button>
          <button className={modeBtnClass("openia")} onClick={() => setMode("openia")}>OPENIA</button>
        </div>
      </div>

      <div className="toolbar-right">
        <span className="model-selector-label">Modelo OpenAI</span>
        <select className="model-select" value={openaiModel} onChange={(e) => setOpenaiModel(e.target.value)}>
          {Object.keys(MODELS).map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <span className="model-price">{MODELS[openaiModel]}</span>
      </div>
    </div>
  );
}
