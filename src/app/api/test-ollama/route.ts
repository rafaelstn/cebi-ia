import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await request.json();
    const localRes = await fetch("http://localhost:8002/health", {
      signal: AbortSignal.timeout(10000),
    }).catch(() => null);

    const openiaRes = await fetch("http://localhost:8003/health", {
      signal: AbortSignal.timeout(10000),
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
