"use client";

/**
 * Mentor picker — lets the user switch AI personality.
 * Used as a popover from the chat header and the sidebar.
 */
import * as React from "react";
import * as Icons from "lucide-react";
import { Check, ChevronDown, Sparkles } from "lucide-react";
import { PERSONALITIES, getPersonality } from "@/lib/personalities";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function MentorPicker({
  value,
  onChange,
  compact = false,
}: {
  value: string;
  onChange: (key: string) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const current = getPersonality(value);
  const Icon = (Icons as any)[current.icon] ?? Sparkles;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "group inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-sm font-medium transition hover:border-primary/50 hover:bg-card",
            compact && "px-2.5 py-1"
          )}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span className="max-w-[140px] truncate">{current.name}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition group-hover:translate-y-0.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[340px] max-h-[420px] overflow-y-auto p-2"
      >
        <div className="px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Choose your AI mentor
        </div>
        <div className="grid gap-1">
          {PERSONALITIES.map((p) => {
            const PIcon = (Icons as any)[p.icon] ?? Sparkles;
            const active = p.key === value;
            return (
              <button
                key={p.key}
                onClick={() => {
                  onChange(p.key);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-start gap-3 rounded-lg p-2.5 text-left transition hover:bg-accent",
                  active && "bg-accent"
                )}
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <PIcon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-medium">{p.name}</span>
                    {active && <Check className="h-3.5 w-3.5 text-primary" />}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {p.tagline}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
