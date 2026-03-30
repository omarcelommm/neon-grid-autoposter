import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchStatus, fetchPosts, triggerPostNow, fetchPostStatus } from "@/lib/api";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { Video, CheckCircle, Clock, Calendar, Zap, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function DashboardPage() {
  const { data: status, isLoading: statusLoading } = useQuery({ queryKey: ["status"], queryFn: fetchStatus });
  const { data: posts } = useQuery({ queryKey: ["posts"], queryFn: fetchPosts });
  const [polling, setPolling] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const postMutation = useMutation({
    mutationFn: triggerPostNow,
    onSuccess: () => {
      setPolling(true);
      toast.info("Postagem iniciada...");
    },
    onError: () => toast.error("Falha ao iniciar postagem"),
  });

  useEffect(() => {
    if (!polling) return;
    pollRef.current = setInterval(async () => {
      try {
        const s = await fetchPostStatus();
        if (!s.running) {
          clearInterval(pollRef.current);
          setPolling(false);
          toast.success(s.last_result || "Postagem concluída!");
        }
      } catch { /* keep polling */ }
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [polling]);

  // Chart data: posts per day last 30 days
  const chartData = (() => {
    if (!posts) return [];
    const counts: Record<string, number> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      counts[d.toISOString().split("T")[0]] = 0;
    }
    posts.forEach((p) => {
      const day = new Date(p.posted_at).toISOString().split("T")[0];
      if (counts[day] !== undefined) counts[day]++;
    });
    return Object.entries(counts).map(([date, count]) => ({
      date: date.slice(5),
      posts: count,
    }));
  })();

  const stats = [
    { label: "Total de Vídeos", value: status?.total_videos ?? 0, icon: Video, glow: "glass-card-blue", textClass: "neon-text-blue" },
    { label: "Postados", value: status?.postados ?? 0, icon: CheckCircle, glow: "glass-card-green", textClass: "neon-text-green" },
    { label: "Restantes", value: status?.restantes ?? 0, icon: Clock, glow: "glass-card-orange", textClass: "neon-text-orange" },
    { label: "Último Post", value: -1, icon: Calendar, glow: "glass-card-blue", textClass: "neon-text-blue", text: status?.ultimo_post ? new Date(status.ultimo_post).toLocaleDateString("pt-BR") : "—" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="font-heading text-2xl font-bold">Dashboard</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className={`${s.glow} p-5 flex flex-col gap-2`} style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon size={18} className={s.textClass} />
            </div>
            <div className={`text-3xl font-heading font-bold ${s.textClass}`}>
              {statusLoading ? "—" : s.value === -1 ? s.text : <AnimatedCounter value={s.value} />}
            </div>
          </div>
        ))}
      </div>

      {/* Post Now */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => postMutation.mutate()}
          disabled={postMutation.isPending || polling}
          className="px-6 py-3 rounded-lg font-heading font-semibold text-sm bg-primary text-primary-foreground pulse-neon disabled:opacity-50 transition-all flex items-center gap-2"
        >
          {polling ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
          {polling ? "Postando..." : "Postar Agora"}
        </button>
        {polling && <span className="text-sm text-muted-foreground">Aguardando resultado...</span>}
      </div>

      {/* Area chart */}
      <div className="glass-card p-6">
        <h3 className="font-heading text-lg font-semibold mb-4">Posts por Dia (Últimos 30 Dias)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="neonBlueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "hsl(230 50% 10%)", border: "1px solid hsl(230 30% 22%)", borderRadius: 8, color: "#e0e0e0" }}
            />
            <Area type="monotone" dataKey="posts" stroke="#00d4ff" strokeWidth={2} fill="url(#neonBlueGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
