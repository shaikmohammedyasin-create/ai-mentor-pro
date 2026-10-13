"use client";

/**
 * ResumeTool — paste resume text + optional target role, get an ATS review.
 * Two-column layout: input on the left, results on the right.
 */
import * as React from "react";
import { toast } from "sonner";
import {
  FileText,
  Sparkles,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Wand2,
  FileBarChart2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Markdown } from "@/components/app/markdown";
import { cn } from "@/lib/utils";

interface ResumeResult {
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  improvedBullets: string[];
  fullReport: string;
}

export function ResumeTool() {
  const [text, setText] = React.useState("");
  const [targetRole, setTargetRole] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<ResumeResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (file.type !== "text/plain" && !file.name.endsWith(".txt")) {
      toast.error("Format not supported. Please drop a plain text (.txt) file or copy-paste content.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setText(content);
      toast.success(`Loaded resume content: ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      toast.error("Please paste your resume text first.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          text,
          targetRole: targetRole.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to analyze resume.");
      }
      setResult(data as ResumeResult);
      toast.success("Resume analysis complete!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to analyze resume.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const score = result?.atsScore ?? 0;
  const scoreTone: "good" | "mid" | "bad" =
    score >= 70 ? "good" : score >= 40 ? "mid" : "bad";

  const scoreColor =
    scoreTone === "good"
      ? "text-primary"
      : scoreTone === "mid"
      ? "text-chart-2"
      : "text-destructive";

  const scorePanelBg =
    scoreTone === "good"
      ? "from-primary/20 to-primary/5"
      : scoreTone === "mid"
      ? "from-chart-2/20 to-chart-2/5"
      : "from-destructive/20 to-destructive/5";

  const scoreLabel =
    scoreTone === "good"
      ? "Strong — likely to pass ATS"
      : scoreTone === "mid"
      ? "Needs work — may be filtered out"
      : "At risk — major revisions needed";

  const progressIndicatorColor =
    scoreTone === "good"
      ? "[&_[data-slot=progress-indicator]]:bg-primary"
      : scoreTone === "mid"
      ? "[&_[data-slot=progress-indicator]]:bg-chart-2"
      : "[&_[data-slot=progress-indicator]]:bg-destructive";

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Input column ───────────────────────────────── */}
        <Card className="rounded-2xl border bg-card/70 backdrop-blur">
          <CardContent className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold leading-tight">
                  Resume Reviewer
                </h2>
                <p className="text-sm text-muted-foreground">
                  ATS score, strengths, weaknesses &amp; rewritten bullets
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="resume-target-role" className="font-semibold text-foreground/90 text-xs">Target role (optional)</Label>
                <Input
                  id="resume-target-role"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Backend Engineer"
                  autoComplete="off"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="resume-text" className="font-semibold text-foreground/90 text-xs">Resume content</Label>
                
                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200",
                    isDragOver 
                      ? "border-primary bg-primary/5 shadow-inner" 
                      : "border-border bg-muted/20 hover:bg-muted/30 hover:border-border/80"
                  )}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".txt"
                    className="hidden"
                  />
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border/80 text-muted-foreground shadow-sm mb-2.5 transition duration-200">
                    <FileText className="h-5 w-5 text-primary/80" />
                  </div>
                  <p className="text-xs font-bold text-foreground/80">
                    Drag & drop resume .txt, or <span className="text-primary hover:underline font-extrabold">browse</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">Supports plain text files</p>
                </div>

                <div className="relative">
                  <Textarea
                    id="resume-text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="...or paste the full text of your resume here directly"
                    className="min-h-[160px] resize-y mt-2"
                  />
                  {text && (
                    <button
                      type="button"
                      onClick={() => setText("")}
                      className="absolute right-2.5 bottom-2.5 rounded-lg border border-border bg-card px-2 py-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground shadow-sm transition"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analyze resume
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground">
                Tip: upload plain text files for the most accurate ATS analysis.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* ── Result column ──────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {error ? (
            <Card className="rounded-2xl border bg-card/70 backdrop-blur">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <p className="font-medium">Something went wrong</p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  {error}
                </p>
              </CardContent>
            </Card>
          ) : loading ? (
            <Card className="rounded-2xl border bg-card/70 backdrop-blur">
              <CardContent className="flex flex-col gap-4">
                <Skeleton className="h-28 w-full rounded-2xl" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Skeleton className="h-32 rounded-2xl" />
                  <Skeleton className="h-32 rounded-2xl" />
                </div>
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-40 rounded-2xl" />
              </CardContent>
            </Card>
          ) : !result ? (
            <Card className="rounded-2xl border bg-card/70 backdrop-blur">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <FileBarChart2 className="h-7 w-7" />
                </div>
                <p className="text-base font-medium">
                  Your analysis will appear here
                </p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Paste your resume on the left and click{" "}
                  <span className="font-medium text-foreground">
                    “Analyze resume”
                  </span>{" "}
                  to get an ATS review.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* ATS Score Card */}
              <Card className="overflow-hidden rounded-2xl border bg-card/70 backdrop-blur">
                <CardContent className="flex flex-col gap-4">
                  <div
                    className={cn(
                      "flex items-center gap-5 rounded-2xl bg-gradient-to-br p-5",
                      scorePanelBg
                    )}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span
                        className={cn(
                          "text-5xl font-bold tabular-nums leading-none",
                          scoreColor
                        )}
                      >
                        {score}
                      </span>
                      <span className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                        / 100
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        ATS Compatibility
                      </p>
                      <p className={cn("text-base font-semibold", scoreColor)}>
                        {scoreLabel}
                      </p>
                      <Progress
                        value={score}
                        className={cn("mt-2 h-2", progressIndicatorColor)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Strengths + Weaknesses */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="rounded-2xl border bg-card/70 backdrop-blur">
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold">Strengths</h3>
                    </div>
                    {result.strengths.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No strengths identified.
                      </p>
                    ) : (
                      <ul className="flex flex-col gap-2">
                        {result.strengths.map((s, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm leading-relaxed"
                          >
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <CheckCircle2 className="h-3 w-3" />
                            </span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border bg-card/70 backdrop-blur">
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-chart-2" />
                      <h3 className="font-semibold">Weaknesses</h3>
                    </div>
                    {result.weaknesses.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No major weaknesses found.
                      </p>
                    ) : (
                      <ul className="flex flex-col gap-2">
                        {result.weaknesses.map((s, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm leading-relaxed"
                          >
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-chart-2/15 text-chart-2">
                              <AlertTriangle className="h-3 w-3" />
                            </span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Suggestions */}
              <Card className="rounded-2xl border bg-card/70 backdrop-blur">
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Suggestions</h3>
                  </div>
                  {result.suggestions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No suggestions.
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {result.suggestions.map((s, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm leading-relaxed"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* Improved Bullets */}
              <Card className="rounded-2xl border border-primary/20 bg-card/70 backdrop-blur shadow-sm">
                <CardContent className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-4.5 w-4.5 text-primary" />
                    <h3 className="font-semibold text-foreground/90">Improved Bullet Points</h3>
                  </div>
                  {result.improvedBullets.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No improved bullets provided.
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-3">
                      {result.improvedBullets.map((s, i) => (
                        <li
                          key={i}
                          className="relative overflow-hidden rounded-xl border border-border bg-muted/40 p-4 pl-5 text-sm leading-relaxed transition-all hover:bg-muted/60"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/60" />
                          <span className="text-foreground/90 font-medium">{s}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* Full report */}
              <Card className="rounded-2xl border bg-card/70 backdrop-blur">
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <FileBarChart2 className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Full report</h3>
                  </div>
                  <Markdown content={result.fullReport} />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
