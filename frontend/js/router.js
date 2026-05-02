import * as home     from './modules/home.js';
import * as groups   from './modules/groups.js';
import * as calendar from './modules/calendar.js';
import * as teams    from './modules/teams.js';
import * as history  from './modules/history.js';
import * as bracket  from './modules/bracket.js';

const routes = {
  '/':           home,
  '/grupos':     groups,
  '/calendario': calendar,
  '/selecoes':   teams,
  '/historico':  history,
  '/chave':      bracket,
};

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

async function navigate() {
  const { path, params } = getHash();
  const mod = routes[path] || routes['/'];

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
