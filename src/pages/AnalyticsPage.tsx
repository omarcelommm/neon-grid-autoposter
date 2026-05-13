import { useQuery } from "@tanstack/react-query";
import { fetchAnalytics } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Legend, LineChart, Line,
} from "recharts";
import { Loader2, ExternalLink, Eye, Heart, Trophy, Clock4, Award } from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { useState } from "react";

type SortKey = "engagement" | "reach" | "engagement_rate" | "watch_time" | "posted_at";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "engagement", label: "Maior engajamento" },
  { value: "reach", label: "Maior alcance" },
  { value: "engagement_rate", label: "Melhor taxa (eng/alcance)" },
  { value: "watch_time", label: "Maior tempo médio" },
  { value: "posted_at", label: "Mais recente" },
];

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const METRIC = {
  reach: { label: "Alcance", color: "#60A5FA" },
  likes: { label: "Curtidas", color: "#A78BFA" },
  comments: { label: "Comentários", color: "#34D399" },
  saved: { label: "Salvamentos", color: "#F9A8D4" },
  avg_watch: { label: "T.Médio (s)", color: "#FCD34D" },
} as const;

const tooltipStyle = {
  contentStyle: {
    background: "hsl(222 47% 11%)",
    border: "1px solid hsl(217 33% 20%)",
    borderRadius: 8,
    color: "#E2E8F0",
  },
};

function avgWatchSecs(ms: number, reach: number): number {
  if (!ms || !reach) return 0;
  return Math.round(ms / reach / 1000);
}

function BarCell({
  value,
  max,
  color,
  formatted,
}: {
  value: number;
  max: number;
  color: string;
  formatted?: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <td className="p-2 align-middle">
      <div className="relative h-7 flex items-center px-2 rounded-md bg-muted/10 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-md"
          style={{ width: `${pct}%`, backgroundColor: color, opacity: 0.25 }}
        />
        <span className="relative text-xs font-medium tabular-nums" style={{ color }}>
          {formatted ?? value.toLocaleString("pt-BR")}
        </span>
      </div>
    </td>
  );
}

interface CorrelationTooltipData {
  reach: number;
  likes: number;
  comments: number;
  saved: number;
  avg_watch: number;
  reach_idx: number;
  likes_idx: number;
  comments_idx: number;
  saved_idx: number;
  avg_watch_idx: number;
}

interface CorrelationTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: CorrelationTooltipData }>;
  label?: string;
}

