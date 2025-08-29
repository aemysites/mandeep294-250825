/* global WebImporter */
export default function parse(element, { document }) {
  // The header row should be a single cell, matching the example
  const headerRow = ['Columns (columns4)'];

  // Extract the immediate child divs as columns
  const columns = Array.from(element.querySelectorAll(':scope > div'));

  // Create the table with the header as a single cell, and the columns row as many cells as found
  const table = WebImporter.DOMUtils.createTable([
    headerRow,
    columns
  ], document);

  element.replaceWith(table);
}
