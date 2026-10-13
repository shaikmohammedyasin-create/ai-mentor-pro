/**
 * POST /api/chat — streaming chat completion (SSE) using z-ai-web-dev-sdk.
 *
 * Body: { chatId?: string, mentor: string, message: string, history: {role, content}[] }
 * Response: text/event-stream
 */
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getGroqClient, buildMessages, streamChat } from "@/lib/ai";
import { getPersonality } from "@/lib/personalities";
import { trackEvent, estimateTokens } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGE_LENGTH = 12000;
const MAX_HISTORY = 20;

export async function POST(req: NextRequest) {
  const startedAt = Date.now();

  let body: {
    chatId?: string;
    mentor?: string;
    message?: string;
    history?: { role: "user" | "assistant"; content: string }[];
  };

  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const mentorKey = body.mentor ?? "general";
  const personality = getPersonality(mentorKey);
  const userMessage = (body.message ?? "").trim();
  const history = Array.isArray(body.history) ? body.history.slice(-MAX_HISTORY) : [];

  if (!userMessage) {
    return new Response(JSON.stringify({ error: "Message is required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  if (userMessage.length > MAX_MESSAGE_LENGTH) {
    return new Response(
      JSON.stringify({ error: `Message too long (max ${MAX_MESSAGE_LENGTH} chars)` }),
      { status: 413, headers: { "content-type": "application/json" } }
    );
  }

  // Resolve or create chat + persist the user message BEFORE streaming.
  let chatId = body.chatId ?? null;
  let userMessageId: string | null = null;
  try {
    if (chatId) {
      const existing = await db.chat.findUnique({ where: { id: chatId } });
      if (!existing) {
        chatId = null;
      } else if (existing.mentor !== mentorKey) {
        await db.chat.update({ where: { id: existing.id }, data: { mentor: mentorKey } });
      }
    }

    if (!chatId) {
      const title =
        userMessage.slice(0, 60) + (userMessage.length > 60 ? "…" : "");
      const chat = await db.chat.create({ data: { title, mentor: mentorKey } });
      chatId = chat.id;
    }

    const userMsg = await db.message.create({
      data: {
        chatId,
        role: "user",
        content: userMessage,
        tokens: estimateTokens(userMessage),
      },
    });
    userMessageId = userMsg.id;

    await db.chat.update({ where: { id: chatId }, data: { updatedAt: new Date() } });
  } catch (e) {
    console.error("[/api/chat] db error:", e);
    return new Response(
      JSON.stringify({ error: "Failed to initialize chat" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  const messages = buildMessages(personality.systemPrompt, history, userMessage);

  const encoder = new TextEncoder();
  let assistantContent = "";
  const finalChatId = chatId!;
  const finalUserMessageId = userMessageId!;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };

      send({ chatId: finalChatId, userMessageId: finalUserMessageId, mentor: mentorKey });

      let clientReady = false;
      try {
        getGroqClient();
        clientReady = true;
      } catch (err) {
        send({ error: "AI service unavailable" });
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
        console.error("[/api/chat] AI init failed:", err);
        return;
      }

      try {
        for await (const chunk of streamChat(messages)) {
          assistantContent += chunk;
          send({ delta: chunk });
        }
      } catch (err) {
        console.error("[/api/chat] stream read error:", err);
        if (!assistantContent) {
          send({ error: "Stream interrupted. Please try again." });
        }
      }

      let assistantMessageId: string | null = null;
      try {
        const assistantMsg = await db.message.create({
          data: {
            chatId: finalChatId,
            role: "assistant",
            content: assistantContent || "*(empty response)*",
            mentor: mentorKey,
            tokens: estimateTokens(assistantContent),
          },
        });
        assistantMessageId = assistantMsg.id;
        await db.chat.update({ where: { id: finalChatId }, data: { updatedAt: new Date() } });
      } catch (e) {
        console.error("[/api/chat] persist assistant failed:", e);
      }

      const responseMs = Date.now() - startedAt;
      await trackEvent({
        event: "message_sent",
        mentor: mentorKey,
        tokensUsed: estimateTokens(userMessage) + estimateTokens(assistantContent),
        responseMs,
        metadata: { chatId: finalChatId },
      });

      send({
        done: true,
        chatId: finalChatId,
        assistantMessageId,
        tokens: estimateTokens(assistantContent),
      });
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  });
}
