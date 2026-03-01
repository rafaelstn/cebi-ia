"use client";

export default function TypingIndicator({ color = "green" }: { color?: "green" | "violet" }) {
  const dotColor = color === "green" ? "var(--accent-green)" : "var(--accent-violet)";

  return (
    <div className="typing-indicator">
      <div className="typing-dots">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="typing-dot"
            style={{
              backgroundColor: dotColor,
              animationDelay: (i * 0.2) + "s",
            }}
          />
        ))}
      </div>
      <span className="typing-label">Processando...</span>
    </div>
  );
}
