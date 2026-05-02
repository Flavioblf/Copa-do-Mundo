# Plano de Desenvolvimento — Copa do Mundo 2026 Fan Hub
**Versão:** 1.0 | **Data:** 2026-04-25 | **Referência:** PRD v1.0

---

## Visão Geral das Fases

```
FASE 1 — Fundação          (Semanas 1–2)  ████████░░░░░░░░  Setup, dados, design system
FASE 2 — Módulos Core      (Semanas 3–4)  ░░░░████████░░░░  Home, Grupos, Calendário
FASE 3 — Módulos Secundários(Semanas 5–6) ░░░░░░░░████████  Seleções, Histórico, Bracket
FASE 4 — Qualidade         (Semana 7)     ░░░░░░░░░░░░████  Performance, testes, deploy
```

---

## FASE 1 — Fundação

**Objetivo:** Ter o esqueleto técnico funcionando de ponta a ponta antes de qualquer tela.

---

### 1.1 Estrutura de Pastas

**Criar a seguinte árvore de diretórios:**

```
copa-do-mundo-2026/
├── backend/
│   ├── routers/
│   ├── services/
│   └── data/
│       └── csv/
├── frontend/
│   ├── css/
│   │   └── pages/
│   ├── js/
│   │   └── modules/
│   └── assets/
│       ├── flags/
│       ├── icons/
│       └── images/
│           └── stadiums/
└── (CLAUDE.md, PRD.md, PLANO_DESENVOLVIMENTO.md já existem)
```

**Entregável:** Estrutura criada, repositório git inicializado com `.gitignore` para Python e Node.

---

### 1.2 Backend — Setup FastAPI

**Arquivo:** `backend/requirements.txt`
```
fastapi==0.111.0
uvicorn[standard]==0.29.0
pandas==2.2.2
python-dotenv==1.0.1
```

**Arquivo:** `backend/main.py`
- Criar app FastAPI com CORS habilitado para `http://localhost:3000`
- Montar todos os routers sob o prefixo `/api`
- Chamar `csv_loader.load_all()` no evento `startup` para carregar CSVs em memória
- Servir os arquivos estáticos do frontend (opcional para produção)

**Arquivo:** `backend/.env`
```
FRONTEND_URL=http://localhost:3000
DATA_DIR=./data
```

**Teste de validação:**
```bash
cd backend && uvicorn main:app --reload
# GET http://localhost:8000/docs deve responder com Swagger UI
```

---

### 1.3 Backend — Serviço de Leitura de CSV

**Arquivo:** `backend/services/csv_loader.py`

Responsabilidades:
- Ler `WorldCups.csv`, `WorldCupMatches.csv`, `WorldCupPlayers.csv` com Pandas
- Normalizar nomes de colunas (snake_case, sem espaços)
- Limpar valores nulos e tipos inconsistentes (ex.: anos como float → int)
- Armazenar tudo em um dict global `store` acessível pelos routers

```python
# Interface esperada pelo resto do app:
store = {
    "cups": [],           # lista de dicts — uma Copa por item
    "matches": [],        # lista de dicts — uma partida por item
    "players": [],        # lista de dicts — um jogador/partida por item
}

def load_all():
    """Chamado uma vez no startup do FastAPI."""
    ...
```

**Regras de limpeza obrigatórias:**
- Coluna `Year` → inteiro
- `Home Team Goals` / `Away Team Goals` → inteiro (NaN → 0)
- Nomes de países normalizados para PT-BR via dict de mapeamento
- Partidas sem placar (não realizadas) são incluídas com `goals = None`

---

### 1.4 Backend — Routers (esqueleto)

Criar os 5 routers com respostas mockadas/reais mínimas para validar a rota:

| Arquivo | Endpoint | Resposta mínima |
|---|---|---|
| `routers/history.py` | `GET /api/history/cups` | Lista de todas as Copas 1930–2022 |
| `routers/history.py` | `GET /api/history/cups/{year}` | Detalhes de uma edição |
| `routers/matches.py` | `GET /api/matches` | Todos os jogos (histórico + 2026) |
| `routers/matches.py` | `GET /api/matches/{id}` | Um jogo específico |
| `routers/groups.py` | `GET /api/groups` | 12 grupos com seleções e classificação |
| `routers/teams.py` | `GET /api/teams` | 48 seleções com metadata |
| `routers/teams.py` | `GET /api/teams/{id}` | Perfil individual de seleção |
| `routers/bracket.py` | `GET /api/bracket` | Chave eliminatória completa |

