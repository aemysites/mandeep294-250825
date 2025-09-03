/* global WebImporter */
export default function parse(element, { document }) {
  // Defensive: find the main grid containing the search bar and filters
  const grid = element.querySelector('.aem-Grid');
  if (!grid) return;

  // Get all direct children columns (each filter/button is a column visually)
  // Only consider direct children that are columns (ignore .cmp-button__all-filters etc)
  const columns = Array.from(grid.children).filter((col) => {
    // Only keep columns that are visible in the main row (ignore wrappers, etc)
    // These are: text (title), facetfilter (destination), facetfilter (port), datefilter, searchbutton
    const classList = col.className || '';
    return (
      classList.includes('cmp-text__negative') ||
      classList.includes('facetfilter') ||
      classList.includes('datefilter') ||
      classList.includes('searchbutton')
    );
  });

  // Compose the columns for the second row
  // 1. Title (Find your cruise)
  // 2. Where? (Any destination)
  // 3. Which port? (Any port)
  // 4. When? (Any date)
  // 5. Search now button

  // Defensive: Only proceed if we have at least 5 columns
  if (columns.length < 5) return;

  // Compose the cells for the second row
  const contentRow = [
    columns[0], // Title (Find your cruise)
    columns[1], // Where? (Any destination)
    columns[2], // Which port? (Any port)
    columns[3], // When? (Any date)
    columns[4], // Search now button
  ];

  // Build the table
  const headerRow = ['Columns (columns2)'];
  const table = WebImporter.DOMUtils.createTable([
    headerRow,
    contentRow,
  ], document);

  // Replace the original element with the new table
  element.replaceWith(table);
}
