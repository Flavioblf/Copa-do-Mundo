import { api, flagUrl } from '../api.js';
import { store } from '../store.js';

function nodeHTML(team, score, isWinner) {
  if (!team) return `<div class="bracket-match-node tbd"><span>A definir</span></div>`;
  const cls = isWinner ? ' winner' : '';
  const scoreHTML = score !== null ? `<span class="bracket-match-score">${score}</span>` : '';
  return `
    <div class="bracket-match-node${cls}">
      <img src="${flagUrl(team.flag_code, 32)}" alt="${team.name}" loading="lazy">
      <span>${team.name}</span>
      ${scoreHTML}
    </div>`;
}

function matchPair(match, teamMap) {
  const home = match.home ? teamMap[match.home] : null;
  const away = match.away ? teamMap[match.away] : null;
  const hw = match.winner && match.winner === match.home;
  const aw = match.winner && match.winner === match.away;
  return `
    <div class="bracket-match">
      ${nodeHTML(home, match.home_score, hw)}
      ${nodeHTML(away, match.away_score, aw)}
    </div>`;
}

function round(title, matches, teamMap) {
  return `
    <div class="bracket-round">
      <div class="bracket-round-title">${title}</div>
      ${matches.map(m => matchPair(m, teamMap)).join('')}
    </div>`;
}

export async function render(container) {
  const [bracketRes, teamsRes] = await Promise.all([api.bracket(), api.teams()]);
  const b = bracketRes.data;
  const teamMap = Object.fromEntries(teamsRes.data.map(t => [t.id, t]));

  const finalTeamHome = b.final?.home ? teamMap[b.final.home] : null;
  const finalTeamAway = b.final?.away ? teamMap[b.final.away] : null;

  container.innerHTML = `
    <div class="page-header"><div class="container">
      <h1>Chave Eliminatória</h1>
      <p>Rodada de 32 → Oitavas → Quartas → Semifinais → Final · 10 Jul – 2 Ago 2026</p>
    </div></div>
    <div class="container bracket-page">

      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:var(--sp-5);margin-bottom:var(--sp-8);text-align:center">
        <p style="color:var(--text-muted);font-size:var(--text-sm)">
          ⏳ A fase eliminatória começa após a fase de grupos (10 de julho de 2026).
          As vagas serão preenchidas conforme os grupos forem concluídos.
        </p>
      </div>

      <div class="bracket-scroll">
        <div class="bracket-inner">
          ${round('Rodada de 32', b.round_of_32 || [], teamMap)}
          ${round('Oitavas de Final', b.round_of_16 || [], teamMap)}
          ${round('Quartas de Final', b.quarter_finals || [], teamMap)}
          ${round('Semifinais', b.semi_finals || [], teamMap)}
          <div class="bracket-round" style="justify-content:center">
            <div class="bracket-round-title">Final</div>
            <div class="bracket-match">
              <div class="bracket-final-node">
                <div class="bracket-final-trophy">🏆</div>
                <div class="bracket-final-title">FINAL</div>
                <div style="margin-top:var(--sp-3);font-size:var(--text-sm);color:var(--text-muted)">
                  ${b.final?.date ? new Date(b.final.date).toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' }) : '2 de Agosto de 2026'}
                </div>
                <div style="margin-top:var(--sp-2);font-size:var(--text-xs);color:var(--text-muted)">MetLife Stadium · Nova York</div>
                ${finalTeamHome ? `
                  <div style="margin-top:var(--sp-4);display:flex;align-items:center;justify-content:center;gap:var(--sp-4)">
                    <div style="text-align:center">
                      <img src="${flagUrl(finalTeamHome.flag_code)}" alt="${finalTeamHome.name}" style="width:40px;height:30px;object-fit:cover;border-radius:3px" loading="lazy">
                      <div style="font-size:var(--text-xs);margin-top:4px">${finalTeamHome.name}</div>
                    </div>
                    <div style="font-family:var(--font-display);color:var(--gold);font-size:var(--text-xl)">VS</div>
                    <div style="text-align:center">
                      <img src="${flagUrl(finalTeamAway?.flag_code||'un')}" alt="${finalTeamAway?.name||''}" style="width:40px;height:30px;object-fit:cover;border-radius:3px" loading="lazy">
                      <div style="font-size:var(--text-xs);margin-top:4px">${finalTeamAway?.name||'A definir'}</div>
                    </div>
                  </div>` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bracket-legend">
        <div class="bracket-legend-item"><div class="legend-dot gold"></div>Vencedor da partida</div>
        <div class="bracket-legend-item"><div class="legend-dot muted"></div>Vaga em aberto</div>
      </div>

      <div style="margin-top:var(--sp-10)">
        <h2 class="section-title">Disputa pelo 3º Lugar</h2>
        <div style="max-width:480px">${matchPair(b.third_place || {}, teamMap)}</div>
        <p style="color:var(--text-muted);font-size:var(--text-sm);margin-top:var(--sp-2)">
          1 de Agosto de 2026 · AT&T Stadium · Dallas
        </p>
      </div>
    </div>`;
}