**Formato padrão de resposta:**
```json
{
  "data": [...],
  "meta": { "total": 22, "source": "csv" }
}
```

---

### 1.5 Dados Estáticos — JSONs da Copa 2026

**Arquivo:** `backend/data/teams_2026.json`
```json
[
  {
    "id": "brasil",
    "name": "Brasil",
    "flag": "/assets/flags/br.svg",
    "group": "A",
    "confederation": "CONMEBOL",
    "coach": "A definir",
    "fifa_rank": 5
  }
  // ... 47 seleções restantes
]
```

**Arquivo:** `backend/data/groups_2026.json`
```json
{
  "A": ["brasil", "mexico", "selecao-x", "selecao-y"],
  "B": [...],
  ...12 grupos no total
}
```

**Arquivo:** `backend/data/calendar_2026.json`
```json
[
  {
    "id": 1,
    "date": "2026-06-11T21:00:00-03:00",
    "home_team": "mexico",
    "away_team": "selecao-x",
    "stadium": "estadio-azteca",
    "group": "A",
    "stage": "fase-de-grupos",
    "home_score": null,
    "away_score": null
  }
  // ... 103 jogos restantes
]
```

**Arquivo:** `backend/data/stadiums_2026.json`
```json
[
  {
    "id": "estadio-azteca",
    "name": "Estadio Azteca",
    "city": "Cidade do México",
    "country": "México",
    "capacity": 87523,
    "image": "/assets/images/stadiums/azteca.jpg"
  }
]
```

---

### 1.6 Frontend — HTML Shell (SPA)

**Arquivo:** `frontend/index.html`

Estrutura:
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <!-- meta charset, viewport, title -->
  <!-- Google Fonts: Bebas Neue + Inter -->
  <!-- CSS: variables → base → layout → components → animations -->
</head>
<body>
  <nav id="navbar"><!-- logo + links de navegação --></nav>
  <main id="app"><!-- conteúdo renderizado pelo router --></main>
  <footer id="footer"></footer>
  <script type="module" src="js/main.js"></script>
</body>
</html>
```

---

### 1.7 Frontend — Design System CSS

**Ordem de criação e dependências:**

```
variables.css   ← sem dependências (tokens puros)
    ↓
base.css        ← importa variables; reset + tipografia global
    ↓
layout.css      ← importa base; navbar, container, grid-wrapper
    ↓
components.css  ← importa layout; MatchCard, FlagBadge, StatCard, etc.
    ↓
animations.css  ← independente; keyframes reutilizáveis
```

**`frontend/css/variables.css` — conteúdo completo obrigatório:**
```css
:root {
  /* Cores de fundo */
  --color-bg-primary:    #0D0F1A;
  --color-bg-secondary:  #161829;
  --color-bg-elevated:   #1E2035;

  /* Marca */
  --color-gold:          #C9A84C;
  --color-gold-light:    #E8C96A;

  /* Semântica */
  --color-live:          #E94560;
  --color-success:       #2ECC71;
  --color-warning:       #F39C12;
  --color-muted:         #6B7280;

  /* Texto */
  --color-text-primary:  #F5F5F5;
  --color-text-secondary:#A0AEC0;

  /* Tipografia */
  --font-display: 'Bebas Neue', sans-serif;
  --font-body:    'Inter', sans-serif;

  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-lg:   1.125rem;
  --text-xl:   1.25rem;
  --text-2xl:  1.5rem;
  --text-3xl:  1.875rem;
  --text-4xl:  2.25rem;
  --text-hero: clamp(2.5rem, 6vw, 5rem);

  /* Espaçamento */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-6:  24px;
  --space-8:  32px;
  --space-12: 48px;
  --space-16: 64px;

  /* Layout */
  --container-max:     1280px;
  --container-padding: var(--space-4);
  --radius-sm:  4px;
  --radius-md:  8px;
  --radius-lg:  16px;

  /* Transições */
  --transition-fast:   150ms ease;
  --transition-normal: 300ms ease;
}

