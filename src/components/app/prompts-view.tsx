"use client";

/**
 * PromptsView — browse, search, filter, favorite, create, edit, delete prompts.
 */
import * as React from "react";
import { toast } from "sonner";
import {
  BookMarked,
  Search,
  Plus,
  Star,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Loader2,
  StickyNote,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PromptForm {
  title: string;
  content: string;
  category: string;
  favorite: boolean;
}

const FILTER_CATEGORIES = [
  { value: "all", label: "All" },
  { value: "career", label: "Career" },
  { value: "coding", label: "Coding" },
  { value: "interview", label: "Interview" },
  { value: "resume", label: "Resume" },
  { value: "study", label: "Study" },
  { value: "general", label: "General" },
] as const;

const EDITABLE_CATEGORIES = FILTER_CATEGORIES.filter(
  (c) => c.value !== "all"
);

const EMPTY_FORM: PromptForm = {
  title: "",
  content: "",
  category: "general",
  favorite: false,
};

/** Relative time formatter: "just now", "5m ago", "3h ago", "2d ago", or "Mar 5". */
function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function PromptsView() {
  const [prompts, setPrompts] = React.useState<Prompt[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [category, setCategory] = React.useState<string>("all");
  const [favoritesOnly, setFavoritesOnly] = React.useState(false);

  const [refreshKey, setRefreshKey] = React.useState(0);

  // Dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Prompt | null>(null);
  const [form, setForm] = React.useState<PromptForm>(EMPTY_FORM);
  const [saving, setSaving] = React.useState(false);

  // Delete confirmation
  const [deletePrompt, setDeletePrompt] = React.useState<Prompt | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  // Debounce the search query
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  // Load prompts whenever filters change (or refresh is forced)
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
        if (category !== "all") params.set("category", category);
        if (favoritesOnly) params.set("favorite", "1");
        const res = await fetch(`/api/prompts?${params.toString()}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          throw new Error(data?.error || "Failed to load prompts");
        }
        setPrompts((data.prompts ?? []) as Prompt[]);
      } catch (err) {
        if (!cancelled) {
          toast.error(
            err instanceof Error ? err.message : "Failed to load prompts"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, category, favoritesOnly, refreshKey]);

  // ── Handlers ─────────────────────────────────────────
  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (p: Prompt) => {
    setEditing(p);
    setForm({
      title: p.title,
      content: p.content,
      category: EDITABLE_CATEGORIES.some((c) => c.value === p.category)
        ? p.category
        : "general",
      favorite: p.favorite,
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = form.title.trim();
    const content = form.content.trim();
    if (!title || !content) {
      toast.error("Title and content are required.");
      return;
    }
    setSaving(true);
    try {
      const isEdit = !!editing;
      const res = await fetch(
        isEdit ? `/api/prompts/${editing!.id}` : "/api/prompts",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            title,
            content,
            category: form.category,
            favorite: form.favorite,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to save prompt");
      }
      toast.success(isEdit ? "Prompt updated" : "Prompt created");
      setDialogOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save prompt");
    } finally {
      setSaving(false);
    }
  };

  const toggleFavorite = async (p: Prompt) => {
    const next = !p.favorite;
    // Optimistic update
    setPrompts((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, favorite: next } : x))
    );
    try {
      const res = await fetch(`/api/prompts/${p.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ favorite: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to update");
      }
    } catch (err) {
      // Revert
      setPrompts((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, favorite: p.favorite } : x))
      );
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const copyContent = async (p: Prompt) => {
    try {
      await navigator.clipboard.writeText(p.content);
      toast.success("Prompt copied to clipboard");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const confirmDelete = async () => {
    if (!deletePrompt) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/prompts/${deletePrompt.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to delete");
      }
      toast.success("Prompt deleted");
      setDeletePrompt(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm">
          <BookMarked className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold leading-tight sm:text-2xl">
            Prompt Library
          </h1>
          <p className="text-sm text-muted-foreground">
            Save and reuse your best prompts.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-5 flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prompts by title or content…"
            className="pl-9"
            aria-label="Search prompts"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex min-w-0 flex-1 flex-wrap gap-1.5"
            role="group"
            aria-label="Filter by category"
          >
            {FILTER_CATEGORIES.map((c) => {
              const active = category === c.value;
              return (
                <Button
                  key={c.value}
                  type="button"
                  variant={active ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategory(c.value)}
                  aria-pressed={active}
                  className={cn("rounded-full", active && "shadow-sm")}
                >
                  {c.label}
                </Button>
              );
            })}
          </div>

          <Button
            type="button"
            variant={favoritesOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setFavoritesOnly((v) => !v)}
            aria-pressed={favoritesOnly}
            className="gap-1.5 rounded-full"
          >
            <Star
              className={cn("h-4 w-4", favoritesOnly && "fill-current")}
            />
            <span className="hidden sm:inline">Favorites</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={openNew}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New prompt</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : prompts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <StickyNote className="h-7 w-7" />
          </div>
          <p className="text-base font-medium">
            No prompts yet. Create your first one!
          </p>
          <Button onClick={openNew} size="sm" className="mt-4 gap-1.5">
            <Plus className="h-4 w-4" />
            New prompt
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prompts.map((p) => (
            <Card
              key={p.id}
              className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20"
            >
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <h3 className="line-clamp-1 font-medium">{p.title}</h3>
                    <Badge variant="secondary" className="w-fit capitalize">
                      {p.category}
                    </Badge>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(p)}
                    className="shrink-0 rounded-md p-1 text-muted-foreground transition hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={
                      p.favorite ? "Remove from favorites" : "Add to favorites"
                    }
                    aria-pressed={p.favorite}
                  >
                    <Star
                      className={cn(
                        "h-4 w-4 transition",
                        p.favorite && "fill-primary text-primary"
                      )}
                    />
                  </button>
                </div>
                <p className="line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">
                  {p.content}
                </p>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-xs text-muted-foreground">
                  Updated {timeAgo(p.updatedAt)}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label="Prompt actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => openEdit(p)}>
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyContent(p)}>
                      <Copy className="h-3.5 w-3.5" />
                      Copy text
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setDeletePrompt(p)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* New / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          if (!saving) setDialogOpen(o);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit prompt" : "New prompt"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the details of your prompt."
                : "Create a reusable prompt you can copy anytime."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="prompt-title">Title</Label>
              <Input
                id="prompt-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. STAR-format interview answer"
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="prompt-category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v }))
                }
              >
                <SelectTrigger id="prompt-category" className="w-full">
                  <SelectValue placeholder="Pick a category" />
                </SelectTrigger>
                <SelectContent>
                  {EDITABLE_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="prompt-content">Content</Label>
              <Textarea
                id="prompt-content"
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                placeholder="Write your prompt…"
                className="min-h-[160px] resize-y"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="prompt-favorite"
                checked={form.favorite}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, favorite: v === true }))
                }
              />
              <Label htmlFor="prompt-favorite" className="cursor-pointer">
                Mark as favorite
              </Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : editing ? (
                  "Save changes"
                ) : (
                  "Create prompt"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deletePrompt}
        onOpenChange={(o) => {
          if (!deleting) setDeletePrompt(o ? deletePrompt : null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this prompt?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deletePrompt?.title}” will be permanently removed. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
