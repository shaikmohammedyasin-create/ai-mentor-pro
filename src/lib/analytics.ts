/**
 * Analytics helper - lightweight event tracking stored in the database.
 */
import { db } from "@/lib/db";

export async function trackEvent(params: {
  userId?: string;
  event: string;
  mentor?: string;
  metadata?: Record<string, unknown>;
  tokensUsed?: number;
  responseMs?: number;
}) {
  try {
    await db.analytics.create({
      data: {
        userId: params.userId ?? null,
        event: params.event,
        mentor: params.mentor ?? null,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        tokensUsed: params.tokensUsed ?? 0,
        responseMs: params.responseMs ?? 0,
      },
    });
  } catch (e) {
    // Analytics should never break the main flow
    console.error("[analytics] trackEvent failed:", e);
  }
}

/**
 * Rough token estimate (~4 chars per token).
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