@media (min-width: 768px) {
  :root {
    --container-padding: var(--space-8);
  }
}
```

**Componentes CSS a implementar em `components.css`:**

| Componente | Seletor CSS | Comportamento |
|---|---|---|
| MatchCard | `.match-card` | Card com duas colunas (times) + placar central |
| FlagBadge | `.flag-badge` | Imagem SVG + nome da seleção lado a lado |
| StandingsTable | `.standings-table` | Tabela com colunas P/J/V/E/D/GP/GC/SG/Pts |
| StatCard | `.stat-card` | Número grande + label pequeno abaixo |
| FilterBar | `.filter-bar` | Chips horizontais com scroll em mobile |
| SkeletonLoader | `.skeleton` | Animação shimmer (gradiente animado) |
| LiveBadge | `.badge--live` | Pulsação vermelha + texto "AO VIVO" |
| BracketNode | `.bracket-node` | Retângulo com slot para seleção + placar |

---

### 1.8 Frontend — Router e Main

**Arquivo:** `frontend/js/router.js`
```javascript
// Roteamento por hash: #/ #/grupos #/calendario #/selecoes #/historico #/chave
// Cada rota mapeia para um módulo que exporta render(container)
// Evento: window.addEventListener('hashchange', ...)
// Fallback: rota não encontrada → redireciona para #/
```

**Arquivo:** `frontend/js/api.js`
```javascript
const BASE_URL = 'http://localhost:8000/api';

// Todas as chamadas de rede passam por aqui.
// Inclui: timeout de 10s, tratamento de erro padronizado,
//         cache simples via Map (evita refetch na mesma sessão).

export const api = {
  get: async (path) => { ... },
};
```

**Arquivo:** `frontend/js/store.js`
```javascript
// Estado global leve (sem biblioteca).
// Módulos escrevem aqui após fetch; outros módulos leem sem refazer a chamada.
const state = {
  groups: null,
  matches: null,
  teams: null,
  history: null,
  bracket: null,
};
```

**Arquivo:** `frontend/js/main.js`
```javascript
// 1. Renderiza navbar e footer
// 2. Inicializa router
// 3. Navega para a rota atual (ou #/ como padrão)
```

**Teste de validação da Fase 1:**
- Backend responde em todas as 8 rotas com status 200
- Frontend abre no browser sem erros no console
- Navegar entre `#/`, `#/grupos`, `#/historico` etc. não quebra a página

---

## FASE 2 — Módulos Core

**Objetivo:** As 3 seções com maior tráfego esperado funcionando completamente.

---

### 2.1 Módulo: Home

**Arquivos:** `frontend/js/modules/home.js` + `frontend/css/pages/home.css`

**Seções a implementar (em ordem):**

#### Hero Section
- Fundo escuro com textura sutil (CSS gradient)
- Título com fonte Bebas Neue e cor dourada
- **Próximo jogo:** busca em `calendar_2026.json` o jogo com `home_score === null` de data mais próxima
- **Countdown:** `setInterval` a cada segundo, exibindo dias:horas:min:seg até o kickoff
- **Jogo ao vivo:** se `now` estiver entre `match.date` e `match.date + 2h`, exibir placar com badge vermelho pulsante

```
┌──────────────────────────────────────────────────────┐
│  COPA DO MUNDO 2026                                   │
│                                                       │
│  PRÓXIMO JOGO                                         │
│  🇧🇷 Brasil  vs  🇩🇪 Alemanha  🇩🇪                     │
│  14 Jun · 16:00 BRT · SoFi Stadium, Los Angeles      │
│                                                       │
│  Começa em:  02 : 14 : 38 : 22                        │
│              dias  hrs  min  seg                      │
└──────────────────────────────────────────────────────┘
```

#### Cards de Destaques
3 cards lado a lado (grid responsivo → coluna em mobile):
1. **Artilheiro da Copa 2026** — calculado dos dados de jogos já encerrados
2. **Líder de Grupo** — seleção com mais pontos entre todos os grupos
3. **Última Surpresa** — jogo encerrado onde o favorito (maior ranking FIFA) perdeu

#### Navegação Rápida
Grid de 6 ícones + labels linkando para cada seção do site.

---

### 2.2 Módulo: Grupos

**Arquivos:** `frontend/js/modules/groups.js` + `frontend/css/pages/groups.css`

