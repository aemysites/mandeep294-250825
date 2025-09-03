/* global WebImporter */
export default function parse(element, { document }) {
  if (!element) return;

  // 1. HEADER ROW
  const headerRow = ['Carousel (carousel9)'];

  // 2. SLIDE ROWS
  // Only one slide in this HTML block

  // --- IMAGE CELL ---
  let imgEl = null;
  const imgArea = element.querySelector('.imgArea');
  if (imgArea) {
    imgEl = imgArea.querySelector('img');
  }

  // --- TEXT CELL ---
  const textCellContent = [];

  // Nights and Ship Name
  const nightAndShip = element.querySelector('.nightAndShip');
  if (nightAndShip) {
    // Nights
    const nightChip = nightAndShip.querySelector('.night .cmp-chip__light span');
    if (nightChip) {
      const nightSpan = document.createElement('span');
      nightSpan.textContent = nightChip.textContent;
      nightSpan.style.fontWeight = 'bold';
      textCellContent.push(nightSpan);
    }
    // Ship Name
    const shipName = nightAndShip.querySelector('.shipName');
    if (shipName) {
      const shipSpan = document.createElement('span');
      shipSpan.textContent = shipName.textContent;
      shipSpan.style.marginLeft = '8px';
      textCellContent.push(shipSpan);
    }
  }

  // Title (Heading)
  const itineraryName = element.querySelector('.itineraryName h2');
  if (itineraryName) {
    const heading = document.createElement('h2');
    heading.textContent = itineraryName.textContent;
    textCellContent.push(heading);
  }

  // FROM: Bridgetown
  const tripContainer = element.querySelector('.tripContainer');
  if (tripContainer) {
    // FROM label
    const fromText = tripContainer.querySelector('.tripText .cmp-text span');
    // City
    const cityText = tripContainer.querySelector('.tripTextDynamic .cmp-text span');
    if (fromText && cityText) {
      const fromDiv = document.createElement('div');
      fromDiv.textContent = `${fromText.textContent}${cityText.textContent ? ' ' + cityText.textContent : ''}`;
      textCellContent.push(fromDiv);
    }
  }

  // Compose slide row
  const slideRow = [imgEl, textCellContent];

  // 3. Build table
  const cells = [headerRow, slideRow];
  const blockTable = WebImporter.DOMUtils.createTable(cells, document);

  // 4. Replace element
  element.replaceWith(blockTable);
}
