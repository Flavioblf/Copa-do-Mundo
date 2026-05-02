# PRD — Copa do Mundo 2026 Fan Hub
**Versão:** 1.0  
**Data:** 2026-04-25  
**Status:** Em revisão  
**Autor:** Gerado via sessão de brainstorm

---

## 1. Visão do Produto

### 1.1 Declaração de Visão

> Um hub digital moderno e imersivo que centraliza tudo sobre a Copa do Mundo FIFA 2026 — histórico de todas as edições desde 1930, perfil das 48 seleções, calendário de jogos e chave eliminatória — com foco em experiência mobile-first, performance e acessibilidade.

### 1.2 Problema que Resolve

A informação sobre a Copa do Mundo está fragmentada em múltiplos sites, com designs datados, carregamento lento e navegação confusa. O torcedor precisa de um único ponto de verdade — bonito, rápido e fácil de usar — que entregue a emoção do maior evento esportivo do mundo.

### 1.3 Proposta de Valor

| Para quem | O produto entrega |
|---|---|
| Torcedor casual | Resultados, tabela e calendário em 2 cliques |
| Fã de estatísticas | Histórico completo 1930–2022 com visualizações |
| Curioso sobre o torneio | Perfil das 48 seleções com trajetória histórica |

---

## 2. Contexto da Copa 2026

| Dado | Detalhe |
|---|---|
| Edição | 23ª Copa do Mundo FIFA |
| Seleções | 48 (maior da história) |
| Países-sede | Estados Unidos, Canadá e México |
| Total de jogos | 104 partidas |
| Período | 11 de junho a 19 de julho de 2026 |
| Estádios | 16 estádios em 3 países |
| Grupos | 12 grupos de 4 seleções (fase de grupos) |
| Fase eliminatória | Oitavas → Quartas → Semis → Final |

---

## 3. Personas

### Persona 1 — O Torcedor Casual (João, 32 anos)
- **Contexto:** Assiste aos jogos com amigos, não acompanha futebol o ano todo
- **Objetivo:** Saber rapidamente o placar, a tabela e o próximo jogo do Brasil
- **Frustrações:** Sites com excesso de informação, banners e popups
- **Comportamento:** Acessa principalmente pelo celular, sessões curtas (< 3 min)

### Persona 2 — O Fã de Dados (Ana, 27 anos)
- **Contexto:** Analista de dados, apaixonada por estatísticas de futebol
- **Objetivo:** Comparar recordes históricos, ver artilheiros de todas as edições
- **Frustrações:** Dados históricos espalhados, sem visualização gráfica
- **Comportamento:** Sessões longas no desktop, navega em profundidade

### Persona 3 — O Estudante / Curioso (Carlos, 19 anos)
- **Contexto:** Está descobrindo a Copa pela primeira vez com entusiasmo
- **Objetivo:** Entender como funciona o torneio, conhecer as seleções
- **Frustrações:** Conteúdo técnico demais, sem contexto explicativo
- **Comportamento:** Misto mobile/desktop, compartilha conteúdo nas redes

---

## 4. Objetivos e Métricas de Sucesso

| Objetivo | KPI | Meta |
|---|---|---|
| Engajamento | Tempo médio por sessão | > 4 minutos |
| Retenção | Usuários que retornam 3+ vezes | > 35% |
| Alcance mobile | Sessions via dispositivos móveis | > 65% |
| Performance | Google Lighthouse Score | > 85 (todas as categorias) |
| Acessibilidade | Conformidade WCAG 2.1 | Nível AA |
| Carregamento | First Contentful Paint | < 2 segundos |

---

## 5. Arquitetura de Informação

