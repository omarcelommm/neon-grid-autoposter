

## Ajuste de Contraste — Menos Azul Monótono

O problema: fundo azul-escuro, cards azul-escuro, texto azul, acentos azul — tudo se mistura.

### Mudanças

**1. `src/index.css` — Variáveis CSS**
- Fundo mais escuro e neutro: `220 20% 6%` (quase preto, menos saturado)
- Cards com mais contraste: `220 17% 10%` (mais claro que o fundo)
- Texto principal mais branco: `210 40% 96%` (quase branco puro)
- Texto secundário mais claro: `215 15% 55%` → `215 20% 65%`
- Manter primary `#60A5FA` mas usar com moderação
- Headings em branco puro, não em azul
- Bordas levemente mais visíveis: `217 25% 22%`

**2. Componentes — Reduzir uso de `text-primary` em textos**
- **`DashboardPage.tsx`**: Números dos stat cards — usar branco (`text-foreground`) para os valores grandes, manter ícones coloridos como diferenciador
- **`AppSidebar.tsx`**: Título "InstaBot" pode manter azul, mas nav items ativos em branco com borda azul sutil
- **`AnalyticsPage.tsx`** e **`PostsPage.tsx`**: Headings em branco, dados numéricos em branco, só ícones/badges coloridos

**3. Resultado esperado**
- Fundo escuro neutro (não azul)
- Texto branco limpo para legibilidade
- Cores (azul, lavanda, verde) aparecem em ícones, badges e gráficos — como acentos, não como cor dominante
- Cards se destacam do fundo por diferença de luminosidade

