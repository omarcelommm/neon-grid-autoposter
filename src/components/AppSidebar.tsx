import { LayoutDashboard, FileText, BarChart3, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Posts", url: "/posts", icon: FileText },
  { title: "Análises", url: "/analytics", icon: BarChart3 },
  { title: "Configurações", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 min-h-screen border-r border-border flex flex-col" style={{ background: "hsl(230 55% 8%)" }}>
      <div className="p-6 border-b border-border">
        <h1 className="font-heading text-xl font-bold neon-text-blue tracking-wide">
          InstaBot
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Sistema de Posts Automático</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const active = location.pathname === item.url;
          return (
            <NavLink
              key={item.url}
              to={item.url}
              end
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? "glass-card-blue neon-text-blue"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
              activeClassName=""
            >
              <item.icon size={20} className={active ? "drop-shadow-[0_0_6px_hsl(190,100%,50%)]" : ""} />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <div className="glass-card p-3 text-center">
          <div className="w-2 h-2 rounded-full bg-neon-green mx-auto mb-1 shadow-[0_0_8px_hsl(155,100%,50%)]" />
          <p className="text-xs text-muted-foreground">Sistema Online</p>
        </div>
      </div>
    </aside>
  );
}
