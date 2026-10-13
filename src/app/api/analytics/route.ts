/**
 * /api/analytics — usage stats for the dashboard.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalChats, totalMessages, dayMessages, weekMessages, monthMessages, totalTokens, byMentorAgg] =
      await Promise.all([
        db.chat.count(),
        db.message.count(),
        db.message.count({ where: { createdAt: { gte: dayAgo } } }),
        db.message.count({ where: { createdAt: { gte: weekAgo } } }),
        db.message.count({ where: { createdAt: { gte: monthAgo } } }),
        db.message.aggregate({ _sum: { tokens: true } }),
        db.message.groupBy({
          by: ["mentor"],
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
          take: 10,
        }),
      ]);

    // Recent activity (last 14 days message counts)
    const recentEvents = await db.analytics.findMany({
      where: {
        event: "message_sent",
        createdAt: { gte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) },
      },
      select: { createdAt: true, tokensUsed: true, responseMs: true, mentor: true },
    });

    // Build per-day buckets
    const dayMap = new Map<string, { count: number; tokens: number; avgMs: number; msCount: number }>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      dayMap.set(key, { count: 0, tokens: 0, avgMs: 0, msCount: 0 });
    }
    for (const ev of recentEvents) {
      const key = new Date(ev.createdAt).toISOString().slice(0, 10);
      const bucket = dayMap.get(key);
      if (!bucket) continue;
      bucket.count += 1;
      bucket.tokens += ev.tokensUsed;
      if (ev.responseMs > 0) {
        bucket.avgMs = (bucket.avgMs * bucket.msCount + ev.responseMs) / (bucket.msCount + 1);
        bucket.msCount += 1;
      }
    }
    const daily = Array.from(dayMap.entries()).map(([date, v]) => ({
      date,
      count: v.count,
      tokens: v.tokens,
      avgResponseMs: Math.round(v.avgMs),
    }));

    const avgResponseMs =
      recentEvents.length > 0
        ? Math.round(
            recentEvents.reduce((acc, e) => acc + (e.responseMs || 0), 0) /
              recentEvents.filter((e) => e.responseMs > 0).length || 1
          )
        : 0;

    const mentorBreakdown = byMentorAgg.map((m) => ({
      mentor: m.mentor,
      count: m._count.id,
    }));

    return NextResponse.json({
      totals: {
        chats: totalChats,
        messages: totalMessages,
        tokens: totalTokens._sum.tokens ?? 0,
      },
      active: {
        today: dayMessages,
        thisWeek: weekMessages,
        thisMonth: monthMessages,
      },
      avgResponseMs,
      daily,
      mentorBreakdown,
    });
  } catch (e) {
    console.error("[/api/analytics GET]", e);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
