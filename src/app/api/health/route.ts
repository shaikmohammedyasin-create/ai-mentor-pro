/**
 * /api/health — system health check for the admin panel.
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  let dbOk = false;
  let dbLatencyMs = 0;
  try {
    const t0 = Date.now();
    await db.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - t0;
    dbOk = true;
  } catch (e) {
    console.error("[/api/health] db check failed", e);
  }

  return NextResponse.json({
    status: dbOk ? "ok" : "degraded",
    uptime: Math.round(process.uptime()),
    db: { ok: dbOk, latencyMs: dbLatencyMs },
    memory: process.memoryUsage().rss,
    responseMs: Date.now() - startedAt,
    timestamp: new Date().toISOString(),
  });
}
