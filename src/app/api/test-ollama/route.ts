import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { baseUrl } = await request.json();
    if (!baseUrl) return NextResponse.json({ status: "error", detail: "URL vazia" });

    const url = baseUrl.replace(/\/+$/, "");
    const localRes = await fetch(url + "/health", {
      signal: AbortSignal.timeout(10000),
      headers: { "ngrok-skip-browser-warning": "true" },
    }).catch(() => null);

    const openiaUrl = url.replace(":8002", ":8003");
    const openiaRes = await fetch(openiaUrl + "/health", {
      signal: AbortSignal.timeout(10000),
      headers: { "ngrok-skip-browser-warning": "true" },
    }).catch(() => null);

    return NextResponse.json({
      status: localRes?.ok || openiaRes?.ok ? "ok" : "error",
      local: localRes?.ok ? "online" : "offline",
      openia: openiaRes?.ok ? "online" : "offline",
    });
  } catch (err) {
    return NextResponse.json({
      status: "error",
      detail: err instanceof Error ? err.message : "Erro",
    });
  }
}