import * as home     from './modules/home.js';
import * as groups   from './modules/groups.js';
import * as calendar from './modules/calendar.js';
import * as teams    from './modules/teams.js';
import * as history  from './modules/history.js';
import * as bracket  from './modules/bracket.js';
import { clearCache } from './api.js';

const routes = {
  '/':           home,
  '/grupos':     groups,
  '/calendario': calendar,
  '/selecoes':   teams,
  '/historico':  history,
  '/chave':      bracket,
};

const REFRESH_INTERVAL = 60_000; // 60 segundos

function getHash() {
  const h = window.location.hash.replace('#', '') || '/';
  const parts = h.split('/');
  const path = parts.length > 2
    ? '/' + parts[1]
    : (parts.join('/') || '/');
  return { path, params: parts.slice(2) };
}

let container;
let onNavigate;
let _refreshTimer = null;
let _activeMod    = null;
let _activeParams = null;

async function silentRefresh() {
  if (document.visibilityState === 'hidden') return;
  clearCache();
  try {
    await _activeMod.render(container, _activeParams);
  } catch (e) {
    console.warn('Auto-refresh falhou:', e);
  }
}

async function navigate() {
  clearInterval(_refreshTimer);

  const { path, params } = getHash();
  const mod = routes[path] || routes['/'];
  _activeMod    = mod;
  _activeParams = params;

  container.innerHTML = '<div class="loading-spinner"></div>';
  if (onNavigate) onNavigate(path);

  try {
    await mod.render(container, params);
  } catch (e) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">⚠️</div>
        <h3>Erro ao carregar</h3>
        <p>${e.message}</p>
      </div>`;
    console.error(e);
  }

  _refreshTimer = setInterval(silentRefresh, REFRESH_INTERVAL);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function init(appEl, onNavigateCb) {
  container  = appEl;
  onNavigate = onNavigateCb;
  window.addEventListener('hashchange', navigate);
  navigate();
}

export function go(route) {
  window.location.hash = route;
}