**Fluxo de dados:**
```
GET /api/groups
  → retorna 12 grupos
  → cada grupo tem: id, seleções[], partidas[], classificação[]
```

**Backend — lógica de classificação (`routers/groups.py`):**
```
Para cada grupo:
  1. Iterar partidas encerradas
  2. Calcular: J, V, E, D, GP, GC para cada seleção
  3. SG = GP - GC
  4. Pts = V×3 + E×1
  5. Ordenar por: Pts → SG → GP → confronto direto → ranking FIFA
  6. Marcar posição 1–2: classificado, posição 3: repescagem, posição 4: eliminado
```

**Layout do módulo:**
- Seletor de grupo no topo: abas A-B-C-D-E-F-G-H-I-J-K-L (scroll horizontal em mobile)
- Tabela de classificação com indicadores coloridos na coluna de posição:
  - Verde: classificado para oitavas
  - Amarelo: repescagem (melhor 3º)
  - Vermelho/cinza: eliminado
- Abaixo da tabela: cards dos 6 jogos do grupo (com placares encerrados ou "vs" para futuros)

---

### 2.3 Módulo: Calendário

**Arquivos:** `frontend/js/modules/calendar.js` + `frontend/css/pages/calendar.css`

**Fluxo de dados:**
```
GET /api/matches?stage=fase-de-grupos (ou eliminatoria)
  → retorna lista ordenada por data
  → frontend aplica filtros localmente (sem novo fetch)
```

**Barra de filtros:**
```
[Todos] [Por data ▾] [Grupo ▾] [Seleção ▾]
```
- Filtros combinam-se (AND lógico)
- Limpar filtros: botão "X" que reseta ao estado inicial
- Estado vazio: mensagem "Nenhum jogo encontrado para os filtros selecionados"

**Card de jogo — anatomia:**
```
┌─────────────────────────────────────────────┐
│  Sex, 14 Jun · 16:00 BRT             AO VIVO│ ← badge colorido
│                                             │
│  🇧🇷 Brasil          1 — 0       Alemanha 🇩🇪│
│                                             │
│  SoFi Stadium · Los Angeles · Grupo A       │
└─────────────────────────────────────────────┘
```

**Agrupamento:** Jogos agrupados por data (header com a data separando os cards).

**Performance:** Renderizar inicialmente apenas os jogos da próxima semana; carregar mais ao scroll (Intersection Observer).

---

## FASE 3 — Módulos Secundários

### 3.1 Módulo: Seleções

**Arquivos:** `frontend/js/modules/teams.js` + `frontend/css/pages/teams.css`

**Página de listagem:**
- Grid de cards (4 col desktop / 2 col tablet / 2 col mobile)
- Cada card: bandeira grande + nome da seleção + grupo
- Campo de busca com debounce de 300ms (filtra em tempo real)
- Filtro por continente via chips

**Página individual (`#/selecoes/:id`):**

```
┌── Header ───────────────────────────────────────────┐
│  [Bandeira grande]   Brasil                         │
│                      Grupo A · CONMEBOL · 5º no FIFA│
│                      Treinador: A definir           │
└─────────────────────────────────────────────────────┘

┌── Jogos na Copa 2026 ───────────────────────────────┐
│  [MatchCard] [MatchCard] [MatchCard]                │
└─────────────────────────────────────────────────────┘

┌── Histórico em Copas ───────────────────────────────┐
│  22 participações · 5 títulos (1958,62,70,94,2002) │
│                                                     │
│  Melhor fase: Campeão (5x)                          │
│  Gols marcados: 237 · Gols sofridos: 106            │
│                                                     │
│  Linha do tempo mini (círculos por edição)          │
└─────────────────────────────────────────────────────┘
```

**Backend (`routers/teams.py`):**
- `GET /api/teams/{id}` combina dados de `teams_2026.json` com filtro dos CSVs históricos pelo nome do país
- Retorna jogos históricos da seleção: por ano, fase alcançada, gols marcados/sofridos

---

### 3.2 Módulo: Histórico

**Arquivos:** `frontend/js/modules/history.js` + `frontend/css/pages/history.css`

**Seção 1 — Linha do Tempo Interativa**

Layout: linha horizontal com um círculo por edição (1930 → 2022), scroll horizontal em mobile.

```
1930  1934  1938  ...  2018  2022
 ●─────●─────●────...────●─────●
URU   ITA   ITA        FRA   ARG
```