```
COPA 2026 FAN HUB
│
├── HOME                          ← ponto de entrada principal
│   ├── Hero: próximo jogo / ao vivo
│   ├── Destaques rápidos (artilheiro, líder do grupo)
│   └── Acesso rápido às seções
│
├── GRUPOS                        ← fase de grupos (104 jogos)
│   ├── Seletor de grupo (A a L)
│   ├── Tabela de classificação
│   └── Jogos do grupo selecionado
│
├── CALENDÁRIO                    ← todos os 104 jogos
│   ├── Filtro por data
│   ├── Filtro por grupo
│   ├── Filtro por seleção
│   └── Cards de jogo (status: agendado/ao vivo/encerrado)
│
├── SELEÇÕES                      ← 48 seleções participantes
│   ├── Grid de bandeiras com busca
│   └── /selecao/:id
│       ├── Informações gerais (grupo, treinador)
│       ├── Jogos na Copa 2026
│       └── Histórico em Copas anteriores
│
├── HISTÓRICO                     ← edições 1930 a 2022
│   ├── Linha do tempo interativa
│   ├── Por edição: sede, campeão, vice, artilheiro, gols
│   ├── Recordes gerais
│   └── Artilheiros históricos (ranking)
│
└── CHAVE ELIMINATÓRIA            ← bracket visual
    ├── Oitavas de final
    ├── Quartas de final
    ├── Semifinais
    ├── Disputa 3º lugar
    └── Final
```

---

## 6. Requisitos Funcionais

### 6.1 Módulo: Home

| ID | Requisito | Prioridade |
|---|---|---|
| HOME-01 | Exibir hero section com próximo jogo e countdown regressivo | Alta |
| HOME-02 | Exibir jogo ao vivo com placar atualizado (via dados CSV/JSON) | Alta |
| HOME-03 | Exibir cards de destaques: artilheiro, líder de grupo, última surpresa | Média |
| HOME-04 | Link rápido para cada seção principal do site | Alta |
| HOME-05 | Animação de entrada (fade-in) nos elementos da hero section | Baixa |

### 6.2 Módulo: Grupos

| ID | Requisito | Prioridade |
|---|---|---|
| GRP-01 | Exibir os 12 grupos (A a L) com suas 4 seleções | Alta |
| GRP-02 | Tabela de classificação: P, J, V, E, D, GP, GC, SG, Pts | Alta |
| GRP-03 | Indicador visual de posição: classificado, repescagem, eliminado | Alta |
| GRP-04 | Listar jogos do grupo com placares | Alta |
| GRP-05 | Seletor de grupo com navegação por abas ou dropdown | Alta |
| GRP-06 | Aplicar critérios de desempate da FIFA na ordenação | Média |

### 6.3 Módulo: Calendário

| ID | Requisito | Prioridade |
|---|---|---|
| CAL-01 | Listar todos os 104 jogos com data, horário (BRT) e local | Alta |
| CAL-02 | Filtro por data (seletor de dia) | Alta |
| CAL-03 | Filtro por grupo (A a L) | Média |
| CAL-04 | Filtro por seleção (busca por nome/bandeira) | Média |
| CAL-05 | Badge de status: Agendado / Ao Vivo / Encerrado | Alta |
| CAL-06 | Cards de jogo com bandeiras, times e placar | Alta |
| CAL-07 | Scroll infinito ou paginação por fase do torneio | Baixa |

### 6.4 Módulo: Seleções

| ID | Requisito | Prioridade |
|---|---|---|
| SEL-01 | Grid responsivo com as 48 bandeiras das seleções | Alta |
| SEL-02 | Campo de busca por nome da seleção | Alta |
| SEL-03 | Filtro por grupo ou continente | Média |
| SEL-04 | Página individual por seleção com grupo e fase atual | Alta |
| SEL-05 | Histórico da seleção em Copas anteriores (fonte: CSV histórico) | Alta |
| SEL-06 | Lista de jogos da seleção na Copa 2026 com resultados | Alta |

### 6.5 Módulo: Histórico (1930–2022)

| ID | Requisito | Prioridade |
|---|---|---|
| HIS-01 | Linha do tempo visual e interativa com todas as 22 edições | Alta |
| HIS-02 | Ao clicar em uma edição: sede, campeão, vice, artilheiro, nº de gols | Alta |
| HIS-03 | Ranking de seleções com mais títulos | Alta |
| HIS-04 | Ranking de artilheiros históricos | Alta |
| HIS-05 | Card de recordes: mais gols em uma edição, maior goleada, etc. | Média |
| HIS-06 | Gráfico de evolução: número de gols por edição | Média |
| HIS-07 | Dados carregados de CSV processado pelo backend Python | Alta |

