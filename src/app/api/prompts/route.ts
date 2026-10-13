/**
 * /api/prompts
 * GET  — list prompts (filter by category, favorite, search q)
 * POST — create a prompt
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim();
    const category = url.searchParams.get("category");
    const favorite = url.searchParams.get("favorite");

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (favorite === "1") where.favorite = true;
    if (q) where.title = { contains: q };

    const prompts = await db.prompt.findMany({
      where,
      orderBy: [{ favorite: "desc" }, { updatedAt: "desc" }],
      take: 200,
    });
    return NextResponse.json({ prompts });
  } catch (e) {
    console.error("[/api/prompts GET]", e);
    return NextResponse.json({ error: "Failed to load prompts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title = (body.title ?? "").trim();
    const content = (body.content ?? "").trim();
    if (!title || !content) {
      return NextResponse.json({ error: "title and content are required" }, { status: 400 });
    }
    const prompt = await db.prompt.create({
      data: {
        title: title.slice(0, 200),
        content: content.slice(0, 8000),
        category: (body.category ?? "general").slice(0, 50),
        favorite: !!body.favorite,
      },
    });
    return NextResponse.json({ prompt }, { status: 201 });
  } catch (e) {
    console.error("[/api/prompts POST]", e);
    return NextResponse.json({ error: "Failed to create prompt" }, { status: 500 });
  }
}
