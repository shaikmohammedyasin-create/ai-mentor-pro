"use client";

/**
 * ChatView — the main ChatGPT-style chat interface.
 * Handles SSE streaming, message persistence, regenerate, stop, and new chat.
 */
import * as React from "react";
import { Plus, MessageSquare, Sparkles, Trash2, Pencil, Pin, PinOff, MoreHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import { useAppStore, type Message, type ChatSummary } from "@/lib/store";
import { getPersonality, PERSONALITIES } from "@/lib/personalities";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { MentorPicker } from "./mentor-picker";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const LOCAL_KEY = "aimp:activeChatId";

export function ChatView() {
  const {
    activeChatId,
    setActiveChatId,
    messages,
    setMessages,
    appendMessage,
    updateLastAssistant,
    chats,
    upsertChat,
    removeChat,
    activeMentor,
    setActiveMentor,
    isStreaming,
    setIsStreaming,
  } = useAppStore();

  const abortRef = React.useRef<AbortController | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null);
  const [renamingId, setRenamingId] = React.useState<string | null>(null);
  const [renameValue, setRenameValue] = React.useState("");
  const [showHistory, setShowHistory] = React.useState(false);

  // Prevents the message-reload effect from wiping an in-progress stream.
  // Set to the chatId we are currently streaming into.
  const streamingChatIdRef = React.useRef<string | null>(null);

  const personality = getPersonality(activeMentor);

  // Load chat list on mount
  const loadChats = React.useCallback(async () => {
    try {
      const res = await fetch("/api/chats");
      if (!res.ok) return;
      const data = await res.json();
      const list: ChatSummary[] = (data.chats ?? []).map((c: any) => ({
        id: c.id,
        title: c.title,
        mentor: c.mentor,
        pinned: c.pinned,
        updatedAt: c.updatedAt,
        folderId: c.folderId,
      }));
      useAppStore.getState().setChats(list);
    } catch {
      /* ignore */
    }
  }, []);

  React.useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Load messages when the user explicitly selects a chat.
  // Skipped while we are streaming into the same chat to avoid wiping the
  // in-progress assistant bubble.
  React.useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }
    if (streamingChatIdRef.current === activeChatId) {
      // We're streaming into this chat; do not reload from DB.
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/chats/${activeChatId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const msgs: Message[] = (data.chat?.messages ?? []).map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          mentor: m.mentor,
          createdAt: m.createdAt,
        }));
        setMessages(msgs);
        if (data.chat?.mentor) setActiveMentor(data.chat.mentor);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeChatId]);

  // Auto-scroll to bottom on new messages / streaming
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isStreaming]);

  const startNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
  };

  const sendMessage = async (text: string) => {
    if (isStreaming) return;

    // Optimistic user message
    const userMsg: Message = {
      id: `local-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    const assistantMsg: Message = {
      id: `local-assistant-${Date.now()}`,
      role: "assistant",
      content: "",
      mentor: activeMentor,
      createdAt: new Date().toISOString(),
    };

    // Build history from current messages (excluding local ids, only real content)
    const history = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    appendMessage(userMsg);
    appendMessage(assistantMsg);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;
    // Mark the chat we're streaming into so the reload effect skips it.
    // If this is a new chat, activeChatId is null until the server assigns one;
    // we set the ref as soon as we receive it from the stream.

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chatId: activeChatId,
          mentor: activeMentor,
          message: text,
          history,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Request failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";
      let resolvedChatId = activeChatId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const obj = JSON.parse(payload);
            if (obj.error) {
              toast.error(obj.error);
              continue;
            }
            if (obj.chatId && !resolvedChatId) {
              resolvedChatId = obj.chatId;
              streamingChatIdRef.current = obj.chatId;
              setActiveChatId(obj.chatId);
            }
            if (typeof obj.delta === "string") {
              acc += obj.delta;
              updateLastAssistant(acc);
            }
            if (obj.done) {
              if (obj.chatId) {
                setActiveChatId(obj.chatId);
                // Refresh chat list to reflect new/updated chat
                loadChats();
              }
              if (!acc) updateLastAssistant("*(No response received)*");
            }
          } catch {
            /* ignore parse */
          }
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        toast.info("Generation stopped");
      } else {
        console.error(err);
        toast.error(err.message || "Failed to send message");
        // If assistant content is empty, mark as error
        const msgs = useAppStore.getState().messages;
        const last = msgs[msgs.length - 1];
        if (last && last.role === "assistant" && !last.content) {
          updateLastAssistant("*(Something went wrong. Please try again.)*");
        }
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
      streamingChatIdRef.current = null;
      loadChats();
    }
  };

  const stopGeneration = () => {
    abortRef.current?.abort();
  };

  const regenerate = () => {
    // Find last user message, remove last assistant message, resend
    const msgs = useAppStore.getState().messages;
    let lastUserIdx = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === "user") {
        lastUserIdx = i;
        break;
      }
    }
    if (lastUserIdx === -1) return;
    const lastUserText = msgs[lastUserIdx].content;
    // Truncate messages up to (but not including) the last user message
    const kept = msgs.slice(0, lastUserIdx);
    setMessages(kept);
    // Small delay so state settles, then resend
    setTimeout(() => sendMessage(lastUserText), 0);
  };

  const togglePin = async (chat: ChatSummary) => {
    try {
      await fetch(`/api/chats/${chat.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pinned: !chat.pinned }),
      });
      upsertChat({ ...chat, pinned: !chat.pinned });
    } catch {
      toast.error("Failed to update chat");
    }
  };

  const deleteChat = async (id: string) => {
    try {
      await fetch(`/api/chats/${id}`, { method: "DELETE" });
      removeChat(id);
      if (activeChatId === id) startNewChat();
      toast.success("Conversation deleted");
    } catch {
      toast.error("Failed to delete chat");
    }
  };

  const commitRename = async (id: string) => {
    const title = renameValue.trim();
    setRenamingId(null);
    if (!title) return;
    try {
      await fetch(`/api/chats/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const chat = chats.find((c) => c.id === id);
      if (chat) upsertChat({ ...chat, title });
    } catch {
      toast.error("Failed to rename chat");
    }
  };

  const lastAssistantIsStreaming =
    isStreaming && messages.length > 0 && messages[messages.length - 1].role === "assistant";

  return (
    <div className="flex h-full">
      {/* Chat history rail (toggleable on mobile) */}
      <ChatHistoryRail
        open={showHistory}
        onClose={() => setShowHistory(false)}
        activeChatId={activeChatId}
        onSelect={(id) => {
          setActiveChatId(id);
          setShowHistory(false);
        }}
        onNew={startNewChat}
        onPin={togglePin}
        onDelete={(id) => setConfirmDelete(id)}
        onRename={(chat) => {
          setRenamingId(chat.id);
          setRenameValue(chat.title);
        }}
        renamingId={renamingId}
        setRenamingId={setRenamingId}
        renameValue={renameValue}
        setRenameValue={setRenameValue}
        commitRename={commitRename}
      />

      <div className="flex min-w-0 flex-1 flex-col relative h-full">
        {/* Header */}
        <header className="flex items-center gap-2 border-b border-border bg-card/60 px-3 py-2.5 backdrop-blur sm:px-4 z-10">
          <button
            onClick={() => setShowHistory(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent md:hidden"
            aria-label="Show conversations"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
          <MentorPicker value={activeMentor} onChange={setActiveMentor} />
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={startNewChat}
              className="gap-1.5"
              title="New conversation"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New</span>
            </Button>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto relative h-full">
          {messages.length === 0 ? (
            <EmptyState
              mentorKey={activeMentor}
              onPick={(text) => sendMessage(text)}
            />
          ) : (
            <div className="mx-auto max-w-3xl pb-36">
              {messages.map((m, i) => (
                <ChatMessage
                  key={m.id}
                  role={m.role}
                  content={m.content}
                  mentor={m.mentor}
                  streaming={
                    lastAssistantIsStreaming &&
                    i === messages.length - 1 &&
                    m.role === "assistant"
                  }
                  onRegenerate={regenerate}
                  canRegenerate={
                    !isStreaming &&
                    i === messages.length - 1 &&
                    m.role === "assistant"
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Floating Input */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent px-4 pb-6 pt-10 z-20 pointer-events-none w-full">
          <div className="mx-auto max-w-3xl pointer-events-auto">
            <ChatInput
              onSend={sendMessage}
              onStop={stopGeneration}
              isStreaming={isStreaming}
              autoFocus
              placeholder={`Message ${personality.name}…`}
            />
            <p className="mt-2 text-center text-[10px] font-semibold text-muted-foreground/80 leading-normal">
              AI Mentor Pro can make mistakes. Verify important information. Press Enter to send, Shift+Enter for newline.
            </p>
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the conversation and all its messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmDelete) deleteChat(confirmDelete);
                setConfirmDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EmptyState({
  mentorKey,
  onPick,
}: {
  mentorKey: string;
  onPick: (text: string) => void;
}) {
  const p = getPersonality(mentorKey);
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-16 text-center animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-sm shadow-primary/5 transition-transform hover:scale-105 duration-200">
        <Sparkles className="h-8 w-8 animate-pulse" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
        Chat with <span className="text-gradient">{p.name}</span>
      </h2>
      <p className="mt-2.5 max-w-md text-sm text-muted-foreground leading-relaxed">{p.description}</p>
      <div className="mt-8 grid w-full max-w-xl gap-3 sm:grid-cols-2">
        {p.starters.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="group rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-4 text-left text-sm transition-all duration-200 hover:border-primary/30 hover:bg-accent/40 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5 active:scale-98 flex flex-col justify-between min-h-[100px]"
          >
            <span className="line-clamp-2 text-foreground/80 group-hover:text-foreground font-medium transition-colors">{s}</span>
            <span className="mt-2 flex items-center gap-1 text-xs font-semibold text-primary opacity-0 translate-x-[-4px] transition-all group-hover:opacity-100 group-hover:translate-x-0">
              Send message <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatHistoryRail({
  open,
  onClose,
  activeChatId,
  onSelect,
  onNew,
  onPin,
  onDelete,
  onRename,
  renamingId,
  setRenamingId,
  renameValue,
  setRenameValue,
  commitRename,
}: {
  open: boolean;
  onClose: () => void;
  activeChatId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onPin: (chat: ChatSummary) => void;
  onDelete: (id: string) => void;
  onRename: (chat: ChatSummary) => void;
  renamingId: string | null;
  setRenamingId: (id: string | null) => void;
  renameValue: string;
  setRenameValue: (v: string) => void;
  commitRename: (id: string) => void;
}) {
  const chats = useAppStore((s) => s.chats);
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!query.trim()) return chats;
    const q = query.toLowerCase();
    return chats.filter((c) => c.title.toLowerCase().includes(q));
  }, [chats, query]);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-sidebar transition-transform md:static md:z-auto md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-sidebar-border p-3">
          <span className="text-sm font-semibold">Conversations</span>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3">
          <Button onClick={onNew} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            New conversation
          </Button>
        </div>

        <div className="px-3 pb-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations…"
            className="h-9 bg-background"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {filtered.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-muted-foreground">
              {query ? "No matching conversations" : "No conversations yet. Start a new one!"}
            </div>
          ) : (
            <ul className="space-y-0.5">
              {filtered.map((c) => {
                const p = getPersonality(c.mentor);
                const active = c.id === activeChatId;
                return (
                  <li key={c.id}>
                    <div
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all duration-200 cursor-pointer",
                        active 
                          ? "bg-primary/10 text-primary border-l-2 border-primary pl-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] font-semibold" 
                          : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:translate-x-0.5"
                      )}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/25 text-primary shadow-sm">
                        <Sparkles className="h-3 w-3" />
                      </span>
                      {renamingId === c.id ? (
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={() => commitRename(c.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitRename(c.id);
                            if (e.key === "Escape") setRenamingId(null);
                          }}
                          className="min-w-0 flex-1 rounded border border-primary bg-background px-1 py-0.5 text-sm outline-none"
                        />
                      ) : (
                        <button
                          onClick={() => onSelect(c.id)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <span className="block truncate">{c.title}</span>
                          <span className="block truncate text-[10px] text-muted-foreground">
                            {p.name}
                          </span>
                        </button>
                      )}
                      {c.pinned && (
                        <Pin className="h-3 w-3 shrink-0 text-primary" />
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground opacity-0 transition hover:bg-background group-hover:opacity-100"
                            aria-label="Chat options"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => onPin(c)}>
                            {c.pinned ? <PinOff className="mr-2 h-3.5 w-3.5" /> : <Pin className="mr-2 h-3.5 w-3.5" />}
                            {c.pinned ? "Unpin" : "Pin"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onRename(c)}>
                            <Pencil className="mr-2 h-3.5 w-3.5" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onDelete(c.id)}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-sidebar-border p-3">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {chats.length} conversation{chats.length === 1 ? "" : "s"}
          </div>
        </div>
      </aside>
    </>
  );
}