### 6.6 Módulo: Chave Eliminatória

| ID | Requisito | Prioridade |
|---|---|---|
| BRK-01 | Bracket visual com todas as fases eliminatórias | Alta |
| BRK-02 | Exibir seleção classificada ou "A definir" para vagas em aberto | Alta |
| BRK-03 | Linha de progresso mostrando em qual fase está cada seleção | Média |
| BRK-04 | Responsivo: scroll horizontal no mobile, visualização completa no desktop | Alta |

---

## 7. Requisitos Não-Funcionais

### 7.1 Performance
- First Contentful Paint < 2 segundos em conexão 4G
- Imagens de bandeiras em formato SVG (vetorial, leve)
- Lazy loading em imagens e seções fora da viewport
- CSS e JS minificados em produção

### 7.2 Responsividade
- Design mobile-first
- Breakpoints: 320px / 768px / 1024px / 1440px
- Nenhuma funcionalidade bloqueada em tela < 375px

### 7.3 Acessibilidade
- Contraste de cores conforme WCAG 2.1 nível AA
- Navegação completa por teclado (Tab, Enter, Escape)
- Atributos `aria-label` em todos os elementos interativos
- Textos alternativos em todas as bandeiras e imagens

### 7.4 Compatibilidade
- Browsers: Chrome 100+, Firefox 100+, Safari 15+, Edge 100+
- Sistema operacional: Windows, macOS, Android, iOS

### 7.5 Internacionalização
- Interface em Português (Brasil) como idioma principal
- Nomes de seleções e países em PT-BR
- Horários dos jogos exibidos em BRT (UTC-3)

---

## 8. Fonte de Dados

### 8.1 Dados Históricos (CSV)

| Dataset | Fonte | Conteúdo |
|---|---|---|
| `WorldCups.csv` | Kaggle/abecklas | Resumo de cada Copa: sede, campeão, vice, 3º, gols, público |
| `WorldCupMatches.csv` | Kaggle/abecklas | Resultado de cada partida 1930–2022 |
| `WorldCupPlayers.csv` | Kaggle/abecklas | Jogadores por partida e seleção |
| Repositório completo | github.com/jfjelstul/worldcup | 27 datasets (gols, cartões, árbitros, escalações) |

**Estratégia de uso:**
- CSVs são processados pelo backend Python na inicialização
- Dados são convertidos para JSON e servidos via endpoints internos
- Nenhuma dependência de API externa em runtime

### 8.2 Dados da Copa 2026 (Estáticos/Manuais)

- Grupos e seleções: JSON manual baseado no sorteio oficial
- Calendário de jogos: JSON com data, horário e local de cada partida
- Estádios: JSON com nome, cidade, país e capacidade
- Bandeiras: SVGs via repositório `hampusborgos/country-flags` (GitHub)

---

## 9. Stack Técnica

```
BACKEND — Python
├── FastAPI (servidor REST leve e rápido)
├── Pandas (leitura e processamento dos CSVs)
├── Uvicorn (servidor ASGI)
└── python-dotenv (variáveis de ambiente)

FRONTEND — JavaScript + CSS
├── JavaScript ES6+ (Vanilla, sem framework)
│   ├── Módulos nativos (import/export)
│   ├── Router SPA baseado em hash (#/grupos, #/historico)
│   └── Chart.js (gráficos de estatísticas históricas)
├── CSS3
│   ├── Custom Properties (variáveis de design)
│   ├── CSS Grid + Flexbox (layout)
│   ├── CSS Animations e Transitions (microinterações)
│   └── Media queries mobile-first

ASSETS
├── Bandeiras: SVG por país
├── Ícones: Lucide Icons (SVG inline)
└── Fontes: Google Fonts — Bebas Neue (títulos) + Inter (corpo)
```

---

## 10. Design System

### 10.1 Paleta de Cores

