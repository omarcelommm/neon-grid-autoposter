import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Clock, Calendar, Zap, Save } from "lucide-react";
import { toast } from "sonner";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function SettingsPage() {
  const [autoPost, setAutoPost] = useState(true);
  const [interval, setInterval] = useState([120]); // minutes
  const [activeDays, setActiveDays] = useState([1, 2, 3, 4, 5]); // Mon-Fri
  const [startHour, setStartHour] = useState("09");
  const [endHour, setEndHour] = useState("21");
  const [postsPerDay, setPostsPerDay] = useState([3]);

  const toggleDay = (day: number) => {
    setActiveDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleSave = () => {
    toast.success("Configurações salvas com sucesso!", {
      description: "As alterações serão aplicadas no próximo ciclo.",
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold neon-text-blue flex items-center gap-3">
            <Settings size={28} />
            Configurações
          </h2>
          <p className="text-muted-foreground mt-1">Gerencie o agendamento e intervalos de postagem</p>
        </div>
        <Button onClick={handleSave} className="neon-glow-blue gap-2">
          <Save size={16} />
          Salvar
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Auto-posting toggle */}
        <Card className="glass-card-blue">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap size={18} className="text-neon-green" />
              Postagem Automática
            </CardTitle>
            <CardDescription>Ativar ou desativar o sistema de auto-post</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {autoPost ? (
                  <span className="neon-text-green">Ativo</span>
                ) : (
                  <span className="text-muted-foreground">Inativo</span>
                )}
              </span>
              <Switch checked={autoPost} onCheckedChange={setAutoPost} />
            </div>
          </CardContent>
        </Card>

        {/* Posts per day */}
        <Card className="glass-card-blue">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar size={18} className="text-neon-orange" />
              Posts por Dia
            </CardTitle>
            <CardDescription>Quantidade máxima de posts diários</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-heading font-bold neon-text-orange">{postsPerDay[0]}</span>
              <span className="text-sm text-muted-foreground">posts/dia</span>
            </div>
            <Slider
              value={postsPerDay}
              onValueChange={setPostsPerDay}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>10</span>
            </div>
          </CardContent>
        </Card>

        {/* Interval */}
        <Card className="glass-card-blue">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock size={18} className="text-neon-blue" />
              Intervalo entre Posts
            </CardTitle>
            <CardDescription>Tempo mínimo entre cada postagem</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-heading font-bold neon-text-blue">
                {interval[0] >= 60
                  ? `${Math.floor(interval[0] / 60)}h${interval[0] % 60 > 0 ? ` ${interval[0] % 60}m` : ""}`
                  : `${interval[0]}m`}
              </span>
              <span className="text-sm text-muted-foreground">{interval[0]} min</span>
            </div>
            <Slider
              value={interval}
              onValueChange={setInterval}
              min={30}
              max={480}
              step={15}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>30 min</span>
              <span>8 horas</span>
            </div>
          </CardContent>
        </Card>

        {/* Active hours */}
        <Card className="glass-card-blue">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock size={18} className="text-neon-green" />
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

      {/* Active days */}
      <Card className="glass-card-blue">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar size={18} className="text-neon-blue" />
            Dias Ativos
          </CardTitle>
          <CardDescription>Selecione os dias da semana em que o bot pode postar</CardDescription>
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
                      ? "glass-card-green neon-text-green"
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
