/**
 * /api/chats
 * GET  — list chats (optionally filter by folderId, pinned, archived, q=search)
 * POST — create a chat { title?, mentor? }
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPersonality } from "@/lib/personalities";
import { trackEvent } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim();
    const pinned = url.searchParams.get("pinned") === "1";
    const archived = url.searchParams.get("archived") === "1";

    const where: Record<string, unknown> = { archived };
    if (pinned) where.pinned = true;
    if (q) {
      where.title = { contains: q };
    }

    const chats = await db.chat.findMany({
      where,
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
      take: 100,
      select: {
        id: true,
        title: true,
        mentor: true,
        pinned: true,
        archived: true,
        folderId: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ chats });
  } catch (e) {
    console.error("[/api/chats GET]", e);
    return NextResponse.json({ error: "Failed to load chats" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: { title?: string; mentor?: string; folderId?: string | null } = {};
    try {
      body = await req.json();
    } catch {
      /* empty body is fine */
    }

    const mentorKey = body.mentor && getPersonality(body.mentor) ? body.mentor : "general";
    const chat = await db.chat.create({
      data: {
        title: body.title?.trim() || "New conversation",
        mentor: mentorKey,
        folderId: body.folderId ?? null,
      },
    });

    await trackEvent({ event: "chat_created", mentor: mentorKey, metadata: { chatId: chat.id } });

    return NextResponse.json({ chat }, { status: 201 });
  } catch (e) {
    console.error("[/api/chats POST]", e);
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
  }
}
