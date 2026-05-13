import { useQuery } from "@tanstack/react-query";
import { fetchAnalytics } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";
import { Loader2, ExternalLink, Eye, Heart, Trophy, Clock4 } from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { useState } from "react";

type SortKey = "posted_at" | "reach" | "engagement";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "posted_at", label: "Mais recente" },
  { value: "reach", label: "Maior alcance" },
  { value: "engagement", label: "Maior engajamento" },
];

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const tooltipStyle = {
  contentStyle: {
    background: "hsl(222 47% 11%)",
    border: "1px solid hsl(217 33% 20%)",
    borderRadius: 8,
    color: "#E2E8F0",
  },
};

function fmtWatchTime(ms: number): string {
  if (!ms) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return rem > 0 ? `${m}m ${rem}s` : `${m}m`;
}

function avgWatchTime(ms: number, reach: number): string {
  if (!ms || !reach) return "—";
  return fmtWatchTime(Math.round(ms / reach));
}

export default function AnalyticsPage() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
  });
  const [sortKey, setSortKey] = useState<SortKey>("posted_at");

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
  const totalReach = posts.reduce((sum, p) => sum + (p.reach ?? 0), 0);
  const totalEngagement = posts.reduce(
    (sum, p) => sum + (p.likes ?? 0) + (p.comments ?? 0) + (p.saved ?? 0),
    0,
  );
  const avgEngagement = Math.round(totalEngagement / posts.length);

  const bestPost = posts.reduce((best, p) => {
    const eng = (p.likes ?? 0) + (p.comments ?? 0) + (p.saved ?? 0);
    const bestEng = (best.likes ?? 0) + (best.comments ?? 0) + (best.saved ?? 0);
    return eng > bestEng ? p : best;
  }, posts[0]);
  const bestPostName = bestPost.filename.replace(/\.[^.]+$/, "").slice(0, 22);
  const bestPostEng = (bestPost.likes ?? 0) + (bestPost.comments ?? 0) + (bestPost.saved ?? 0);

  const postsWithReach = posts.filter((p) => (p.reach ?? 0) > 0);
  const avgWatchSecsByViewer = postsWithReach.length > 0
    ? Math.round(
        postsWithReach.reduce(
          (sum, p) => sum + (p.watch_time_ms ?? 0) / (p.reach ?? 1),
          0,
        ) / postsWithReach.length / 1000,
      )
    : 0;

  const kpis = [
    { label: "Alcance Total", value: totalReach, icon: Eye, glow: "glass-card-blue", textClass: "text-primary" },
    { label: "Engajamento Médio/Post", value: avgEngagement, icon: Heart, glow: "glass-card-green", textClass: "text-secondary" },
    { label: "Melhor Post", value: -1, text: `${bestPostName} · ${bestPostEng}`, icon: Trophy, glow: "glass-card-orange", textClass: "text-accent" },
    { label: "Tempo Médio Assistido", value: -1, text: `${avgWatchSecsByViewer}s por viewer`, icon: Clock4, glow: "glass-card-blue", textClass: "text-primary" },
  ];

  // Time series
  const timeSeries = posts
    .slice()
    .sort((a, b) => (a.posted_at || "").localeCompare(b.posted_at || ""))
    .map((p) => {
      const dt = p.posted_at ? new Date(p.posted_at) : null;
      const label = dt
        ? dt.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit" })
        : "—";
      return {
        label,
        reach: p.reach ?? 0,
        likes: p.likes ?? 0,
        comments: p.comments ?? 0,
        saved: p.saved ?? 0,
      };
    });

  // Top 5 by engagement
  const top5 = [...posts]
    .map((p) => ({
      shortName: p.filename.replace(/\.[^.]+$/, "").slice(0, 18),
      engagement: (p.likes ?? 0) + (p.comments ?? 0) + (p.saved ?? 0),
    }))
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, 5);

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

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="font-heading text-2xl font-bold">Análises</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <div
            key={i}
            className={`${k.glow} p-5 flex flex-col gap-3 group hover:scale-[1.02] transition-transform duration-200`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{k.label}</span>
              <div className={`p-2 rounded-lg bg-muted/50 ${k.textClass}`}>
                <k.icon size={16} />
              </div>
            </div>
            <div className="text-3xl font-heading font-bold text-foreground">
              {k.value === -1 ? (
                <span className="text-lg block truncate">{k.text}</span>
              ) : (
                <AnimatedCounter value={k.value} />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card-blue p-6">
        <h3 className="font-heading font-semibold mb-4">Alcance ao Longo do Tempo</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={timeSeries}>
            <defs>
              <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="reach" name="Alcance" stroke="#60A5FA" strokeWidth={2} fill="url(#reachGrad)" animationDuration={800} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { key: "likes", label: "Curtidas", color: "#A78BFA", gradId: "likesGrad", card: "glass-card-green" },
          { key: "comments", label: "Comentários", color: "#34D399", gradId: "commentsGrad", card: "glass-card-green" },
          { key: "saved", label: "Salvamentos", color: "#F9A8D4", gradId: "savedGrad", card: "glass-card-green" },
        ].map((m) => (
          <div key={m.key} className={`${m.card} p-6`}>
            <h3 className="font-heading font-semibold mb-4" style={{ color: m.color }}>{m.label}</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={timeSeries}>
                <defs>
                  <linearGradient id={m.gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={m.color} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={m.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey={m.key} name={m.label} stroke={m.color} strokeWidth={2} fill={`url(#${m.gradId})`} animationDuration={800} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card-orange p-6">
          <h3 className="font-heading font-semibold mb-4">Top 5 Posts por Engajamento</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={top5} layout="vertical" margin={{ left: 8, right: 20 }}>
              <defs>
                <linearGradient id="topGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.9} />
                </linearGradient>
              </defs>
              <XAxis type="number" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="shortName" type="category" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} width={140} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="engagement" name="Engajamento" fill="url(#topGrad)" radius={[0, 4, 4, 0]} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-heading font-semibold mb-4">Melhor Dia da Semana</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dayData}>
              <defs>
                <linearGradient id="lavenderGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="engajamento" name="Engajamento médio" fill="url(#lavenderGrad)" radius={[4, 4, 0, 0]} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between gap-4">
          <h3 className="font-heading font-semibold">Comparativo de Posts</h3>
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left p-4 font-medium">Post</th>
                <th className="text-center p-4 font-medium text-muted-foreground">Horário</th>
                <th className="text-center p-4 font-medium text-primary">Alcance</th>
                <th className="text-center p-4 font-medium text-secondary">Curtidas</th>
                <th className="text-center p-4 font-medium text-neon-green">Comentários</th>
                <th className="text-center p-4 font-medium text-pink-300">Salvamentos</th>
                <th className="text-center p-4 font-medium text-muted-foreground">Tempo Assistido</th>
                <th className="text-center p-4 font-medium text-yellow-300">Tempo Médio</th>
              </tr>
            </thead>
            <tbody>
              {[...posts].sort((a, b) => {
                if (sortKey === "reach") return (b.reach ?? 0) - (a.reach ?? 0);
                if (sortKey === "engagement") return (b.likes + b.comments + b.saved) - (a.likes + a.comments + a.saved);
                return (b.posted_at || "").localeCompare(a.posted_at || "");
              }).map((post, i) => (
                <tr
                  key={post.post_id || i}
                  className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                >
                  <td className="p-4 font-medium truncate max-w-[200px]">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{post.filename.replace(/\.[^.]+$/, "")}</span>
                      {post.permalink && (
                        <a href={post.permalink} className="shrink-0 text-muted-foreground hover:text-primary transition-colors">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-center text-muted-foreground whitespace-nowrap text-xs">
                    {post.posted_at
                      ? new Date(post.posted_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </td>
                  <td className="p-4 text-center text-primary">{(post.reach ?? 0).toLocaleString("pt-BR")}</td>
                  <td className="p-4 text-center text-secondary">{post.likes.toLocaleString("pt-BR")}</td>
                  <td className="p-4 text-center text-neon-green">{post.comments.toLocaleString("pt-BR")}</td>
                  <td className="p-4 text-center text-pink-300">{post.saved.toLocaleString("pt-BR")}</td>
                  <td className="p-4 text-center text-muted-foreground">{fmtWatchTime(post.watch_time_ms ?? 0)}</td>
                  <td className="p-4 text-center text-yellow-300">{avgWatchTime(post.watch_time_ms ?? 0, post.reach ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
