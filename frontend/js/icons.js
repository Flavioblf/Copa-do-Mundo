const svg = d =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

export const icons = {

  // Taça da Copa
  trophy: svg(
    `<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>` +
    `<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>` +
    `<path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>` +
    `<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>` +
    `<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>` +
    `<path d="M4 22h16"/>`
  ),

  // Bola de futebol (costuras curvas)
  ball: svg(
    `<circle cx="12" cy="12" r="10"/>` +
    `<path d="M5 4.5C7 7 8 9.5 8 12s-1 5-3 7.5"/>` +
    `<path d="M19 4.5C17 7 16 9.5 16 12s1 5 3 7.5"/>` +
    `<path d="M2 9.5c3 1.5 6.5 2.5 10 2.5s7-1 10-2.5"/>` +
    `<path d="M2 14.5c3-1.5 6.5-2.5 10-2.5s7 1 10 2.5"/>`
  ),

  // Grupos / Tabela classificatória
  groups: svg(
    `<rect x="3" y="3" width="18" height="18" rx="2"/>` +
    `<path d="M3 9h18M3 15h18M9 3v18"/>`
  ),

  // Calendário com ponto de evento
  calendar: svg(
    `<rect x="3" y="4" width="18" height="18" rx="2"/>` +
    `<path d="M16 2v4M8 2v4M3 10h18"/>` +
    `<circle cx="8" cy="15" r="1" fill="currentColor" stroke="none"/>` +
    `<circle cx="12" cy="15" r="1" fill="currentColor" stroke="none"/>` +
    `<circle cx="16" cy="15" r="1" fill="currentColor" stroke="none"/>`
  ),

  // Seleções / Globo
  globe: svg(
    `<circle cx="12" cy="12" r="10"/>` +
    `<path d="M2 12h20"/>` +
    `<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>`
  ),

  // Chave / Mata-mata (bracket)
  bracket: svg(
    `<rect x="1" y="4" width="5" height="3" rx="0.5"/>` +
    `<rect x="1" y="14" width="5" height="3" rx="0.5"/>` +
    `<path d="M6 5.5H9M6 15.5H9M9 5.5v10M9 10.5H13"/>` +
    `<rect x="13" y="8.5" width="5" height="4" rx="0.5"/>` +
    `<path d="M18 10.5H23"/>`
  ),

  // Camisa / Seleção (Brasil)
  jersey: svg(
    `<path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>`
  ),
};
