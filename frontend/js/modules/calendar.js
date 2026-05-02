import { api, flagUrl, formatDate, formatTime, matchStatus } from '../api.js';
import { store } from '../store.js';

function matchCard(match, teamMap) {
  const home   = teamMap[match.home] || { name: match.home, flag_code: 'un' };
  const away   = teamMap[match.away] || { name: match.away, flag_code: 'un' };
  const status = matchStatus(match);

  const badge = status === 'live'
    ? '<span class="badge badge-live">Ao Vivo</span>'
    : status === 'done'
    ? '<span class="badge badge-done">Encerrado</span>'
    : '<span class="badge badge-upcoming">Agendado</span>';

  const center = status !== 'upcoming'
    ? `<div class="match-score">
         <span>${match.home_score}</span>
         <span class="separator">—</span>
         <span>${match.away_score}</span>
       </div>`
    : `<div class="match-time">${formatTime(match.date)}</div>
       <div class="match-vs">vs</div>`;

  const location = match.stadium_name
    ? `<div class="match-location">📍 ${match.stadium_name} · ${match.stadium_city}</div>`
    : '';

  return `
    <div class="match-card ${status === 'live' ? 'live' : ''}">
      <div class="match-team">
        <img class="match-team-flag" src="${flagUrl(home.flag_code)}" alt="Bandeira de ${home.name}" loading="lazy">
        <span class="match-team-name">${home.name}</span>
      </div>
      <div class="match-center">
        ${center}
        <div class="match-meta">${badge} <span class="badge badge-group">Grupo ${match.group}</span></div>
        ${location}
      </div>
      <div class="match-team away">
        <img class="match-team-flag" src="${flagUrl(away.flag_code)}" alt="Bandeira de ${away.name}" loading="lazy">
        <span class="match-team-name">${away.name}</span>
      </div>
    </div>`;
}

function groupByDate(matches) {
  const map = new Map();
  matches.forEach(m => {
    const key = formatDate(m.date);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(m);
  });
  return map;
}

export async function render(container) {
  container.innerHTML = '<div class="loading-spinner"></div>';

  const [matchesRes, teamsRes] = await Promise.all([api.matches(), api.teams()]);
  const matches = matchesRes.data.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  const teamMap = Object.fromEntries(teamsRes.data.map(t => [t.id, t]));
  store.matches = matches;

  const groups = [...new Set(matches.map(m => m.group))].sort();

  let filterGroup = 'all';
  let search      = '';

  function filtered() {
    return matches.filter(m => {
      if (filterGroup !== 'all' && m.group !== filterGroup) return false;
      if (search) {
        const q = search.toLowerCase();
        const h = teamMap[m.home]?.name.toLowerCase() || m.home;
        const a = teamMap[m.away]?.name.toLowerCase() || m.away;
        if (!h.includes(q) && !a.includes(q)) return false;
      }
      return true;
    });
  }

  function renderMatches() {
    const list = filtered();
    if (!list.length) {
      return `<div class="empty-state">
        <div class="icon">🔍</div>
        <h3>Nenhum jogo encontrado</h3>
        <p>Tente limpar os filtros ou buscar por outro nome</p>
      </div>`;
    }
    const grouped = groupByDate(list);
    let html = '';
    grouped.forEach((ms, date) => {
      html += `<div class="date-separator">${date} · ${ms.length} jogo${ms.length > 1 ? 's' : ''}</div>`;
      html += ms.map(m => matchCard(m, teamMap)).join('');
    });
    return html;
  }

  container.innerHTML = `
    <div class="page-header">
      <div class="container">
        <h1>Calendário</h1>
        <p>72 jogos da fase de grupos · 11 Jun – 7 Jul 2026</p>
      </div>
    </div>
    <div class="calendar-filters">
      <div class="container">
        <div class="calendar-search-wrap">
          <span class="calendar-search-icon">🔍</span>
          <input class="calendar-search" type="text" id="cal-search"
                 placeholder="Buscar por seleção..." aria-label="Buscar seleção">
        </div>
        <div class="filter-bar" role="group" aria-label="Filtrar por grupo">
          <button class="filter-chip${filterGroup === 'all' ? ' active' : ''}"
                  data-val="all">Todos os grupos</button>
          ${groups.map(g => `
            <button class="filter-chip${filterGroup === g ? ' active' : ''}"
                    data-val="${g}" aria-label="Grupo ${g}">Grupo ${g}</button>
          `).join('')}
        </div>
      </div>
    </div>
    <div class="container calendar-page">
      <div class="calendar-matches animate-fade" id="cal-matches">${renderMatches()}</div>
    </div>`;

  function refresh() {
    const el = document.getElementById('cal-matches');
    if (!el) return;
    el.innerHTML = renderMatches();
    el.classList.remove('animate-fade');
    void el.offsetWidth;
    el.classList.add('animate-fade');
  }

  container.querySelector('#cal-search')?.addEventListener('input', e => {
    search = e.target.value;
    refresh();
  });

  container.addEventListener('click', e => {
    const chip = e.target.closest('[data-val]');
    if (!chip) return;
    filterGroup = chip.dataset.val;
    container.querySelectorAll('[data-val]').forEach(c =>
      c.classList.toggle('active', c.dataset.val === filterGroup)
    );
    refresh();
  });
}
