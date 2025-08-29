/* global WebImporter */
export default function parse(element, { document }) {
  // Header row for the block - matches the example exactly
  const headerRow = ['Carousel (carousel3)'];

  // Extract the image source dynamically from .slider-img[data-bg-image]
  const imgDiv = element.querySelector('.slider-img');
  let imgEl = null;
  if (imgDiv && imgDiv.getAttribute('data-bg-image')) {
    imgEl = document.createElement('img');
    imgEl.src = imgDiv.getAttribute('data-bg-image');
    // ALT text: try to use heading/location if present
    const locHeading = element.querySelector('.slider-heading--location');
    imgEl.alt = locHeading && locHeading.textContent.trim() ? locHeading.textContent.trim() : '';
  }

  // Prepare text cell content - reference existing elements when possible
  const textCellContent = [];
  // Heading (use <h2> as in source and example)
  const heading = element.querySelector('.slider-heading--location');
  if (heading && heading.textContent.trim()) {
    // Reference existing <h2> element if possible
    if (heading.tagName.toLowerCase() === 'h2') {
      textCellContent.push(heading);
    } else {
      // If not h2, create h2 and transfer text
      const h2 = document.createElement('h2');
      h2.textContent = heading.textContent.trim();
      textCellContent.push(h2);
    }
  }
  // Description or additional content: check for a tag under .slider-heading--tag (if not empty)
  const tagContent = element.querySelector('.slider-heading--tag');
  if (tagContent && tagContent.textContent.trim()) {
    textCellContent.push(tagContent);
  }
  // Photo credit
  const credit = element.querySelector('.slider--credit-text');
  if (credit && credit.textContent.trim()) {
    textCellContent.push(credit);
  }

  // Only provide text cell if content exists, else empty string
  const row = [imgEl, textCellContent.length > 0 ? textCellContent : ''];

  // Compose the table rows
  const cells = [headerRow, row];
  const block = WebImporter.DOMUtils.createTable(cells, document);
  element.replaceWith(block);
}
