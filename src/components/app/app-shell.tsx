"use client";

/**
 * AppShell — the main authenticated-style layout.
 * Left nav rail + main content area that switches between panels.
 */
import * as React from "react";
import {
  Sparkles,
  MessageSquare,
  FileText,
  BookMarked,
  Settings,
  BarChart3,
  Sun,
  Moon,
  Home,
  Menu,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChatView } from "./chat-view";
import { ResumeTool } from "./resume-tool";
import { PromptsView } from "./prompts-view";
import { SettingsView } from "./settings-view";
import { AnalyticsView } from "./analytics-view";

type Panel = "chat" | "resume" | "prompts" | "settings" | "analytics";

const NAV: { key: Panel; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "chat", label: "Chat", icon: MessageSquare },
  { key: "resume", label: "Resume Review", icon: FileText },
  { key: "prompts", label: "Prompt Library", icon: BookMarked },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "settings", label: "Settings", icon: Settings },
];

export function AppShell() {
  const { exitApp, activePanel, setActivePanel } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const panel = activePanel as Panel;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
        <SidebarContent
          active={panel}
          onSelect={(p) => setActivePanel(p)}
          onExit={exitApp}
          theme={mounted ? theme : undefined}
          toggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        />
      </aside>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setMobileNavOpen(false)}
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-sidebar md:hidden"
            >
              <SidebarContent
                active={panel}
                onSelect={(p) => {
                  setActivePanel(p);
                  setMobileNavOpen(false);
                }}
                onExit={exitApp}
                theme={mounted ? theme : undefined}
                toggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
                onClose={() => setMobileNavOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center gap-2 border-b border-border bg-card/70 px-3 py-2.5 backdrop-blur md:hidden">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-semibold">AI Mentor Pro</span>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-hidden">
          {panel === "chat" && <ChatView />}
          {panel === "resume" && (
            <div className="h-full overflow-y-auto">
              <ResumeTool />
            </div>
          )}
          {panel === "prompts" && (
            <div className="h-full overflow-y-auto">
              <PromptsView />
            </div>
          )}
          {panel === "analytics" && (
            <div className="h-full overflow-y-auto">
              <AnalyticsView />
            </div>
          )}
          {panel === "settings" && (
            <div className="h-full overflow-y-auto">
              <SettingsView />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  active,
  onSelect,
  onExit,
  theme,
  toggleTheme,
  onClose,
}: {
  active: Panel;
  onSelect: (p: Panel) => void;
  onExit: () => void;
  theme?: string;
  toggleTheme: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center justify-between border-b border-sidebar-border p-4">
        <button
          onClick={onExit}
          className="flex items-center gap-2.5 text-left"
          title="Back to home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm">
            <Sparkles className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold leading-tight">AI Mentor Pro</span>
            <span className="block text-[10px] text-muted-foreground">Your AI mentor</span>
          </span>
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <div className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Workspace
        </div>
        {NAV.map((item) => {
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 relative group/nav",
                isActive
                  ? "bg-primary/10 text-primary border-l-2 border-primary pl-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground hover:translate-x-0.5"
              )}
            >
              <item.icon className={cn("h-4 w-4 transition-transform group-hover/nav:scale-105", isActive ? "text-primary" : "text-sidebar-foreground/70")} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        <button
          onClick={onExit}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <Home className="h-4 w-4" />
          Back to home
        </button>
        <div className="mt-2 px-3 py-1.5 text-[10px] text-muted-foreground">
          v1.0.0 · IBM × Bharat Cares
        </div>
      </div>
    </div>
  );
}
