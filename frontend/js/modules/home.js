import { api, flagUrl, formatDate, formatTime } from '../api.js';
import { icons } from '../icons.js';
import { store } from '../store.js';

function countdown(targetIso) {
  const diff = new Date(targetIso) - new Date();
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0 };
  const s = Math.floor(diff / 1000);
  return {
    days:  Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    mins:  Math.floor((s % 3600) / 60),
    secs:  s % 60,
  };
}

function pad(n) { return String(n).padStart(2, '0'); }

function countdownHTML(iso) {
  const c = countdown(iso);
  return `
    <div class="countdown">
      <div class="countdown-unit">
        <span class="countdown-num" id="cd-days">${pad(c.days)}</span>
        <span class="countdown-label">Dias</span>
      </div>
      <div class="countdown-unit">
        <span class="countdown-num" id="cd-hours">${pad(c.hours)}</span>
        <span class="countdown-label">Horas</span>
      </div>
      <div class="countdown-unit">
        <span class="countdown-num" id="cd-mins">${pad(c.mins)}</span>
        <span class="countdown-label">Min</span>
      </div>
      <div class="countdown-unit">
        <span class="countdown-num" id="cd-secs">${pad(c.secs)}</span>
        <span class="countdown-label">Seg</span>
      </div>
    </div>`;
}

export async function render(container) {
  container.innerHTML = '<div class="loading-spinner"></div>';

  const [matchesRes, teamsRes] = await Promise.all([api.matches(), api.teams()]);
  const matches = matchesRes.data;
  const teamMap = Object.fromEntries(teamsRes.data.map(t => [t.id, t]));
  store.matches = matches;
  store.teams   = teamsRes.data;

  const now      = new Date();
  const upcoming = matches
    .filter(m => new Date(m.date) > now)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const next     = upcoming[0];
  const homeTeam = next ? teamMap[next.home] : null;
  const awayTeam = next ? teamMap[next.away] : null;

  const nextMatchHTML = next ? `
    <div class="hero-next-match animate-in animate-in-delay-3">
      <div class="hero-next-label">⏱ Próximo Jogo · Grupo ${next.group}</div>
      <div class="hero-next-teams">
        <div class="hero-next-team">
          <img src="${flagUrl(homeTeam?.flag_code || 'un')}" alt="${homeTeam?.name || next.home}" loading="lazy">
          <span>${homeTeam?.name || next.home}</span>
        </div>
        <div class="hero-vs">VS</div>
        <div class="hero-next-team">
          <img src="${flagUrl(awayTeam?.flag_code || 'un')}" alt="${awayTeam?.name || next.away}" loading="lazy">
          <span>${awayTeam?.name || next.away}</span>
        </div>
      </div>
      <div class="hero-match-info">
        📅 ${formatDate(next.date)} &nbsp;·&nbsp; 🕐 ${formatTime(next.date)}
        ${next.stadium_name ? `&nbsp;·&nbsp; 📍 ${next.stadium_name}` : ''}
      </div>
    </div>
    <div id="hero-countdown" class="animate-in animate-in-delay-3">
      ${countdownHTML(next.date)}
      <p class="hero-countdown-label">Para o apito inicial</p>
    </div>
  ` : `<p class="hero-subtitle">Fique atento para os próximos jogos!</p>`;

  const quickNav = [
    { icon: icons.groups,   label: 'Grupos',     route: '#/grupos' },
    { icon: icons.calendar, label: 'Calendário', route: '#/calendario' },
    { icon: icons.globe,    label: 'Seleções',   route: '#/selecoes' },
    { icon: icons.trophy,   label: 'Histórico',  route: '#/historico' },
    { icon: icons.bracket,  label: 'Chave',      route: '#/chave' },
    { icon: icons.jersey,   label: 'Brasil',     route: '#/selecoes/brasil' },
  ].map(n => `
    <a class="quick-nav-item" href="${n.route}" aria-label="${n.label}">
      <span class="quick-nav-icon">${n.icon}</span>
      <span class="quick-nav-label">${n.label}</span>
    </a>`).join('');

  container.innerHTML = `
    <section class="hero">
      <div class="hero-badge animate-in">${icons.ball} 23ª EDIÇÃO · COPA DO MUNDO FIFA</div>
      <h1 class="hero-title animate-in animate-in-delay-1">
        FIFA WORLD CUP
        <span class="highlight">2026</span>
      </h1>
      <p class="hero-subtitle animate-in animate-in-delay-2">48 seleções · 104 jogos · EUA, México e Canadá</p>
      <p class="hero-dates animate-in animate-in-delay-2">11 de Junho — 19 de Julho de 2026</p>
      <div class="hero-divider animate-in animate-in-delay-3"></div>
      ${nextMatchHTML}
      <div class="hero-scroll"><div class="hero-scroll-dot"></div></div>
    </section>

    <section class="section section--alt">
      <div class="container">
        <h2 class="section-title">Acesso Rápido</h2>
        <nav class="quick-nav" aria-label="Acesso rápido às seções">${quickNav}</nav>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">Sobre a Copa 2026</h2>
        <div class="grid-3">
          <div class="stat-card card animate-in">
            <div class="stat-number">48</div>
            <div class="stat-label">Seleções</div>
            <div class="stat-sub">Maior Copa da história</div>
          </div>
          <div class="stat-card card animate-in animate-in-delay-1">
            <div class="stat-number">104</div>
            <div class="stat-label">Partidas</div>
            <div class="stat-sub">39 dias de competição</div>
          </div>
          <div class="stat-card card animate-in animate-in-delay-2">
            <div class="stat-number">16</div>
            <div class="stat-label">Estádios</div>
            <div class="stat-sub">EUA · México · Canadá</div>
          </div>
        </div>
      </div>
    </section>`;

  if (next) {
    const interval = setInterval(() => {
      const c  = countdown(next.date);
      const el = document.getElementById('hero-countdown');
      if (!el) { clearInterval(interval); return; }
      const set = (id, v) => {
        const e = document.getElementById(id);
        if (e) e.textContent = pad(v);
      };
      set('cd-days', c.days);
      set('cd-hours', c.hours);
      set('cd-mins',  c.mins);
      set('cd-secs',  c.secs);
    }, 1000);
  }
}
