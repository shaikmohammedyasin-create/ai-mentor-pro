/**
 * /api/folders
 * GET  — list folders
 * POST — create a folder
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const folders = await db.folder.findMany({
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { chats: true } } },
    });
    return NextResponse.json({ folders });
  } catch (e) {
    console.error("[/api/folders GET]", e);
    return NextResponse.json({ error: "Failed to load folders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = (body.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    const folder = await db.folder.create({
      data: { name: name.slice(0, 100), color: (body.color ?? "emerald").slice(0, 30) },
    });
    return NextResponse.json({ folder }, { status: 201 });
  } catch (e) {
    console.error("[/api/folders POST]", e);
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}