```css
/* Fundo */
--color-bg-primary:    #0D0F1A;   /* azul-noite profundo */
--color-bg-secondary:  #161829;   /* card/superfície */
--color-bg-elevated:   #1E2035;   /* hover/destaque */

/* Marca */
--color-gold:          #C9A84C;   /* dourado FIFA — títulos e destaques */
--color-gold-light:    #E8C96A;   /* hover do dourado */

/* Semântica */
--color-live:          #E94560;   /* vermelho — ao vivo */
--color-success:       #2ECC71;   /* verde — classificado */
--color-warning:       #F39C12;   /* laranja — repescagem */
--color-muted:         #6B7280;   /* cinza — texto secundário */

/* Texto */
--color-text-primary:  #F5F5F5;
--color-text-secondary:#A0AEC0;
```

### 10.2 Tipografia

```css
--font-display:  'Bebas Neue', sans-serif;   /* títulos, placares */
--font-body:     'Inter', sans-serif;         /* corpo, labels */

--text-xs:    0.75rem;
--text-sm:    0.875rem;
--text-base:  1rem;
--text-lg:    1.125rem;
--text-xl:    1.25rem;
--text-2xl:   1.5rem;
--text-3xl:   1.875rem;
--text-4xl:   2.25rem;
--text-hero:  clamp(2.5rem, 6vw, 5rem);
```

### 10.3 Espaçamento e Grid

```css
--spacing-unit: 8px;
/* Escala: 4, 8, 12, 16, 24, 32, 48, 64, 96px */

/* Grid principal */
--grid-cols-mobile:  1;
--grid-cols-tablet:  2;
--grid-cols-desktop: 3 ou 4;
--container-max:     1280px;
--container-padding: 1rem (mobile) / 2rem (desktop);
```

### 10.4 Componentes-Base

| Componente | Descrição |
|---|---|
| `MatchCard` | Card de jogo com times, placar e status |
| `FlagBadge` | Bandeira + nome da seleção |
| `StandingsTable` | Tabela de classificação do grupo |
| `BracketNode` | Nó da chave eliminatória |
| `TimelineItem` | Item da linha do tempo histórica |
| `StatCard` | Card de estatística numérica |
| `FilterBar` | Barra de filtros com chips |
| `SkeletonLoader` | Placeholder durante carregamento |

---

## 11. Estrutura de Arquivos do Projeto

```
copa-do-mundo-2026/
│
├── backend/
│   ├── main.py                    # entry point FastAPI
│   ├── routers/
│   │   ├── matches.py             # GET /api/matches
│   │   ├── groups.py              # GET /api/groups
│   │   ├── teams.py               # GET /api/teams/:id
│   │   ├── history.py             # GET /api/history
│   │   └── bracket.py            # GET /api/bracket
│   ├── services/
│   │   └── csv_loader.py          # leitura e parsing dos CSVs
│   ├── data/
│   │   ├── csv/
│   │   │   ├── WorldCups.csv
│   │   │   ├── WorldCupMatches.csv
│   │   │   └── WorldCupPlayers.csv
│   │   ├── groups_2026.json
│   │   ├── calendar_2026.json
│   │   ├── teams_2026.json
│   │   └── stadiums_2026.json
│   └── requirements.txt
│
├── frontend/
│   ├── index.html                 # shell HTML único (SPA)
│   ├── css/
│   │   ├── variables.css          # design tokens
│   │   ├── base.css               # reset + tipografia global
│   │   ├── layout.css             # grid, container, nav
│   │   ├── components.css         # componentes reutilizáveis
│   │   ├── animations.css         # keyframes e transições
│   │   └── pages/
│   │       ├── home.css
│   │       ├── groups.css
│   │       ├── calendar.css
│   │       ├── teams.css
│   │       ├── history.css
│   │       └── bracket.css
│   ├── js/
│   │   ├── main.js                # inicialização e router
│   │   ├── router.js              # roteamento hash-based
│   │   ├── api.js                 # fetch wrapper para o backend
│   │   ├── store.js               # estado global simples
│   │   └── modules/
│   │       ├── home.js
│   │       ├── groups.js
│   │       ├── calendar.js
│   │       ├── teams.js
│   │       ├── history.js
│   │       └── bracket.js
│   └── assets/
│       ├── flags/                 # SVGs das 48 bandeiras
│       ├── icons/                 # ícones Lucide em SVG
│       └── images/
│           └── stadiums/          # fotos dos estádios
│
└── README.md
```

