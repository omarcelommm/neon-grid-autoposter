import { useQuery } from "@tanstack/react-query";
import { fetchAnalytics } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Legend, LineChart, Line,
} from "recharts";
import { Loader2 } from "lucide-react";

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const METRIC_COLORS = {
  reach: "#60A5FA",
  likes: "#A78BFA",
  comments: "#34D399",
  saved: "#F9A8D4",
};

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

export default function AnalyticsPage() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
  });

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

  const postData = posts
    .slice()
    .sort((a, b) => (a.posted_at || "").localeCompare(b.posted_at || ""))
    .map((p) => {
      const dt = p.posted_at ? new Date(p.posted_at) : null;
      const label = dt
        ? dt.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
        : "—";
      return {
        name: p.filename.replace(/\.[^.]+$/, "").slice(0, 20),
        label,
        reach: p.reach,
        likes: p.likes,
        comments: p.comments,
        saved: p.saved,
        total: p.reach + p.likes + p.comments + p.saved,
        posted_at: p.posted_at,
      };
    });

  const hourMap: Record<number, { total: number; count: number }> = {};
  posts.forEach((p) => {
    if (p.hour !== null) {
      if (!hourMap[p.hour]) hourMap[p.hour] = { total: 0, count: 0 };
      hourMap[p.hour].total += p.reach + p.likes + p.comments + p.saved;
      hourMap[p.hour].count += 1;
    }
  });
  const hourData = Array.from({ length: 24 }, (_, h) => ({
    hour: `${h}h`,
    engajamento: hourMap[h] ? Math.round(hourMap[h].total / hourMap[h].count) : 0,
  }));

  const dayMap: Record<number, { total: number; count: number }> = {};
  posts.forEach((p) => {
    if (p.day !== null) {
      if (!dayMap[p.day]) dayMap[p.day] = { total: 0, count: 0 };
      dayMap[p.day].total += p.reach + p.likes + p.comments + p.saved;
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

      <div className="glass-card-blue p-6">
        <h3 className="font-heading font-semibold mb-4">Engajamento por Post ao Longo do Tempo</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={postData} margin={{ left: 0, right: 8 }}>
            <XAxis dataKey="label" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12, color: "#94A3B8" }} />
            <Line dataKey="reach" name="Alcance" stroke={METRIC_COLORS.reach} strokeWidth={2} dot={{ r: 4 }} animationDuration={800} />
            <Line dataKey="likes" name="Curtidas" stroke={METRIC_COLORS.likes} strokeWidth={2} dot={{ r: 4 }} animationDuration={800} />
            <Line dataKey="comments" name="Comentários" stroke={METRIC_COLORS.comments} strokeWidth={2} dot={{ r: 4 }} animationDuration={800} />
            <Line dataKey="saved" name="Salvamentos" stroke={METRIC_COLORS.saved} strokeWidth={2} dot={{ r: 4 }} animationDuration={800} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card-green p-6">
          <h3 className="font-heading font-semibold mb-4">Melhor Horário para Postar</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourData}>
              <defs>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#34D399" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="engajamento" name="Engajamento médio" fill="url(#greenGrad)" radius={[4, 4, 0, 0]} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card-orange p-6">
          <h3 className="font-heading font-semibold mb-4">Melhor Dia da Semana</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dayData}>
              <defs>
                <linearGradient id="lavenderGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.7} />
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
        <div className="p-4 border-b border-border">
          <h3 className="font-heading font-semibold">Comparativo de Posts</h3>
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
              </tr>
            </thead>
            <tbody>
              {posts.map((post, i) => (
                <tr
                  key={post.post_id || i}
                  className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                >
                  <td className="p-4 font-medium truncate max-w-[200px]">
                    {post.filename.replace(/\.[^.]+$/, "")}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
