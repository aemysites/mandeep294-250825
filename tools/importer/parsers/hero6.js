/* global WebImporter */
export default function parse(element, { document }) {
  // Table header
  const headerRow = ['Hero (hero6)'];

  // 2nd row: Background Image (optional)
  const img = element.querySelector('img');
  const imageRow = [img ? img : ''];

  // 3rd row: Title (heading), Subheading, Call-to-Action (optional)
  // Title: Itinerary name (h2)
  const title = element.querySelector('.itineraryName h2');
  // Subheading: Nights chip and ship name
  const nightsChip = element.querySelector('.night .cmp-chip__light');
  const shipName = element.querySelector('.shipName');
  // Origin: FROM: ...
  const tripOrigin = element.querySelector('.tripContainer');

  // Compose content cell
  const contentCell = document.createElement('div');
  if (title) {
    const h1 = document.createElement('h1');
    h1.textContent = title.textContent.trim();
    contentCell.appendChild(h1);
  }
  if (nightsChip || shipName) {
    const subheading = document.createElement('div');
    if (nightsChip) subheading.appendChild(nightsChip.cloneNode(true));
    if (shipName) subheading.appendChild(shipName.cloneNode(true));
    contentCell.appendChild(subheading);
  }
  if (tripOrigin) {
    contentCell.appendChild(tripOrigin.cloneNode(true));
  }

  const contentRow = [contentCell.childNodes.length ? contentCell : ''];

  const cells = [
    headerRow,
    imageRow,
    contentRow,
  ];

  const block = WebImporter.DOMUtils.createTable(cells, document);
  element.replaceWith(block);
}
