"use client";

interface Props {
  totalMessages: number;
  localLatency: number;
  openiaLatency: number;
}

export default function MetricsBar({ totalMessages, localLatency, openiaLatency }: Props) {
  if (totalMessages === 0) return null;
  const avgL = localLatency / totalMessages;
  const avgO = openiaLatency / totalMessages;
  const diff = avgL - avgO;

  return (
    <div className="metrics-bar">
      <div className="stat">
        <strong>{totalMessages}</strong> mensage{totalMessages !== 1 ? "ns" : "m"}
      </div>
      <div className="divider" />
      <div className="stat">
        Latência média:&nbsp;
        <span className="latency-green">{(avgL / 1000).toFixed(1)}s</span>
        &nbsp;<span style={{ color: "var(--text-muted)" }}>vs</span>&nbsp;
        <span className="latency-violet">{(avgO / 1000).toFixed(1)}s</span>
        &nbsp;
        <span className={"diff-badge " + (diff > 0 ? "slower" : "faster")}>
          {diff > 0 ? "+" : ""}{(diff / 1000).toFixed(1)}s
        </span>
      </div>
    </div>
  );
}
