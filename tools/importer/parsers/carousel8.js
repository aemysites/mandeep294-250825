/* global WebImporter */
export default function parse(element, { document }) {
  // Helper to safely query a descendant by selector, returns null if not found
  function safeQuery(sel, parent = element) {
    return parent.querySelector(sel);
  }

  // 1. Header row as required
  const headerRow = ['Carousel (carousel8)'];

  // 2. Find the image for the first cell
  // The image is nested inside: .imgArea .cmp-image img
  let imgEl = safeQuery('.imgArea .cmp-image img');
  if (!imgEl) {
    imgEl = safeQuery('img');
  }

  // 3. Compose the text content for the second cell
  const textCellContent = [];

  // Title: .itineraryName h2
  const titleEl = safeQuery('.itineraryName h2');
  if (titleEl) {
    textCellContent.push(titleEl.cloneNode(true));
  }

  // Nights: .night .cmp-chip__light span
  const nightsEl = safeQuery('.night .cmp-chip__light span');
  if (nightsEl) {
    const nightsDiv = document.createElement('div');
    nightsDiv.append(nightsEl.cloneNode(true));
    textCellContent.push(nightsDiv);
  }

  // Ship name: .shipName
  const shipNameEl = safeQuery('.shipName');
  if (shipNameEl) {
    const shipDiv = document.createElement('div');
    shipDiv.append(shipNameEl.cloneNode(true));
    textCellContent.push(shipDiv);
  }

  // Departure info: .tripContainer .tripText span (label) and .tripTextDynamic span (value)
  const fromLabel = safeQuery('.tripContainer .tripText span');
  const fromValue = safeQuery('.tripContainer .tripTextDynamic span');
  if (fromLabel && fromValue) {
    const fromDiv = document.createElement('div');
    fromDiv.append(fromLabel.cloneNode(true), fromValue.cloneNode(true));
    textCellContent.push(fromDiv);
  } else if (fromValue) {
    const fromDiv = document.createElement('div');
    fromDiv.append(fromValue.cloneNode(true));
    textCellContent.push(fromDiv);
  }

  // 4. Build the rows array
  const rows = [
    headerRow,
    [imgEl, textCellContent]
  ];

  // 5. Create the table block
  const table = WebImporter.DOMUtils.createTable(rows, document);

  // 6. Replace the original element
  element.replaceWith(table);
}
