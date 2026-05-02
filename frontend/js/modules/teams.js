import { api, flagUrl, formatDate, formatTime, matchStatus } from '../api.js';
import { store } from '../store.js';
import { go } from '../router.js';

function teamCard(team) {
  return `
    <div class="team-card" data-id="${team.id}" role="button" tabindex="0" aria-label="Ver ${team.name}">
      <img src="${flagUrl(team.flag_code, 80)}" alt="Bandeira de ${team.name}" loading="lazy">
      <span class="team-name">${team.name}</span>
      <span class="team-group">Grupo ${team.group}</span>
    </div>`;
}

async function renderDetail(container, teamId) {
  const res = await api.team(teamId);
  if (res.error) { container.innerHTML = `<div class="container empty-state"><p>${res.error}</p></div>`; return; }
  const t = res.data;
  const teamMap = Object.fromEntries((store.teams||[]).map(x=>[x.id,x]));

  const matchHTML = (t.matches_2026 || []).sort((a,b)=>new Date(a.date)-new Date(b.date)).map(m => {
    const isHome = m.home === t.id;
    const opp = teamMap[isHome ? m.away : m.home] || { name: isHome ? m.away : m.home, flag_code: 'un' };
    const status = matchStatus(m);
    const score = status !== 'upcoming'
      ? (isHome ? `${m.home_score}–${m.away_score}` : `${m.away_score}–${m.home_score}`)
      : '–';
    return `
      <div class="match-card">
        <div class="match-team">
          <img class="match-team-flag" src="${flagUrl(t.flag_code)}" alt="${t.name}">
          <span class="match-team-name">${t.name}</span>
        </div>
        <div class="match-center">
          <div class="match-score" style="font-size:var(--text-2xl)">${status!=='upcoming'?score:'vs'}</div>
          <div class="match-meta">${formatDate(m.date)} · ${formatTime(m.date)}</div>
          <div class="match-meta"><span class="badge badge-group">Grupo ${m.group}</span></div>
        </div>
        <div class="match-team away">
          <img class="match-team-flag" src="${flagUrl(opp.flag_code)}" alt="${opp.name}">
          <span class="match-team-name">${opp.name}</span>
        </div>
      </div>`;
  }).join('') || '<p style="color:var(--text-muted)">Nenhum jogo encontrado.</p>';

  const titlesHTML = (t.title_years||[]).length > 0
    ? `<p>🏆 ${t.title_years.join(' · ')}</p>`
    : `<p style="color:var(--text-muted)">Nenhum título mundial</p>`;

  container.innerHTML = `
    <div class="team-detail-header"><div class="container">
      <div class="back-btn" onclick="location.hash='#/selecoes'" role="button" tabindex="0" aria-label="Voltar">← Voltar</div>
      <div class="team-detail-top">
        <img class="team-detail-flag" src="${flagUrl(t.flag_code, 80)}" alt="Bandeira de ${t.name}" loading="lazy">
        <div>
          <div class="team-detail-name">${t.name}</div>
          <div class="team-detail-meta">Grupo ${t.group} · ${t.confederation} · Ranking FIFA: ${t.fifa_rank}º</div>
          <div class="team-detail-meta">Treinador: ${t.coach}</div>
          <div class="team-detail-stats">
            <div class="team-detail-stat"><div class="team-detail-stat-num">${t.world_cups}</div><div class="team-detail-stat-lbl">Copas</div></div>
            <div class="team-detail-stat"><div class="team-detail-stat-num">${t.titles}</div><div class="team-detail-stat-lbl">Títulos</div></div>
            <div class="team-detail-stat"><div class="team-detail-stat-num">${t.fifa_rank}º</div><div class="team-detail-stat-lbl">Ranking FIFA</div></div>
          </div>
        </div>
      </div>
    </div></div>
    <div class="container" style="padding-top:var(--sp-8)">
      <h2 class="section-title">Jogos na Copa 2026</h2>
      <div style="display:flex;flex-direction:column;gap:var(--sp-3);margin-bottom:var(--sp-10)">${matchHTML}</div>
      <h2 class="section-title">Histórico em Copas</h2>
      <div class="card" style="margin-bottom:var(--sp-4)">
        <div style="display:flex;gap:var(--sp-8);flex-wrap:wrap">
          <div class="stat-card" style="flex:1;min-width:120px"><div class="stat-number">${t.world_cups}</div><div class="stat-label">Participações</div></div>
          <div class="stat-card" style="flex:1;min-width:120px"><div class="stat-number">${t.titles}</div><div class="stat-label">Títulos</div></div>
        </div>
        <div style="margin-top:var(--sp-4)">${titlesHTML}</div>
      </div>
    </div>`;
}

export async function render(container, params) {
  if (params && params[0]) {
    await renderDetail(container, params[0]);
    return;
  }

  const res = await api.teams();
  const teams = res.data;
  store.teams = teams;
  const confs = ['Todos', ...new Set(teams.map(t=>t.confederation))].sort();
  let search = '';
  let filterConf = 'Todos';

  function filtered() {
    return teams.filter(t => {
      if (filterConf !== 'Todos' && t.confederation !== filterConf) return false;
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }

  function renderGrid() {
    const list = filtered();
    if (!list.length) return '<div class="empty-state"><div class="icon">🔍</div><h3>Nenhuma seleção encontrada</h3></div>';
    return `<div class="teams-grid">${list.map(teamCard).join('')}</div>`;
  }

  container.innerHTML = `
    <div class="page-header"><div class="container">
      <h1>Seleções</h1><p>48 seleções qualificadas para a Copa do Mundo 2026</p>
    </div></div>
    <div class="container" style="padding-top:var(--sp-8)">
      <div class="teams-search-wrap">
        <span class="teams-search-icon">🔍</span>
        <input class="teams-search" type="text" placeholder="Buscar seleção..." id="team-search" aria-label="Buscar seleção">
      </div>
      <div class="filter-bar" id="conf-filters">
        ${confs.map(c=>`<button class="filter-chip${c===filterConf?' active':''}" data-conf="${c}">${c}</button>`).join('')}
      </div>
      <div id="teams-list" class="animate-in">${renderGrid()}</div>
    </div>`;

  function refreshGrid() {
    const el = document.getElementById('teams-list');
    if (el) el.innerHTML = renderGrid();
  }

  container.querySelector('#team-search')?.addEventListener('input', e => { search = e.target.value; refreshGrid(); });

  container.addEventListener('click', e => {
    const chip = e.target.closest('[data-conf]');
    if (chip) {
      filterConf = chip.dataset.conf;
      container.querySelectorAll('[data-conf]').forEach(c => c.classList.toggle('active', c.dataset.conf === filterConf));
      refreshGrid(); return;
    }
    const card = e.target.closest('[data-id]');
    if (card) { location.hash = `#/selecoes/${card.dataset.id}`; }
  });
}
