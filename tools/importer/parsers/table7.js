/* global WebImporter */
export default function parse(element, { document }) {
  // The header row: single column with the block name
  const headerRow = ['Table (table7)'];

  // The data row: multi-column, each column is one of the element's children
  const columns = Array.from(element.children);
  const dataRow = columns;

  // Build the table structure: header row (one cell), then data row (multiple cells)
  const table = WebImporter.DOMUtils.createTable([
    headerRow,
    dataRow
  ], document);

  element.replaceWith(table);
}
