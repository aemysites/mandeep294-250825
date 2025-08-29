/* global WebImporter */
export default function parse(element, { document }) {
  // Helper to create each card row [image, text]
  function createCardRow(cardEl) {
    // Get the image (always present)
    const img = cardEl.querySelector('img');
    // Get details
    const details = cardEl.querySelector('.card--details');
    const textContent = [];
    // Title (h2)
    if (details) {
      const title = details.querySelector('.card--title');
      if (title) {
        const h = document.createElement('strong');
        h.textContent = title.textContent.trim();
        textContent.push(h);
      }
      // Description (p) - only for Safdarjung Tomb
      const desc = details.querySelector('.card--description');
      if (desc && desc.textContent.trim()) {
        textContent.push(document.createElement('br'));
        textContent.push(document.createTextNode(desc.textContent.trim()));
      }
      // Info (span) - Exploration time, always present
      const info = details.querySelector('.card--info');
      if (info) {
        textContent.push(document.createElement('br'));
        const span = document.createElement('span');
        span.textContent = info.textContent.trim();
        textContent.push(span);
      }
    }
    // Ribbon/marker (for Trending only)
    const ribbon = cardEl.querySelector('.ribbon');
    if (ribbon && ribbon.textContent.trim()) {
      // Put ribbon at the top, styled bold orange
      const markerSpan = document.createElement('span');
      markerSpan.textContent = ribbon.textContent.trim();
      markerSpan.style.fontWeight = 'bold';
      markerSpan.style.color = 'darkorange';
      markerSpan.style.display = 'block';
      textContent.unshift(markerSpan);
      textContent.unshift(document.createElement('br'));
    }
    // Remove leading br if present
    if (textContent.length && textContent[0].tagName === 'BR') textContent.shift();
    return [img, textContent];
  }

  // Collect all card elements (main and extra)
  const cards = [];
  const mainCards = element.querySelectorAll('.card-container .card-main-container .card');
  const extraCards = element.querySelectorAll('.card-extra-container .card-extra');
  mainCards.forEach(cardEl => cards.push(cardEl));
  extraCards.forEach(cardEl => cards.push(cardEl));

  // Table header matches example
  const headerRow = ['Cards (cards8)'];
  const rows = cards.map(createCardRow);
  const cells = [headerRow, ...rows];

  // Create the block table using referenced elements
  const table = WebImporter.DOMUtils.createTable(cells, document);
  element.replaceWith(table);
}
