/**
 * Global app store (client) - view routing, active chat, mentor, theme.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type View = "landing" | "app";

export type ChatSummary = {
  id: string;
  title: string;
  mentor: string;
  pinned: boolean;
  updatedAt: string;
  folderId: string | null;
};

export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  mentor?: string | null;
  createdAt: string;
};

export type Folder = {
  id: string;
  name: string;
  color: string;
};

type AppState = {
  // routing
  view: View;
  enterApp: () => void;
  exitApp: () => void;

  // sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // active tool / panel inside app
  activePanel: "chat" | "resume" | "prompts" | "settings" | "analytics";
  setActivePanel: (p: "chat" | "resume" | "prompts" | "settings" | "analytics") => void;

  // mentor selection (persisted)
  activeMentor: string;
  setActiveMentor: (key: string) => void;

  // chats
  chats: ChatSummary[];
  setChats: (c: ChatSummary[]) => void;
  upsertChat: (c: ChatSummary) => void;
  removeChat: (id: string) => void;

  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;

  messages: Message[];
  setMessages: (m: Message[]) => void;
  appendMessage: (m: Message) => void;
  updateLastAssistant: (content: string) => void;

  folders: Folder[];
  setFolders: (f: Folder[]) => void;

  // streaming control
  isStreaming: boolean;
  setIsStreaming: (v: boolean) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      view: "landing",
      enterApp: () => set({ view: "app" }),
      exitApp: () => set({ view: "landing" }),

      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      activePanel: "chat",
      setActivePanel: (p) => set({ activePanel: p }),

      activeMentor: "general",
      setActiveMentor: (key) => set({ activeMentor: key }),

      chats: [],
      setChats: (c) => set({ chats: c }),
      upsertChat: (c) =>
        set((s) => {
          const exists = s.chats.find((x) => x.id === c.id);
          const next = exists
            ? s.chats.map((x) => (x.id === c.id ? c : x))
            : [c, ...s.chats];
          // pinned first, then by updatedAt desc
          next.sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          });
          return { chats: next };
        }),
      removeChat: (id) =>
        set((s) => ({
          chats: s.chats.filter((c) => c.id !== id),
          activeChatId: s.activeChatId === id ? null : s.activeChatId,
          messages: s.activeChatId === id ? [] : s.messages,
        })),

      activeChatId: null,
      setActiveChatId: (id) => set({ activeChatId: id }),

      messages: [],
      setMessages: (m) => set({ messages: m }),
      appendMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
      updateLastAssistant: (content) =>
        set((s) => {
          const msgs = [...s.messages];
          for (let i = msgs.length - 1; i >= 0; i--) {
            if (msgs[i].role === "assistant") {
              msgs[i] = { ...msgs[i], content };
              break;
            }
          }
          return { messages: msgs };
        }),

      folders: [],
      setFolders: (f) => set({ folders: f }),

      isStreaming: false,
      setIsStreaming: (v) => set({ isStreaming: v }),
    }),
    {
      name: "aimp-store",
      partialize: (s) => ({
        view: s.view,
        activeMentor: s.activeMentor,
        sidebarOpen: s.sidebarOpen,
        activePanel: s.activePanel,
      }),
    }
  )
);