Ao clicar em um círculo:
- Painel lateral (ou modal em mobile) com:
  - Sede e datas
  - Campeão + bandeira
  - Vice-campeão + bandeira
  - 3º lugar
  - Artilheiro: nome + nº de gols
  - Total de gols na edição
  - Número de partidas e média de gols/jogo

**Seção 2 — Recordes Históricos**

Cards de recordes em grid 2×2 (mobile: 1 coluna):

| Recorde | Dado |
|---|---|
| Mais títulos | Brasil (5) |
| Maior goleada | Hungria 10×1 El Salvador (1982) |
| Mais gols em uma edição | França 1998 (171 gols) |
| Artilheiro de todos os tempos | Miroslav Klose (16 gols) |

**Seção 3 — Ranking de Artilheiros Históricos**

Tabela com: posição, nome, país + bandeira, edições, gols.  
Dados extraídos de `WorldCupPlayers.csv` + `WorldCupMatches.csv` via Pandas.

**Seção 4 — Gráfico: Gols por Edição**

Chart.js — gráfico de barras com:
- Eixo X: anos das Copas
- Eixo Y: total de gols
- Tooltip com informação extra ao hover
- Cores: barras douradas, fundo do gráfico transparente (segue o design system)

---

### 3.3 Módulo: Chave Eliminatória

**Arquivos:** `frontend/js/modules/bracket.js` + `frontend/css/pages/bracket.css`

**Estrutura do bracket (48 seleções → 16 oitavistas → 8 → 4 → 2 → campeão):**

```
Oitavas        Quartas       Semis        Final
────────       ────────      ─────       ──────
[  A  ]┐                                
       ├──[     ]┐                       
[  B  ]┘        ├──[   ]┐              
[  C  ]┐        │       ├──[  ]┐        
       ├──[     ]┘       │     ├──[🏆]   
[  D  ]┘                │     │        
...                 [   ]┘     │        
                               [  ]┘   
```

**Implementação CSS:**
- Flexbox com linhas conectoras via `::before`/`::after` (sem SVG)
- Em desktop: visualização completa lado a lado
- Em mobile: scroll horizontal; cada fase ocupa a largura da tela

**Estados dos nós:**
- `pending` — "A definir" (fundo muted)
- `confirmed` — bandeira + nome da seleção (fundo secondary)
- `winner` — borda dourada + ícone de troféu

**Backend (`routers/bracket.py`):**
```json
{
  "round_of_16": [
    { "id": "R16-1", "home": "brasil", "away": null, "winner": null }
  ],
  "quarter_finals": [...],
  "semi_finals": [...],
  "third_place": {...},
  "final": {...}
}
```

---

## FASE 4 — Qualidade e Lançamento

### 4.1 Animações e Microinterações

**Implementar em `animations.css`:**

```css
/* Entrada de página */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Shimmer (skeleton loader) */
@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position:  200% 0; }
}

/* Pulsação (badge ao vivo) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}
```

**Microinterações por componente:**

| Elemento | Interação |
|---|---|
| Cards de jogo | `translateY(-4px)` + sombra suave no hover |
| Bandeiras na listagem | Escala 1.05 no hover |
| Abas de grupo | Indicador deslizante (CSS transition na posição) |
| Círculos da timeline | Anel dourado expandindo no hover |
| Links do navbar | Underline animado da esquerda para direita |

---

### 4.2 Performance

**Checklist obrigatório antes do deploy:**

- [ ] Todas as bandeiras em SVG (não PNG/JPG)
- [ ] Lazy loading via `loading="lazy"` + Intersection Observer para off-screen
- [ ] CSS crítico inline no `<head>` (apenas variables.css + base.css)
- [ ] JS carregado com `type="module"` (defer automático)
- [ ] Fontes com `font-display: swap`
- [ ] Gráficos Chart.js carregados apenas quando o módulo de histórico é acessado
- [ ] Resultado de cada endpoint cacheado no `store.js` (sem refetch na navegação)

**Meta:** Lighthouse Performance > 85 em mobile 4G simulado.

---

### 4.3 Acessibilidade

**Checklist WCAG 2.1 AA:**

