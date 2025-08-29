/* global WebImporter */
export default function parse(element, { document }) {
  // Find the wrapper containing the picture
  let wrapper = element.querySelector('.flights_stats__wrapper');
  if (!wrapper) wrapper = element;

  // Find the <img> inside the <picture>
  let imgElem = null;
  const picture = wrapper.querySelector('picture');
  if (picture) {
    imgElem = picture.querySelector('img');
  }

  // Compose the table for Columns (columns12)
  // As in the example: header row, then one row with the image in the first column
  const headerRow = ['Columns (columns12)'];
  const contentRow = [imgElem ? imgElem : ''];

  const table = WebImporter.DOMUtils.createTable([
    headerRow,
    contentRow
  ], document);

  // Replace the original element with the new block table
  element.replaceWith(table);
}