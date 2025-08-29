/* global WebImporter */
export default function parse(element, { document }) {
  // Get direct child divs (columns)
  const columns = Array.from(element.querySelectorAll(':scope > div'));
  // Table header: one cell, block name (must match example)
  const headerRow = ['Columns (columns5)'];
  // Table content row: one cell per column div
  const contentRow = columns.map(col => col);
  // Create the table (header row is a single cell, then content row has as many cells as columns)
  const table = WebImporter.DOMUtils.createTable([
    headerRow,
    contentRow
  ], document);
  // Replace original element with the new block table
  element.replaceWith(table);
}
