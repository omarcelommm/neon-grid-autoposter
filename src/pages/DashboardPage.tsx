import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchStatus, fetchPosts, triggerPostNow, fetchPostStatus } from "@/lib/api";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { Video, CheckCircle, Clock, Calendar, Zap, Loader2, Circle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const STEPS = [
  "Selecionando vídeo...",
  "Transcrevendo áudio...",
  "Gerando legenda com IA...",
  "Fazendo upload para Cloudinary...",
  "Criando container no Instagram...",
  "Aguardando processamento do Instagram...",
  "Publicando...",
];

export default function DashboardPage() {
  const { data: status, isLoading: statusLoading } = useQuery({ queryKey: ["status"], queryFn: fetchStatus });
  const { data: posts } = useQuery({ queryKey: ["posts"], queryFn: fetchPosts });
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const wasRunningRef = useRef(false);

  const postMutation = useMutation({
    mutationFn: triggerPostNow,
    onSuccess: () => toast.info("Postagem iniciada..."),
    onError: () => toast.error("Falha ao iniciar postagem"),
  });

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const s = await fetchPostStatus();
        setIsRunning(s.running);
        if (s.current_step) setCurrentStep(s.current_step);
        if (!s.running && wasRunningRef.current) {
          setCurrentStep(null);
          const result = s.last_result as unknown as { success: boolean; message?: string; filename?: string } | null;
          if (result?.success) {
            toast.success(`Publicado: ${result.filename}`);
          } else if (result) {
            toast.error(result?.message || "Falha na postagem");
          }
        }
        wasRunningRef.current = s.running;
      } catch { /* ignore */ }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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
    { label: "Total de Vídeos", value: status?.total_videos ?? 0, icon: Video, glow: "glass-card-blue", iconClass: "text-primary", textClass: "text-foreground" },
    { label: "Postados", value: status?.postados ?? 0, icon: CheckCircle, glow: "glass-card-green", iconClass: "text-secondary", textClass: "text-foreground" },
    { label: "Restantes", value: status?.restantes ?? 0, icon: Clock, glow: "glass-card-orange", iconClass: "text-accent", textClass: "text-foreground" },
    { label: "Último Post", value: -1, icon: Calendar, glow: "glass-card-blue", iconClass: "text-primary", textClass: "text-foreground", text: status?.ultimo_post ? new Date(status.ultimo_post).toLocaleDateString("pt-BR") : "—" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="font-heading text-2xl font-bold">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className={`${s.glow} p-5 flex flex-col gap-2`} style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon size={18} className={s.iconClass} />
            </div>
            <div className={`text-3xl font-heading font-bold ${s.textClass}`}>
              {statusLoading ? "—" : s.value === -1 ? s.text : <AnimatedCounter value={s.value} />}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => postMutation.mutate()}
            disabled={postMutation.isPending || isRunning}
            className="px-6 py-3 rounded-lg font-heading font-semibold text-sm bg-primary text-primary-foreground pulse-neon disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
            {isRunning ? "Postando..." : "Postar Agora"}
          </button>
        </div>

        {isRunning && (
          <div className="glass-card-blue p-4 space-y-2 max-w-sm">
            {STEPS.map((step) => {
              const currentIndex = currentStep ? STEPS.indexOf(currentStep) : -1;
              const stepIndex = STEPS.indexOf(step);
              const isDone = stepIndex < currentIndex;
              const isActive = step === currentStep;
              return (
                <div key={step} className={`flex items-center gap-3 text-sm transition-all duration-300 ${isActive ? "text-foreground" : isDone ? "text-muted-foreground" : "text-muted-foreground/40"}`}>
                  {isDone ? (
                    <CheckCircle size={14} className="text-secondary shrink-0" />
                  ) : isActive ? (
                    <Loader2 size={14} className="animate-spin text-primary shrink-0" />
                  ) : (
                    <Circle size={14} className="shrink-0" />
                  )}
                  {step}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="glass-card p-6">
        <h3 className="font-heading text-lg font-semibold mb-4">Posts por Dia (Últimos 30 Dias)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "hsl(222 47% 11%)", border: "1px solid hsl(217 33% 20%)", borderRadius: 8, color: "#E2E8F0" }}
            />
            <Area type="monotone" dataKey="posts" stroke="#60A5FA" strokeWidth={2} fill="url(#blueGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
