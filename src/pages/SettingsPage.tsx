import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSettings, saveSettings, AppSettings } from "@/lib/api";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Clock, Calendar, Zap, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: saved, isLoading } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });

  const [autoPost, setAutoPost] = useState(true);
  const [postsPerDay, setPostsPerDay] = useState([3]);
  const [interval, setInterval] = useState([240]);
  const [startHour, setStartHour] = useState("07");
  const [endHour, setEndHour] = useState("21");
  const [activeDays, setActiveDays] = useState([0, 1, 2, 3, 4, 5, 6]);

  useEffect(() => {
    if (saved) {
      setAutoPost(saved.auto_post);
      setPostsPerDay([saved.posts_per_day]);
      setInterval([saved.interval_minutes]);
      setStartHour(saved.start_hour);
      setEndHour(saved.end_hour);
      setActiveDays(saved.active_days);
    }
  }, [saved]);

  const mutation = useMutation({
    mutationFn: (s: AppSettings) => saveSettings(s),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Configurações salvas!", {
        description: "As alterações já estão em vigor.",
      });
    },
    onError: () => toast.error("Falha ao salvar configurações."),
  });

  const toggleDay = (day: number) => {
    setActiveDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleSave = () => {
    mutation.mutate({
      auto_post: autoPost,
      posts_per_day: postsPerDay[0],
      interval_minutes: interval[0],
      start_hour: startHour,
      end_hour: endHour,
      active_days: activeDays,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground p-8">
        <Loader2 size={18} className="animate-spin" /> Carregando configurações...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-primary flex items-center gap-3">
            <Settings size={28} />
            Configurações
          </h2>
          <p className="text-muted-foreground mt-1">Gerencie o agendamento e intervalos de postagem</p>
        </div>
        <Button onClick={handleSave} disabled={mutation.isPending} className="gap-2">
          {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Salvar
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card-blue">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap size={18} className="text-secondary" />
              Postagem Automática
            </CardTitle>
            <CardDescription>Ativar ou desativar o sistema de auto-post</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {autoPost ? (
                  <span className="text-secondary">Ativo</span>
                ) : (
                  <span className="text-muted-foreground">Inativo</span>
                )}
              </span>
              <Switch checked={autoPost} onCheckedChange={setAutoPost} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card-blue">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar size={18} className="text-accent" />
              Posts por Dia
            </CardTitle>
            <CardDescription>Limite máximo de posts diários</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-heading font-bold text-accent">{postsPerDay[0]}</span>
              <span className="text-sm text-muted-foreground">posts/dia</span>
            </div>
            <Slider value={postsPerDay} onValueChange={setPostsPerDay} min={1} max={10} step={1} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span><span>10</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card-blue">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock size={18} className="text-primary" />
              Intervalo entre Posts
            </CardTitle>
            <CardDescription>Tempo mínimo entre cada postagem (referência)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-heading font-bold text-primary">
                {interval[0] >= 60
                  ? `${Math.floor(interval[0] / 60)}h${interval[0] % 60 > 0 ? ` ${interval[0] % 60}m` : ""}`
                  : `${interval[0]}m`}
              </span>
              <span className="text-sm text-muted-foreground">{interval[0]} min</span>
            </div>
            <Slider value={interval} onValueChange={setInterval} min={30} max={480} step={15} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>30 min</span><span>8 horas</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card-blue">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock size={18} className="text-secondary" />
              Horário Ativo
            </CardTitle>
            <CardDescription>Janela de horário permitida para posts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs text-muted-foreground">Início</label>
                <Select value={startHour} onValueChange={setStartHour}>
                  <SelectTrigger className="bg-muted/40 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map((h) => (
                      <SelectItem key={h} value={h}>{h}:00</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <span className="text-muted-foreground mt-5">→</span>
              <div className="flex-1 space-y-1.5">
                <label className="text-xs text-muted-foreground">Fim</label>
                <Select value={endHour} onValueChange={setEndHour}>
                  <SelectTrigger className="bg-muted/40 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map((h) => (
                      <SelectItem key={h} value={h}>{h}:00</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card-blue">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar size={18} className="text-primary" />
            Dias Ativos
          </CardTitle>
          <CardDescription>Dias da semana em que o bot pode postar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            {DAYS.map((label, i) => {
              const active = activeDays.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  className={`w-14 h-14 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "glass-card-green text-secondary"
                      : "glass-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
