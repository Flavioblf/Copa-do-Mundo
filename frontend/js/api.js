const BASE = '/api';
const cache = new Map();

async function get(path) {
  if (cache.has(path)) return cache.get(path);
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  cache.set(path, json);
  return json;
}

export const api = {
  history:  () => get('/history/cups'),
  cup:      (year) => get(`/history/cups/${year}`),
  records:  () => get('/history/records'),
  groups:   () => get('/groups'),
  group:    (id)  => get(`/groups/${id}`),
  teams:    () => get('/teams'),
  team:     (id)  => get(`/teams/${id}`),
  matches:  (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get('/matches' + (q ? '?' + q : ''));
  },
  bracket:  () => get('/bracket'),
};

export function flagUrl(code, size = 40) {
  if (!code) return '';
  return `https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/${code.toLowerCase()}.svg`;
}

export function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
}

export function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }) + ' BRT';
}

export function matchStatus(match) {
  const now = new Date();
  const start = new Date(match.date);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  if (match.home_score !== null) return 'done';
  if (now >= start && now <= end) return 'live';
  return 'upcoming';
}
