/**
 * AI Service - Groq API integration
 *
 * Handles chat completions with streaming, retry logic, and error handling.
 */
import Groq from "groq-sdk";

let groqClient: Groq | null = null;

export function getGroqClient(): Groq {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groqClient;
}

export function getModel(): string {
  return process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
}

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export function buildMessages(
  systemPrompt: string,
  history: { role: "user" | "assistant"; content: string }[],
  userMessage: string
): ChatMessage[] {
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
  ];
  const trimmed = history.slice(-20);
  for (const m of trimmed) {
    messages.push({ role: m.role, content: m.content });
  }
  messages.push({ role: "user", content: userMessage });
  return messages;
}

export async function completeChat(
  messages: ChatMessage[],
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  const client = getGroqClient();
  const model = options?.model ?? getModel();
  const maxRetries = 3;
  const baseDelay = 1000;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const completion = await client.chat.completions.create({
        messages,
        model,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 4096,
        stream: false,
      });
      return completion.choices[0]?.message?.content ?? "";
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, baseDelay * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError ?? new Error("Groq API request failed after retries");
}

export async function* streamChat(
  messages: ChatMessage[],
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
): AsyncGenerator<string> {
  const client = getGroqClient();
  const model = options?.model ?? getModel();

  const stream = await client.chat.completions.create({
    messages,
    model,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 4096,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (typeof delta === "string" && delta.length > 0) {
      yield delta;
    }
  }
}
