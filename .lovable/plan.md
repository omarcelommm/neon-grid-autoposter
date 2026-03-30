

## Redesign: Tema "Azul Profundo Elegante"

Trocar a paleta neon agressiva por um visual mais sofisticado com azul profundo, branco e lavanda.

### Nova paleta

- **Fundo**: `#0B1120` (azul muito escuro)
- **Card/superfície**: `#111827` com borda `#1E293B`
- **Texto principal**: `#E2E8F0` (cinza claro)
- **Texto secundário**: `#94A3B8` (slate)
- **Acento primário**: `#60A5FA` (azul-claro)
- **Acento secundário**: `#A78BFA` (lavanda)
- **Sucesso/verde**: `#34D399` (emerald suave)
- **Destrutivo**: `#F87171`
- **Glow**: sutil, azul-claro com opacidade baixa

### Arquivos alterados

1. **`src/index.css`** — Atualizar todas as variáveis CSS (--background, --card, --primary, --secondary, --neon-*, --glass-*). Reduzir intensidade dos glows. Trocar dot pattern para algo mais sutil.

2. **`tailwind.config.ts`** — Sem mudanças estruturais (já usa variáveis CSS).

3. **`src/components/AppSidebar.tsx`** — Ajustar cor de fundo inline do sidebar para usar a nova paleta.

4. **`src/pages/DashboardPage.tsx`**, **`AnalyticsPage.tsx`**, **`PostsPage.tsx`** — Trocar referências a `neon-text-blue/green/orange` e `glass-card-blue/green/orange` para usar as novas classes com as cores atualizadas.

5. **`src/pages/SettingsPage.tsx`** — Mesmo ajuste de classes de cor.

### Resultado

Visual limpo e premium com azul profundo, sem os neons agressivos. Glows mais sutis e elegantes.

