"use client";

/**
 * Chat message bubble — user or assistant, with markdown rendering,
 * copy, and regenerate (assistant only).
 */
import * as React from "react";
import * as Icons from "lucide-react";
import { Check, Copy, RefreshCw, Sparkles, User } from "lucide-react";
import { Markdown } from "./markdown";
import { getPersonality } from "@/lib/personalities";
import { cn } from "@/lib/utils";

export type ChatMessageProps = {
  role: "user" | "assistant" | "system";
  content: string;
  mentor?: string | null;
  streaming?: boolean;
  onRegenerate?: () => void;
  canRegenerate?: boolean;
};

export function ChatMessage({
  role,
  content,
  mentor,
  streaming,
  onRegenerate,
  canRegenerate,
}: ChatMessageProps) {
  const [copied, setCopied] = React.useState(false);
  const isUser = role === "user";
  const personality = mentor ? getPersonality(mentor) : null;
  const AvatarIcon = isUser
    ? User
    : (Icons as any)[personality?.icon ?? "Sparkles"] ?? Sparkles;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className={cn("group flex gap-3 sm:gap-4 px-4 sm:px-6 py-5.5 border-b border-border/30 transition-colors", isUser ? "bg-background" : "bg-muted/15 border-y border-border/20")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-102",
          isUser
            ? "bg-muted border border-border/65 text-foreground/80"
            : "bg-primary text-primary-foreground border-2 border-primary/20 shadow-sm"
        )}
      >
        <AvatarIcon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground/90">
            {isUser ? "You" : personality?.name ?? "AI Mentor"}
          </span>
          {!isUser && mentor && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
              {personality?.tagline}
            </span>
          )}
        </div>

        {isUser ? (
          <div className="whitespace-pre-wrap break-words text-[0.95rem] leading-relaxed text-foreground/85">
            {content}
          </div>
        ) : content ? (
          <Markdown content={content} />
        ) : (
          <div className="flex items-center gap-1.5 py-2 text-muted-foreground">
            <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
          </div>
        )}

        {streaming && content && (
          <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-primary align-middle" />
        )}

        {!isUser && content && !streaming && (
          <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
            <button
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground shadow-sm transition hover:bg-accent hover:text-foreground"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
            {canRegenerate && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground shadow-sm transition hover:bg-accent hover:text-foreground"
              >
                <RefreshCw className="h-3 w-3" />
                Regenerate
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
