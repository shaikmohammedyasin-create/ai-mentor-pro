/**
 * /api/prompts/[id]
 * PATCH  — update title/content/category/favorite
 * DELETE — delete a prompt
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (typeof body.title === "string") data.title = body.title.slice(0, 200);
    if (typeof body.content === "string") data.content = body.content.slice(0, 8000);
    if (typeof body.category === "string") data.category = body.category.slice(0, 50);
    if (typeof body.favorite === "boolean") data.favorite = body.favorite;
    const prompt = await db.prompt.update({ where: { id }, data });
    return NextResponse.json({ prompt });
  } catch (e) {
    console.error("[/api/prompts/[id] PATCH]", e);
    return NextResponse.json({ error: "Failed to update prompt" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    await db.prompt.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[/api/prompts/[id] DELETE]", e);
    return NextResponse.json({ error: "Failed to delete prompt" }, { status: 500 });
  }
}
