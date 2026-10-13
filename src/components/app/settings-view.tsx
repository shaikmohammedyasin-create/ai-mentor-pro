"use client";

/**
 * SettingsView — profile, appearance, AI memory, data management.
 */
import * as React from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  User,
  Palette,
  Brain,
  Database,
  Sun,
  Moon,
  Monitor,
  Download,
  Trash2,
  Github,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PERSONALITIES } from "@/lib/personalities";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const { activeMentor, setActiveMentor } = useAppStore();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [memory, setMemory] = React.useState({
    careerGoals: "",
    preferredRole: "",
    codingLanguage: "",
    learningGoals: "",
  });

  // Load from localStorage (AI memory demo)
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("aimp:memory");
      if (raw) setMemory(JSON.parse(raw));
      const p = localStorage.getItem("aimp:profile");
      if (p) {
        const obj = JSON.parse(p);
        setName(obj.name ?? "");
        setEmail(obj.email ?? "");
      }
    } catch {
      /* ignore */
    }
  }, []);

  const saveMemory = () => {
    localStorage.setItem("aimp:memory", JSON.stringify(memory));
    localStorage.setItem("aimp:profile", JSON.stringify({ name, email }));
    toast.success("Settings saved");
  };

  const exportChats = async () => {
    try {
      const res = await fetch("/api/chats");
      const { chats } = await res.json();
      const detailed = await Promise.all(
        (chats ?? []).map(async (c: { id: string }) => {
          const r = await fetch(`/api/chats/${c.id}`);
          const d = await r.json();
          return d.chat;
        })
      );
      const blob = new Blob([JSON.stringify(detailed, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aimp-chats-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Chats exported");
    } catch {
      toast.error("Failed to export chats");
    }
  };

  const clearAllChats = async () => {
    try {
      const res = await fetch("/api/chats");
      const { chats } = await res.json();
      await Promise.all(
        (chats ?? []).map((c: { id: string }) =>
          fetch(`/api/chats/${c.id}`, { method: "DELETE" })
        )
      );
      useAppStore.getState().setChats([]);
      useAppStore.getState().setActiveChatId(null);
      useAppStore.getState().setMessages([]);
      toast.success("All conversations deleted");
    } catch {
      toast.error("Failed to clear conversations");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, appearance, and AI memory.
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Profile</CardTitle>
          </div>
          <CardDescription>Your display info.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Appearance</CardTitle>
          </div>
          <CardDescription>Customize how AI Mentor Pro looks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "light", label: "Light", icon: Sun },
                { key: "dark", label: "Dark", icon: Moon },
                { key: "system", label: "System", icon: Monitor },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTheme(t.key)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-xl border p-3.5 text-xs font-semibold transition-all duration-200 active:scale-98 cursor-pointer",
                    theme === t.key
                      ? "border-primary/40 bg-primary/10 text-primary shadow-sm shadow-primary/5"
                      : "border-border/80 hover:border-border/100 hover:bg-accent/40 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <t.icon className="h-4.5 w-4.5" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Default AI mentor</Label>
            <Select value={activeMentor} onValueChange={setActiveMentor}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERSONALITIES.map((p) => (
                  <SelectItem key={p.key} value={p.key}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* AI Memory */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">AI Memory</CardTitle>
          </div>
          <CardDescription>
            Help your mentors remember your context for better answers.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="role">Preferred role</Label>
            <Input
              id="role"
              value={memory.preferredRole}
              onChange={(e) =>
                setMemory({ ...memory, preferredRole: e.target.value })
              }
              placeholder="e.g. Software Developer"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lang">Coding language</Label>
            <Input
              id="lang"
              value={memory.codingLanguage}
              onChange={(e) =>
                setMemory({ ...memory, codingLanguage: e.target.value })
              }
              placeholder="e.g. TypeScript"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="career">Career goals</Label>
            <Textarea
              id="career"
              value={memory.careerGoals}
              onChange={(e) =>
                setMemory({ ...memory, careerGoals: e.target.value })
              }
              placeholder="e.g. Become a senior backend engineer at a fintech startup"
              rows={2}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="learning">Learning goals</Label>
            <Textarea
              id="learning"
              value={memory.learningGoals}
              onChange={(e) =>
                setMemory({ ...memory, learningGoals: e.target.value })
              }
              placeholder="e.g. Master system design and distributed systems"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Data management</CardTitle>
          </div>
          <CardDescription>Export or delete your conversations.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={exportChats} className="gap-2">
            <Download className="h-4 w-4" />
            Export all chats
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                Delete all conversations
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete all conversations?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes every conversation and message. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={clearAllChats}
                >
                  Delete everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveMemory} className="gap-2">
          <Sparkles className="h-4 w-4" />
          Save settings
        </Button>
      </div>

      <footer className="flex items-center justify-center gap-2 pt-4 text-xs text-muted-foreground">
        <Github className="h-3.5 w-3.5" />
        AI Mentor Pro · Built for IBM × Bharat Cares Vibe Coding
      </footer>
    </div>
  );
}
