import { useQuery } from "@tanstack/react-query";
import { fetchStatus, fetchPosts } from "@/lib/api";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis,
  LineChart, Line
} from "recharts";
import { Loader2 } from "lucide-react";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function AnalyticsPage() {
  const { data: status } = useQuery({ queryKey: ["status"], queryFn: fetchStatus });
  const { data: posts, isLoading } = useQuery({ queryKey: ["posts"], queryFn: fetchPosts });

  const donutData = status
    ? [
        { name: "Postados", value: status.postados, color: "#ff6b35" },
        { name: "Restantes", value: status.restantes, color: "#00d4ff" },
      ]
    : [];

  const dayData = (() => {
    if (!posts) return [];
    const counts = Array(7).fill(0);
    posts.forEach((p) => { counts[new Date(p.posted_at).getDay()]++; });
    return DAYS.map((d, i) => ({ day: d, posts: counts[i] }));
  })();

  const hourData = (() => {
    if (!posts) return [];
    const counts = Array(24).fill(0);
    posts.forEach((p) => { counts[new Date(p.posted_at).getHours()]++; });
    return counts.map((c, i) => ({ hour: `${i}h`, posts: c }));
  })();

  const tooltipStyle = {
    contentStyle: { background: "hsl(230 50% 10%)", border: "1px solid hsl(230 30% 22%)", borderRadius: 8, color: "#e0e0e0" },
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground p-8">
        <Loader2 size={18} className="animate-spin" /> Carregando analytics...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="font-heading text-2xl font-bold">Análises</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut */}
        <div className="glass-card-orange p-6">
          <h3 className="font-heading font-semibold mb-4">Postados vs Restantes</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={donutData} innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={4} animationDuration={800}>
                {donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 text-sm">
            {donutData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                <span className="text-muted-foreground">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar chart - posts per day of week */}
        <div className="glass-card-green p-6">
          <h3 className="font-heading font-semibold mb-4">Posts por Dia da Semana</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dayData}>
              <defs>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00ff88" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#00ff88" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="posts" fill="url(#greenGrad)" radius={[4, 4, 0, 0]} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Line chart - posts per hour */}
      <div className="glass-card-blue p-6">
        <h3 className="font-heading font-semibold mb-4">Posts por Hora do Dia</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={hourData}>
            <defs>
              <linearGradient id="blueLineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="hour" tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip {...tooltipStyle} />
            <Line type="monotone" dataKey="posts" stroke="#00d4ff" strokeWidth={2} dot={{ fill: "#00d4ff", r: 3 }} animationDuration={800} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