- [ ] Contraste de todos os textos ≥ 4.5:1 (verificar com DevTools → Lighthouse)
- [ ] Todos os `<img>` de bandeiras com `alt="Bandeira do [País]"`
- [ ] Todos os botões e links com texto visível ou `aria-label`
- [ ] Navegação por teclado: Tab navega todos os elementos interativos na ordem lógica
- [ ] Modal/painel de histórico fecha com `Escape`
- [ ] Tabelas de classificação com `<th scope="col">` e `<caption>`
- [ ] Badge "AO VIVO" com `role="status"` e `aria-live="polite"`
- [ ] Filtros com `role="group"` e `aria-label` no container

---

### 4.4 Responsividade — Testes

**Dispositivos a testar obrigatoriamente:**

| Dispositivo | Resolução | Foco |
|---|---|---|
| iPhone SE | 375×667 | Menor tela suportada |
| iPhone 14 Pro | 393×852 | Mobile padrão |
| iPad | 768×1024 | Tablet portrait |
| iPad Pro | 1024×1366 | Tablet landscape |
| Desktop | 1440×900 | Baseline desktop |
| Wide | 1920×1080 | Telas largas |

**Pontos críticos a validar:**
- Bracket eliminatório com scroll horizontal funcional em mobile
- Abas de grupo (A–L) com scroll horizontal no mobile sem quebrar
- Tabelas de classificação visíveis sem scroll horizontal forçado
- Hero section legível em 375px sem texto cortado

---

### 4.5 Compatibilidade de Browser

Testar manualmente em:
- Chrome (última versão)
- Firefox (última versão)
- Safari 15+ (macOS e iOS)
- Edge (última versão)

**Atenção especial:** CSS Grid `subgrid` e `clamp()` — verificar suporte no Safari 15.

---

## Dependências entre Tarefas

```
1.2 (FastAPI setup)
  └── 1.3 (csv_loader) → 1.4 (routers) → Fase 2 e 3 (módulos)

1.6 (HTML shell)
  └── 1.7 (CSS design system) → 1.8 (router + main) → Fase 2 e 3 (módulos)

1.5 (JSONs 2026)
  └── Alimenta: 2.1 (Home), 2.2 (Grupos), 2.3 (Calendário), 3.1 (Seleções), 3.3 (Bracket)

CSVs do Kaggle (download manual)
  └── Alimenta: 1.3 (csv_loader) → 3.2 (Histórico)
```

**Caminho crítico:**
```
Download CSVs → csv_loader → routers → frontend modules → testes → deploy
```

---

## Checklist Final de Entrega

### Backend
- [ ] Todos os 8 endpoints respondendo com dados reais (não mock)
- [ ] CORS configurado corretamente
- [ ] CSVs carregados sem erros de parsing
- [ ] Lógica de classificação dos grupos validada manualmente

### Frontend
- [ ] 6 módulos de página implementados e navegáveis
- [ ] Nenhum erro no console do browser
- [ ] Design system aplicado consistentemente (sem cores/fontes hardcoded)
- [ ] Skeleton loaders visíveis durante carregamento

### Qualidade
- [ ] Lighthouse Performance > 85
- [ ] Lighthouse Accessibility > 85
- [ ] Testes em 6 resoluções listadas acima
- [ ] Testes nos 4 browsers listados

---

## Ordem de Implementação Recomendada

```
Dia 1-2:   1.1 → 1.2 → 1.3 → download CSVs
Dia 3:     1.4 (routers) + 1.5 (JSONs)
Dia 4-5:   1.6 + 1.7 (HTML + CSS design system)
Dia 6-7:   1.8 (router + main JS)
─── MARCO: sistema de ponta a ponta funcionando ───
Dia 8-9:   2.1 (Home)
Dia 10-11: 2.2 (Grupos)
Dia 12-13: 2.3 (Calendário)
─── MARCO: módulos core entregues ───
Dia 14-15: 3.1 (Seleções)
Dia 16-18: 3.2 (Histórico)
Dia 19-20: 3.3 (Bracket)
─── MARCO: MVP feature-complete ───
Dia 21:    4.1 (Animações)
Dia 22:    4.2 + 4.3 (Performance + Acessibilidade)
Dia 23:    4.4 + 4.5 (Testes)
Dia 24:    Correções finais + deploy
─── LANÇAMENTO ───
```

---

*Documento gerado em 2026-04-25. Revisar ao término de cada fase.*
