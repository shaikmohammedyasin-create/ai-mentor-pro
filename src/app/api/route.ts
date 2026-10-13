import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "AI Mentor Pro API",
    version: "1.0.0",
    status: "ok",
    endpoints: [
      "POST /api/chat",
      "GET|POST /api/chats",
      "GET|PATCH|DELETE /api/chats/[id]",
      "GET|POST /api/prompts",
      "PATCH|DELETE /api/prompts/[id]",
      "GET|POST /api/folders",
      "POST /api/resume",
      "GET /api/analytics",
      "GET /api/health",
    ],
  });
}
