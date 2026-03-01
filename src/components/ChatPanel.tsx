"use client";

import { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import type { ProviderResult } from "@/lib/types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
  metrics?: ProviderResult;
}

interface ChatPanelProps {
  title: string;
  subtitle: string;
  color: "green" | "violet";
  icon: string;
  messages: ChatMessage[];
  loading: boolean;
  offline?: boolean;
  offlineMessage?: string;
}

export default function ChatPanel({ title, subtitle, color, icon, messages, loading, offline = false, offlineMessage }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isImageIcon = icon.startsWith("/");

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  return (
    <div className={"panel " + color}>
      <div className="panel-header">
        {isImageIcon ? (
          <img src={icon} alt="" style={{ height: 56, width: "auto", objectFit: "contain", borderRadius: 0, display: "block" }} />
        ) : (
          <>
            <div className="panel-icon">{icon}</div>
            <div>
              <div className="panel-title">{title}</div>
              <div className="panel-subtitle">{subtitle}</div>
            </div>
          </>
        )}
      </div>
      <div className="panel-divider" />
      <div ref={scrollRef} className="panel-messages">
        {offline && messages.length === 0 ? (
          <div className="panel-empty">
            <div className="icon">🔌</div>
            <p>{offlineMessage}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="panel-empty">
            <div className="icon">💬</div>
            <p>Envie uma mensagem</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              image={msg.image}
              metrics={msg.metrics}
              color={color}
            />
          ))
        )}
        {loading && <TypingIndicator color={color} />}
      </div>
    </div>
  );
}
