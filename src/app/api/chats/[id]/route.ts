/**
 * /api/chats/[id]
 * GET    — fetch a chat with its messages
 * PATCH  — update title / mentor / pinned / archived / folderId
 * DELETE — delete a chat and its messages
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const chat = await db.chat.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            role: true,
            content: true,
            mentor: true,
            tokens: true,
            createdAt: true,
          },
        },
      },
    });
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }
    return NextResponse.json({ chat });
  } catch (e) {
    console.error("[/api/chats/[id] GET]", e);
    return NextResponse.json({ error: "Failed to load chat" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (typeof body.title === "string") data.title = body.title.slice(0, 200);
    if (typeof body.mentor === "string") data.mentor = body.mentor;
    if (typeof body.pinned === "boolean") data.pinned = body.pinned;
    if (typeof body.archived === "boolean") data.archived = body.archived;
    if (body.folderId !== undefined) data.folderId = body.folderId ?? null;

    const chat = await db.chat.update({ where: { id }, data });
    return NextResponse.json({ chat });
  } catch (e) {
    console.error("[/api/chats/[id] PATCH]", e);
    return NextResponse.json({ error: "Failed to update chat" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    await db.chat.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[/api/chats/[id] DELETE]", e);
    return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
  }
}
