import { init as initRouter } from './router.js';
import { icons } from './icons.js';

const NAV_LINKS = [
  { label: 'Início',      route: '/' },
  { label: 'Grupos',      route: '/grupos' },
  { label: 'Calendário',  route: '/calendario' },
  { label: 'Seleções',    route: '/selecoes' },
  { label: 'Histórico',   route: '/historico' },
  { label: 'Chave',       route: '/chave' },
];

function linksHTML(cls = 'nav-link') {
  return NAV_LINKS.map(l =>
    `<a class="${cls}" href="#${l.route}" data-route="${l.route}">${l.label}</a>`
  ).join('');
}

function renderNav() {
  document.getElementById('navbar').innerHTML = `
    <div class="nav-inner">
      <a class="nav-logo" href="#/" aria-label="Copa do Mundo 2026 · Início">
        ${icons.trophy} <div><div>COPA 2026</div><span>FIFA World Cup</span></div>
      </a>
      <nav class="nav-links" role="navigation" aria-label="Navegação principal">
        ${linksHTML()}
      </nav>
      <button class="nav-hamburger" id="nav-hamburger" aria-label="Abrir menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
    <nav class="nav-mobile" id="nav-mobile" role="navigation" aria-label="Menu mobile">
      ${linksHTML()}
    </nav>`;

  const btn  = document.getElementById('nav-hamburger');
  const menu = document.getElementById('nav-mobile');

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('#navbar')) {
      menu.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
    }
  });

  document.querySelectorAll('.nav-mobile .nav-link').forEach(l => {
    l.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
    });
  });
}

function updateActiveLinks(path) {
  document.querySelectorAll('.nav-link[data-route]').forEach(l => {
    l.classList.toggle('active', l.dataset.route === path);
  });
}

function renderFooter() {
  document.getElementById('footer').innerHTML = `
    <div class="footer-inner">
      <div class="footer-logo">${icons.trophy} COPA 2026</div>
      <p>FIFA World Cup 2026 · EUA · México · Canadá · 11 Jun – 19 Jul 2026</p>
      <p style="margin-top:8px;font-size:0.75rem;opacity:0.6">Projeto de demonstração · Dados: FIFA / Kaggle</p>
    </div>`;
}

renderNav();
renderFooter();
initRouter(document.getElementById('app'), updateActiveLinks);
