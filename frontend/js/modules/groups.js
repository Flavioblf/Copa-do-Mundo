import { api, flagUrl, formatDate, formatTime, matchStatus } from '../api.js';
import { store } from '../store.js';

function matchCard(match, teamMap) {
  const home   = teamMap[match.home] || { name: match.home,   flag_code: 'un' };
  const away   = teamMap[match.away] || { name: match.away,   flag_code: 'un' };
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
        <div class="match-meta">${badge} · ${formatDate(match.date)}</div>
        ${location}
      </div>
      <div class="match-team away">
        <img class="match-team-flag" src="${flagUrl(away.flag_code)}" alt="Bandeira de ${away.name}" loading="lazy">
        <span class="match-team-name">${away.name}</span>
      </div>
    </div>`;
}

function standingsTable(standings) {
  const rows = standings.map(t => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="standing-pos ${t.status}">${t.position}</span>
          <img src="${flagUrl(t.flag_code)}" alt="${t.name}"
               style="width:22px;height:16px;object-fit:cover;border-radius:2px;flex-shrink:0"
               loading="lazy" onerror="this.style.display='none'">
          <span>${t.name}</span>
        </div>
      </td>
      <td>${t.j}</td><td>${t.v}</td><td>${t.e}</td><td>${t.d}</td>
      <td>${t.gp}</td><td>${t.gc}</td>
      <td>${t.sg > 0 ? '+' + t.sg : t.sg}</td>
      <td class="pts-bold">${t.pts}</td>
    </tr>`).join('');

  return `
    <table class="standings-table" aria-label="Classificação do Grupo">
      <thead><tr>
        <th style="text-align:left">Seleção</th>
        <th title="Jogos">J</th>
        <th title="Vitórias">V</th>
        <th title="Empates">E</th>
        <th title="Derrotas">D</th>
        <th title="Gols Pró">GP</th>
        <th title="Gols Contra">GC</th>
        <th title="Saldo de Gols">SG</th>
        <th title="Pontos">Pts</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

export async function render(container) {
  container.innerHTML = '<div class="loading-spinner"></div>';

  const [groupsRes, teamsRes] = await Promise.all([api.groups(), api.teams()]);
  const groups  = groupsRes.data.sort((a, b) => a.id.localeCompare(b.id));
  const teamMap = Object.fromEntries(teamsRes.data.map(t => [t.id, t]));
  store.groups  = groups;

  let current = groups[0]?.id || 'A';

  function renderGroup(gid) {
    const g = groups.find(g => g.id === gid);
    if (!g) return '';
    const matches = g.matches.slice().sort((a, b) => new Date(a.date) - new Date(b.date));

    return `
      <div class="groups-layout">
        <div>
          <div class="group-standings-card">
            <div class="group-standings-header">
              <span class="group-letter">${g.id}</span>
              <div>
                <div style="font-weight:600;font-size:var(--text-base)">Grupo ${g.id}</div>
                <div style="font-size:var(--text-xs);color:var(--text-muted)">${g.teams.length} seleções</div>
              </div>
            </div>
            <div style="padding:var(--sp-4);overflow-x:auto">${standingsTable(g.standings)}</div>
          </div>
          <div style="margin-top:var(--sp-3)">
            <div class="bracket-legend">
              <div class="bracket-legend-item">
                <div class="legend-dot" style="background:var(--success)"></div>Classificado
              </div>
              <div class="bracket-legend-item">
                <div class="legend-dot" style="background:var(--warning)"></div>Repescagem
              </div>
              <div class="bracket-legend-item">
                <div class="legend-dot" style="background:var(--bg-elevated);border:1px solid var(--border)"></div>Eliminado
              </div>
            </div>
          </div>
        </div>
        <div>
          <p class="group-matches-title">Jogos · Grupo ${g.id}</p>
          <div class="group-match-list">${matches.map(m => matchCard(m, teamMap)).join('')}</div>
        </div>
      </div>`;
  }

  container.innerHTML = `
    <div class="page-header">
      <div class="container">
        <h1>Grupos</h1>
        <p>12 grupos · 48 seleções · Fase de grupos: 11 Jun – 7 Jul 2026</p>
      </div>
    </div>
    <div class="container" style="padding-top:var(--sp-6)">
      <div class="group-tabs" role="tablist" aria-label="Selecionar grupo">
        ${groups.map(g => `
          <button class="group-tab${g.id === current ? ' active' : ''}"
                  role="tab" data-gid="${g.id}"
                  aria-selected="${g.id === current}"
                  aria-label="Grupo ${g.id}">
            ${g.id}
          </button>`).join('')}
      </div>
      <div id="group-content" class="animate-fade">${renderGroup(current)}</div>
    </div>`;

  container.addEventListener('click', e => {
    const tab = e.target.closest('[data-gid]');
    if (!tab) return;
    current = tab.dataset.gid;
    container.querySelectorAll('.group-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.gid === current);
      t.setAttribute('aria-selected', t.dataset.gid === current);
    });
    const content = document.getElementById('group-content');
    content.innerHTML = renderGroup(current);
    content.classList.remove('animate-fade');
    void content.offsetWidth;
    content.classList.add('animate-fade');
  });
}