function CorrelationTooltip({ active, payload, label }: CorrelationTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  const rows = [
    { label: METRIC.reach.label, color: METRIC.reach.color, abs: d.reach.toLocaleString("pt-BR"), idx: d.reach_idx },
    { label: METRIC.likes.label, color: METRIC.likes.color, abs: d.likes.toLocaleString("pt-BR"), idx: d.likes_idx },
    { label: METRIC.comments.label, color: METRIC.comments.color, abs: d.comments.toLocaleString("pt-BR"), idx: d.comments_idx },
    { label: METRIC.saved.label, color: METRIC.saved.color, abs: d.saved.toLocaleString("pt-BR"), idx: d.saved_idx },
    { label: METRIC.avg_watch.label, color: METRIC.avg_watch.color, abs: `${d.avg_watch}s`, idx: d.avg_watch_idx },
  ];
  return (
    <div className="bg-[hsl(222_47%_11%)] border border-[hsl(217_33%_20%)] rounded-lg p-3 text-xs space-y-1.5 shadow-lg min-w-[220px]">
      <div className="text-muted-foreground border-b border-border pb-1 mb-1">{label}</div>
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between gap-4">
          <span style={{ color: r.color }}>{r.label}</span>
          <span className="text-foreground tabular-nums">
            {r.abs} <span className="text-muted-foreground">({r.idx}%)</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
  });
  const [sortKey, setSortKey] = useState<SortKey>("engagement");

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground p-8">
        <Loader2 size={18} className="animate-spin" /> Carregando analytics...
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="space-y-4 animate-fade-in">
        <h2 className="font-heading text-2xl font-bold">Análises</h2>
        <p className="text-muted-foreground">Nenhum post com dados de engajamento ainda.</p>
      </div>
    );
  }

  // KPIs
  const totalReach = posts.reduce((s, p) => s + (p.reach ?? 0), 0);
  const totalEng = posts.reduce(
    (s, p) => s + (p.likes ?? 0) + (p.comments ?? 0) + (p.saved ?? 0),
    0,
  );
  const avgEng = Math.round(totalEng / posts.length);
  const bestPost = posts.reduce((b, p) => {
    const e = (p.likes ?? 0) + (p.comments ?? 0) + (p.saved ?? 0);
    const be = (b.likes ?? 0) + (b.comments ?? 0) + (b.saved ?? 0);
    return e > be ? p : b;
  }, posts[0]);
  const bestPostName = bestPost.filename.replace(/\.[^.]+$/, "").slice(0, 22);
  const bestPostEng = (bestPost.likes ?? 0) + (bestPost.comments ?? 0) + (bestPost.saved ?? 0);

  const postsWithReach = posts.filter((p) => (p.reach ?? 0) > 0);
  const avgWatchByViewer = postsWithReach.length > 0
    ? Math.round(
        postsWithReach.reduce((s, p) => s + (p.watch_time_ms ?? 0) / (p.reach ?? 1), 0) /
          postsWithReach.length /
          1000,
      )
    : 0;

  const kpis = [
    { label: "Alcance Total", value: totalReach, icon: Eye, glow: "glass-card-blue", textClass: "text-primary" },
    { label: "Engajamento Médio/Post", value: avgEng, icon: Heart, glow: "glass-card-green", textClass: "text-secondary" },
    { label: "Melhor Post", value: -1, text: `${bestPostName} · ${bestPostEng}`, icon: Trophy, glow: "glass-card-orange", textClass: "text-accent" },
    { label: "Tempo Médio Assistido", value: -1, text: `${avgWatchByViewer}s por viewer`, icon: Clock4, glow: "glass-card-blue", textClass: "text-primary" },
  ];

  // Max values for normalization (both correlation chart and table bars)
  const maxR = Math.max(1, ...posts.map((p) => p.reach ?? 0));
  const maxL = Math.max(1, ...posts.map((p) => p.likes ?? 0));
  const maxC = Math.max(1, ...posts.map((p) => p.comments ?? 0));
  const maxS = Math.max(1, ...posts.map((p) => p.saved ?? 0));
  const maxW = Math.max(1, ...posts.map((p) => avgWatchSecs(p.watch_time_ms ?? 0, p.reach ?? 0)));

  // Correlation series (chronological, normalized 0-100)
  const correlation = posts
    .slice()
    .sort((a, b) => (a.posted_at || "").localeCompare(b.posted_at || ""))
    .map((p) => {
      const dt = p.posted_at ? new Date(p.posted_at) : null;
      const label = dt
        ? dt.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
        : "—";
      const watch = avgWatchSecs(p.watch_time_ms ?? 0, p.reach ?? 0);
      return {
        label,
        reach: p.reach ?? 0,
        likes: p.likes ?? 0,
        comments: p.comments ?? 0,
        saved: p.saved ?? 0,
        avg_watch: watch,
        reach_idx: Math.round(((p.reach ?? 0) / maxR) * 100),
        likes_idx: Math.round(((p.likes ?? 0) / maxL) * 100),
        comments_idx: Math.round(((p.comments ?? 0) / maxC) * 100),
        saved_idx: Math.round(((p.saved ?? 0) / maxS) * 100),
        avg_watch_idx: Math.round((watch / maxW) * 100),
      };
    });

  // Day of week (avg engagement)
  const dayMap: Record<number, { total: number; count: number }> = {};
  posts.forEach((p) => {
    if (p.day !== null && p.day !== undefined) {
      if (!dayMap[p.day]) dayMap[p.day] = { total: 0, count: 0 };
      dayMap[p.day].total += (p.likes ?? 0) + (p.comments ?? 0) + (p.saved ?? 0);
      dayMap[p.day].count += 1;
    }
  });
  const dayData = DAYS.map((d, i) => ({
    day: d,
    engajamento: dayMap[i] ? Math.round(dayMap[i].total / dayMap[i].count) : 0,
  }));

  // Hour of day (avg engagement)
  const hourMap: Record<number, { total: number; count: number }> = {};
  posts.forEach((p) => {
    if (p.hour !== null && p.hour !== undefined) {
      if (!hourMap[p.hour]) hourMap[p.hour] = { total: 0, count: 0 };
      hourMap[p.hour].total += (p.likes ?? 0) + (p.comments ?? 0) + (p.saved ?? 0);
      hourMap[p.hour].count += 1;
    }
  });
  const hourData = Array.from({ length: 24 }, (_, h) => ({
    hour: `${h.toString().padStart(2, "0")}h`,
    engajamento: hourMap[h] ? Math.round(hourMap[h].total / hourMap[h].count) : 0,
  }));

  // Sorted posts for table
  const sortedPosts = [...posts].sort((a, b) => {
    if (sortKey === "engagement") {
      return ((b.likes ?? 0) + (b.comments ?? 0) + (b.saved ?? 0)) - ((a.likes ?? 0) + (a.comments ?? 0) + (a.saved ?? 0));
    }
    if (sortKey === "reach") return (b.reach ?? 0) - (a.reach ?? 0);
    if (sortKey === "engagement_rate") {
      const ra = (a.reach ?? 0) > 0 ? ((a.likes ?? 0) + (a.comments ?? 0) + (a.saved ?? 0)) / (a.reach ?? 1) : 0;
      const rb = (b.reach ?? 0) > 0 ? ((b.likes ?? 0) + (b.comments ?? 0) + (b.saved ?? 0)) / (b.reach ?? 1) : 0;
      return rb - ra;
    }
    if (sortKey === "watch_time") {
      return avgWatchSecs(b.watch_time_ms ?? 0, b.reach ?? 0) - avgWatchSecs(a.watch_time_ms ?? 0, a.reach ?? 0);
    }
    return (b.posted_at || "").localeCompare(a.posted_at || "");
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="font-heading text-2xl font-bold">Análises</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <div key={i} className={`${k.glow} p-5 flex flex-col gap-3 group hover:scale-[1.02] transition-transform duration-200`}>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{k.label}</span>
              <div className={`p-2 rounded-lg bg-muted/50 ${k.textClass}`}>
                <k.icon size={16} />
              </div>
            </div>
            <div className="text-3xl font-heading font-bold text-foreground">
              {k.value === -1 ? <span className="text-lg block truncate">{k.text}</span> : <AnimatedCounter value={k.value} />}
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card-blue p-6">
        <div className="flex items-baseline justify-between mb-4 gap-4 flex-wrap">
          <h3 className="font-heading font-semibold">Correlação Temporal</h3>
          <span className="text-xs text-muted-foreground">Cada linha = % do máximo da própria métrica · clique na legenda pra isolar</span>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={correlation} margin={{ left: 0, right: 8 }}>
            <XAxis dataKey="label" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} width={42} />
            <Tooltip content={<CorrelationTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: "#94A3B8", paddingTop: 8 }} />
            <Line dataKey="reach_idx" name={METRIC.reach.label} stroke={METRIC.reach.color} strokeWidth={2} dot={{ r: 2 }} animationDuration={600} />
            <Line dataKey="likes_idx" name={METRIC.likes.label} stroke={METRIC.likes.color} strokeWidth={2} dot={{ r: 2 }} animationDuration={600} />
            <Line dataKey="comments_idx" name={METRIC.comments.label} stroke={METRIC.comments.color} strokeWidth={2} dot={{ r: 2 }} animationDuration={600} />
            <Line dataKey="saved_idx" name={METRIC.saved.label} stroke={METRIC.saved.color} strokeWidth={2} dot={{ r: 2 }} animationDuration={600} />
            <Line dataKey="avg_watch_idx" name={METRIC.avg_watch.label} stroke={METRIC.avg_watch.color} strokeWidth={2} dot={{ r: 2 }} strokeDasharray="4 3" animationDuration={600} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between gap-4">
          <h3 className="font-heading font-semibold">Posts</h3>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="bg-muted text-sm text-foreground border border-border rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background/95 backdrop-blur z-10">
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left p-3 font-medium">Post</th>
                <th className="text-center p-3 font-medium text-xs">Horário</th>
                <th className="text-left p-2 font-medium text-xs" style={{ color: METRIC.reach.color }}>Alcance</th>
                <th className="text-left p-2 font-medium text-xs" style={{ color: METRIC.likes.color }}>Curtidas</th>
                <th className="text-left p-2 font-medium text-xs" style={{ color: METRIC.comments.color }}>Coment.</th>
                <th className="text-left p-2 font-medium text-xs" style={{ color: METRIC.saved.color }}>Saves</th>
                <th className="text-left p-2 font-medium text-xs" style={{ color: METRIC.avg_watch.color }}>T.Médio</th>
              </tr>
            </thead>
            <tbody>
              {sortedPosts.map((post, i) => {
                const watch = avgWatchSecs(post.watch_time_ms ?? 0, post.reach ?? 0);
                const isTop = i === 0;
                return (
                  <tr
                    key={post.post_id || i}
                    className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${isTop ? "bg-amber-500/5" : ""}`}
                  >
                    <td className="p-3 font-medium max-w-[220px]">
                      <div className="flex items-center gap-2 min-w-0">
                        {isTop && <Award size={14} className="shrink-0 text-amber-400" />}
                        <span className="truncate">{post.filename.replace(/\.[^.]+$/, "")}</span>
                        {post.permalink && (
                          <a href={post.permalink} className="shrink-0 text-muted-foreground hover:text-primary transition-colors">
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center text-muted-foreground whitespace-nowrap text-xs">
                      {post.posted_at
                        ? new Date(post.posted_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
                        : "—"}
                    </td>
                    <BarCell value={post.reach ?? 0} max={maxR} color={METRIC.reach.color} />
                    <BarCell value={post.likes ?? 0} max={maxL} color={METRIC.likes.color} />
                    <BarCell value={post.comments ?? 0} max={maxC} color={METRIC.comments.color} />
                    <BarCell value={post.saved ?? 0} max={maxS} color={METRIC.saved.color} />
                    <BarCell value={watch} max={maxW} color={METRIC.avg_watch.color} formatted={`${watch}s`} />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card-green p-6">
          <h3 className="font-heading font-semibold mb-4">Melhor Dia da Semana</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dayData}>
              <defs>
                <linearGradient id="dayGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="engajamento" name="Engajamento médio" fill="url(#dayGrad)" radius={[4, 4, 0, 0]} animationDuration={600} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card-orange p-6">
          <h3 className="font-heading font-semibold mb-4">Melhor Horário</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={hourData}>
              <defs>
                <linearGradient id="hourGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#34D399" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="engajamento" name="Engajamento médio" fill="url(#hourGrad)" radius={[4, 4, 0, 0]} animationDuration={600} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
