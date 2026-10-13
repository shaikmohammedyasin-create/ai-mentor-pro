"use client";

/**
 * AnalyticsView — admin-style dashboard with usage stats and charts.
 */
import * as React from "react";
import {
  Activity,
  MessageSquare,
  MessagesSquare,
  Cpu,
  Clock,
  TrendingUp,
  HeartPulse,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getPersonality } from "@/lib/personalities";

type AnalyticsData = {
  totals: { chats: number; messages: number; tokens: number };
  active: { today: number; thisWeek: number; thisMonth: number };
  avgResponseMs: number;
  daily: { date: string; count: number; tokens: number; avgResponseMs: number }[];
  mentorBreakdown: { mentor: string; count: number }[];
};

export function AnalyticsView() {
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [health, setHealth] = React.useState<{
    status: string;
    uptime: number;
    db: { ok: boolean; latencyMs: number };
    responseMs: number;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [aRes, hRes] = await Promise.all([
          fetch("/api/analytics"),
          fetch("/api/health"),
        ]);
        const a = await aRes.json();
        const h = await hRes.json();
        if (cancelled) return;
        setData(a);
        setHealth(h);
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-5xl p-6 text-center text-muted-foreground">
        Failed to load analytics.
      </div>
    );
  }

  const daily = data.daily ?? [];
  const mentorBreakdown = data.mentorBreakdown ?? [];
  const totals = data.totals ?? { chats: 0, messages: 0, tokens: 0 };
  const active = data.active ?? { today: 0, thisWeek: 0, thisMonth: 0 };

  const maxDaily = Math.max(1, ...daily.map((d) => d.count));
  const maxMentor = Math.max(1, ...mentorBreakdown.map((m) => m.count));

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Usage insights and system health.
          </p>
        </div>
        {health && (
          <Badge
            variant="outline"
            className={
              health.status === "ok"
                ? "border-primary/40 text-primary"
                : "border-destructive/40 text-destructive"
            }
          >
            <HeartPulse className="mr-1 h-3 w-3" />
            {health.status === "ok" ? "All systems operational" : "Degraded"}
          </Badge>
        )}
      </div>

      {/* Section: Key Metrics */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Key Performance Metrics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={MessagesSquare}
            label="Conversations"
            value={totals.chats}
            description="Active chat history threads"
          />
          <StatCard
            icon={MessageSquare}
            label="Total Messages"
            value={totals.messages}
            description="Exchanges with AI personalities"
          />
          <StatCard
            icon={Cpu}
            label="Tokens Used"
            value={formatNum(totals.tokens)}
            description="Language model context volume"
          />
          <StatCard
            icon={Clock}
            label="API Latency"
            value={data.avgResponseMs ? `${(data.avgResponseMs / 1000).toFixed(2)}s` : "—"}
            description="Average LLM generation roundtrip"
          />
        </div>
      </div>

      {/* Section: Activity Demographics */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Active User Counts</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="rounded-2xl border bg-card/70 shadow-sm hover:shadow transition-shadow">
            <CardHeader className="pb-3 px-6 pt-5">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Today</CardDescription>
              <CardTitle className="text-3xl font-extrabold text-foreground">{active.today}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-2xl border bg-card/70 shadow-sm hover:shadow transition-shadow">
            <CardHeader className="pb-3 px-6 pt-5">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active This Week</CardDescription>
              <CardTitle className="text-3xl font-extrabold text-foreground">{active.thisWeek}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-2xl border bg-card/70 shadow-sm hover:shadow transition-shadow">
            <CardHeader className="pb-3 px-6 pt-5">
              <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active This Month</CardDescription>
              <CardTitle className="text-3xl font-extrabold text-foreground">{active.thisMonth}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Daily activity chart (CSS bars) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Message activity (14 days)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-end gap-1.5">
            {daily.map((d) => (
              <div
                key={d.date}
                className="group relative flex flex-1 flex-col items-center justify-end h-full"
              >
                {/* Floating Tooltip */}
                <div className="absolute bottom-full mb-2 hidden flex-col items-center rounded-lg border border-border bg-popover px-2.5 py-1.5 shadow-md group-hover:flex z-10 pointer-events-none transition-all duration-200 animate-in fade-in zoom-in-95">
                  <span className="text-[10px] font-semibold text-foreground/90 whitespace-nowrap">{d.date}</span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{d.count} messages</span>
                  <span className="text-[9px] text-primary whitespace-nowrap">{formatNum(d.tokens)} tokens</span>
                </div>
                <div
                  className="w-full rounded-t-md bg-primary/20 hover:bg-primary/80 border border-primary/25 transition-all duration-200"
                  style={{
                    height: `${Math.max(4, (d.count / maxDaily) * 100)}%`,
                  }}
                />
                <span className="mt-1 hidden text-[9px] text-muted-foreground sm:block">
                  {d.date.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
 
      {/* Split grid for Popular Mentors & System Health */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Popular Mentors */}
        <Card className="rounded-2xl border bg-card/75 shadow-sm">
          <CardHeader className="pb-4 px-6 pt-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-primary" />
              <CardTitle className="text-base font-bold text-foreground/90">Popular Mentors</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">Messages per AI personality.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6">
            {mentorBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No usage logs recorded yet.</p>
            ) : (
              mentorBreakdown.map((m) => {
                const p = getPersonality(m.mentor);
                return (
                  <div key={m.mentor} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                          <Sparkles className="h-3.5 w-3.5" />
                        </span>
                        <div>
                          <span className="font-semibold text-foreground/90 block">{p.name}</span>
                          <span className="text-[10px] text-muted-foreground block leading-none mt-0.5">{p.tagline}</span>
                        </div>
                      </div>
                      <span className="font-bold text-foreground/90 bg-muted px-2 py-0.5 rounded text-[10px]">{m.count} msg</span>
                    </div>
                    <Progress value={(m.count / maxMentor) * 100} className="h-1.5 [&_[data-slot=progress-indicator]]:bg-primary bg-primary/10" />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* System Health */}
        {health && (
          <Card className="rounded-2xl border bg-card/75 shadow-sm">
            <CardHeader className="pb-4 px-6 pt-5">
              <div className="flex items-center gap-2">
                <HeartPulse className="h-4.5 w-4.5 text-primary" />
                <CardTitle className="text-base font-bold text-foreground/90">System Health</CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground">Real-time status updates.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 grid-cols-2 px-6 pb-6 text-xs font-semibold">
              <HealthItem label="Status" value={health.status} />
              <HealthItem label="Uptime" value={formatUptime(health.uptime)} />
              <HealthItem
                label="Database Latency"
                value={health.db.ok ? `${health.db.latencyMs}ms` : "Down"}
              />
              <HealthItem label="API Latency" value={`${health.responseMs}ms`} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  description?: string;
}) {
  return (
    <Card className="rounded-2xl border bg-card/70 shadow-sm">
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div className="flex items-start justify-between w-full">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {label}
            </span>
            <div className="text-2xl font-black text-foreground tracking-tight">{value}</div>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <Icon className="h-4.5 w-4.5" />
          </span>
        </div>
        {description && (
          <p className="mt-3 text-[10px] font-semibold text-muted-foreground leading-normal border-t border-border/40 pt-2 w-full">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function HealthItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-medium capitalize">{value}</div>
    </div>
  );
}

function formatNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function formatUptime(s: number) {
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}
