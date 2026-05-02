import { api, flagUrl } from '../api.js';
import { store } from '../store.js';

function buildTitlesRank(cups) {
  const map = {};
  cups.forEach(c => { map[c.winner] = (map[c.winner] || 0) + 1; });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

function mostGoalsEdition(cups) {
  return cups.reduce((best, c) => (!best || c.total_goals > best.total_goals) ? c : best, null);
}

function topScorerEdition(cups) {
  return cups.reduce((best, c) => (!best || c.top_scorer_goals > best.top_scorer_goals) ? c : best, null);
}

function mostParticipations(cups) {
  const map = {};
  cups.forEach(c => {
    [c.winner, c.runner_up, c.third].filter(Boolean).forEach(country => {
      if (!map[country]) map[country] = new Set();
    });
  });
  cups.forEach(c => {
    const counted = new Set([c.winner, c.runner_up, c.third].filter(Boolean));
    counted.forEach(country => { if (map[country]) map[country].add(c.year); });
  });
  const sorted = Object.entries(map).sort((a, b) => b[1].size - a[1].size);
  return sorted[0];
}

function editionPanel(cup) {
  if (!cup) return '';
  const avg = (cup.total_goals / cup.total_matches).toFixed(2);
  return `
    <div class="history-edition-panel">
      <div class="edition-panel-header">
        <div>
          <div class="edition-year">${cup.year}</div>
          <div class="edition-host">📍 ${cup.host}</div>
        </div>
        <div style="flex:1">
          <div class="edition-final">
            <img src="${flagUrl(cup.winner_code, 32)}" alt="${cup.winner}"
                 style="display:inline;width:24px;height:18px;object-fit:cover;border-radius:2px;margin-right:6px;vertical-align:middle" loading="lazy">
            ${cup.winner} <strong>${cup.final_score}</strong>
            <img src="${flagUrl(cup.runner_up_code, 32)}" alt="${cup.runner_up}"
                 style="display:inline;width:24px;height:18px;object-fit:cover;border-radius:2px;margin-left:6px;vertical-align:middle" loading="lazy">
            ${cup.runner_up}
          </div>
          <div style="color:var(--text-muted);font-size:var(--text-xs);margin-top:4px;text-transform:uppercase;letter-spacing:0.08em">Final</div>
        </div>
      </div>
      <div class="edition-grid">
        <div class="edition-item">
          <label>🥇 Campeão</label>
          <img class="edition-flag" src="${flagUrl(cup.winner_code)}" alt="${cup.winner}" loading="lazy">
          <strong>${cup.winner}</strong>
        </div>
        <div class="edition-item">
          <label>🥈 Vice</label>
          <img class="edition-flag" src="${flagUrl(cup.runner_up_code)}" alt="${cup.runner_up}" loading="lazy">
          <strong>${cup.runner_up}</strong>
        </div>
        <div class="edition-item">
          <label>🥉 3º Lugar</label>
          <img class="edition-flag" src="${flagUrl(cup.third_code)}" alt="${cup.third}" loading="lazy">
          <strong>${cup.third}</strong>
        </div>
        <div class="edition-item">
          <label>⚽ Artilheiro</label>
          <img class="edition-flag" src="${flagUrl(cup.top_scorer_code)}" alt="${cup.top_scorer_country}" loading="lazy">
          <strong>${cup.top_scorer} (${cup.top_scorer_goals})</strong>
        </div>
        <div class="edition-item"><label>🏟 Partidas</label><strong>${cup.total_matches}</strong></div>
        <div class="edition-item"><label>⚽ Gols</label><strong>${cup.total_goals}</strong></div>
        <div class="edition-item"><label>📊 Média</label><strong>${avg} gols/jogo</strong></div>
        <div class="edition-item"><label>🌍 Seleções</label><strong>${cup.teams}</strong></div>
      </div>
    </div>`;
}

export async function render(container) {
  container.innerHTML = '<div class="loading-spinner"></div>';

  const hRes = await api.history();
  const cups = hRes.data;
  store.history = cups;

  let selectedYear = cups[cups.length - 1]?.year;

  const titles      = buildTitlesRank(cups);
  const biggestGoal = mostGoalsEdition(cups);
  const topScorer   = topScorerEdition(cups);
  const mostPart    = mostParticipations(cups);

  const totalGoals = cups.reduce((s, c) => s + c.total_goals, 0);
  const maxGoals   = Math.max(...cups.map(c => c.total_goals));

  function chartBars() {
    return cups.map(c => {
      const pct = (c.total_goals / maxGoals * 100).toFixed(1);
      return `
        <div class="chart-bar-wrap" title="${c.year}: ${c.total_goals} gols">
          <div class="chart-bar-value">${c.total_goals}</div>
          <div class="chart-bar" style="height:${pct}%"></div>
          <div class="chart-bar-label">${c.year}</div>
        </div>`;
    }).join('');
  }

  container.innerHTML = `
    <div class="page-header">
      <div class="container">
        <h1>Histórico</h1>
        <p>22 edições da Copa do Mundo FIFA · 1930 – 2022</p>
      </div>
    </div>
    <div class="container history-page">

      <h2 class="section-title">Linha do Tempo</h2>
      <div class="timeline" id="timeline" role="list" aria-label="Edições da Copa do Mundo">
        ${cups.map(c => `
          <div class="timeline-item${c.year === selectedYear ? ' active' : ''}"
               data-year="${c.year}" role="listitem" tabindex="0"
               aria-label="${c.year}: Campeão ${c.winner}">
            <div class="timeline-dot">${String(c.year).slice(2)}</div>
            <div class="timeline-year">${c.year}</div>
            <div class="timeline-winner-flag">
              <img src="${flagUrl(c.winner_code, 20)}" alt="${c.winner}" loading="lazy"
                   style="width:20px;height:15px;object-fit:cover;border-radius:2px">
            </div>
          </div>`).join('')}
      </div>
      <div id="edition-panel">${editionPanel(cups.find(c => c.year === selectedYear))}</div>

      <h2 class="section-title" style="margin-top:var(--sp-12)">Recordes Históricos</h2>
      <div class="records-grid">
        <div class="stat-card card animate-in">
          <div class="stat-number">${titles[0]?.[1] ?? '–'}</div>
          <div class="stat-label">Mais títulos</div>
          <div class="stat-sub">${titles[0]?.[0] ?? '–'}</div>
        </div>
        <div class="stat-card card animate-in animate-in-delay-1">
          <div class="stat-number">${topScorer?.top_scorer_goals ?? '–'}</div>
          <div class="stat-label">Artilheiro de uma edição</div>
          <div class="stat-sub">${topScorer?.top_scorer ?? '–'} · ${topScorer?.year ?? ''}</div>
        </div>
        <div class="stat-card card animate-in animate-in-delay-2">
          <div class="stat-number">${biggestGoal?.total_goals ?? '–'}</div>
          <div class="stat-label">Mais gols em uma edição</div>
          <div class="stat-sub">${biggestGoal?.host ?? '–'} ${biggestGoal?.year ?? ''}</div>
        </div>
        <div class="stat-card card animate-in animate-in-delay-3">
          <div class="stat-number">${totalGoals}</div>
          <div class="stat-label">Gols em toda a história</div>
          <div class="stat-sub">1930 – 2022 · ${cups.length} edições</div>
        </div>
      </div>

      <h2 class="section-title">Ranking de Títulos</h2>
      <div class="titles-list" style="max-width:600px;margin-bottom:var(--sp-10)">
        ${titles.map(([country, count], i) => {
          const cup   = cups.find(c => c.winner === country);
          const code  = cup?.winner_code ?? 'un';
          const years = cups.filter(c => c.winner === country).map(c => c.year).join(', ');
          return `
            <div class="title-row">
              <span class="title-rank">${i + 1}</span>
              <img src="${flagUrl(code, 32)}" alt="${country}"
                   style="width:32px;height:24px;object-fit:cover;border-radius:3px" loading="lazy">
              <div style="flex:1">
                <div class="title-country">${country}</div>
                <div class="title-years">${years}</div>
              </div>
              <span class="title-count">${count}×</span>
            </div>`;
        }).join('')}
      </div>

      <h2 class="section-title">Gols por Edição</h2>
      <div class="chart-wrap" style="margin-bottom:var(--sp-10)">
        <div class="chart-bars">${chartBars()}</div>
      </div>

    </div>`;

  container.querySelector('#timeline')?.addEventListener('click', e => {
    const item = e.target.closest('[data-year]');
    if (!item) return;
    selectedYear = Number(item.dataset.year);
    container.querySelectorAll('.timeline-item').forEach(el =>
      el.classList.toggle('active', Number(el.dataset.year) === selectedYear)
    );
    const panel = document.getElementById('edition-panel');
    if (panel) panel.innerHTML = editionPanel(cups.find(c => c.year === selectedYear));
    item.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  });
}