---

## 12. Princípios de UX Aplicados

| Princípio | Implementação |
|---|---|
| **Mobile-first** | Layout pensado para 375px e expandido para desktop |
| **Progressive Disclosure** | Resumo visível; detalhes expandidos ao clicar |
| **Visual Hierarchy** | Jogo ao vivo > próximo jogo > resultado encerrado |
| **Feedback Imediato** | Skeleton loaders, hover states, animações de transição |
| **Reconhecimento sobre Recall** | Bandeiras visíveis em todos os contextos; sem siglas solas |
| **Consistência** | Mesmo padrão de card em toda a aplicação |
| **Prevenção de Erros** | Filtros que nunca retornam lista vazia sem mensagem |
| **Acessibilidade** | Contraste AA, navegação por teclado, textos alternativos |

---

## 13. Roadmap de Entrega

```
FASE 1 — Fundação (Semanas 1–2)
  [ ] Setup do projeto (estrutura de pastas)
  [ ] Backend FastAPI funcional com leitura dos CSVs
  [ ] Design system: variáveis CSS, tipografia, componentes base
  [ ] Router SPA em JavaScript
  [ ] JSONs de dados estáticos da Copa 2026

FASE 2 — Módulos Core (Semanas 3–4)
  [ ] Home (hero + destaques + countdown)
  [ ] Grupos e tabela de classificação
  [ ] Calendário de jogos com filtros

FASE 3 — Módulos Secundários (Semanas 5–6)
  [ ] Grid e perfil de seleções
  [ ] Histórico interativo 1930–2022
  [ ] Chave eliminatória (bracket visual)

FASE 4 — Qualidade e Lançamento (Semana 7)
  [ ] Animações e microinterações finais
  [ ] Otimização de performance (Lighthouse > 85)
  [ ] Testes de acessibilidade
  [ ] Testes em múltiplos dispositivos e browsers
  [ ] Deploy
```

---

## 14. Critérios de Aceite do MVP

- [ ] Todas as 6 seções da navegação funcionando
- [ ] Dados históricos de 1930–2022 exibidos corretamente
- [ ] As 48 seleções com perfil individual acessível
- [ ] Calendário com todos os 104 jogos listados
- [ ] Bracket eliminatório visível e responsivo
- [ ] Nenhuma quebra de layout em telas entre 375px e 1440px
- [ ] Lighthouse Score > 85 em Performance e Acessibilidade
- [ ] Carregamento inicial < 3 segundos em 4G simulado

---

## 15. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| CSVs com dados inconsistentes/sujos | Alta | Médio | Pipeline de limpeza com Pandas na carga inicial |
| Calendário oficial da FIFA mudar | Baixa | Alto | JSONs manuais facilmente editáveis |
| Layout quebrado em dispositivos antigos | Média | Médio | Testes manuais em dispositivos físicos + BrowserStack |
| Performance ruim com 104 jogos em lista | Baixa | Médio | Virtualização de lista ou paginação por fase |

---

## 16. Premissas (a confirmar com o responsável)

> As premissas abaixo foram assumidas na ausência de resposta. Devem ser validadas antes do início da implementação.

1. **Hospedagem:** Ambiente local para desenvolvimento; hospedagem a definir
2. **Autenticação:** Nenhum sistema de login (site público, sem palpites por ora)
3. **Idioma:** Português Brasil como único idioma
4. **Dados ao vivo:** Não haverá atualização em tempo real; dados são atualizados manualmente via JSON/CSV
5. **Público-alvo principal:** Torcedores brasileiros, acesso predominante via mobile

---

*Documento gerado em 2026-04-25. Próxima revisão após validação das premissas da Seção 16.*
