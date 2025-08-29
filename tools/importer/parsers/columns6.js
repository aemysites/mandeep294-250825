/* global WebImporter */
export default function parse(element, { document }) {
  // Get immediate child divs, representing columns
  const columns = Array.from(element.querySelectorAll(':scope > div'));
  if (columns.length === 0) return;

  // Build the table manually to ensure the header row is a single cell spanning all columns
  const table = document.createElement('table');

  // Header row: one <th> that spans all columns
  const headerTr = document.createElement('tr');
  const headerTh = document.createElement('th');
  headerTh.textContent = 'Columns (columns6)';
  if (columns.length > 1) {
    headerTh.setAttribute('colspan', columns.length);
  }
  headerTr.appendChild(headerTh);
  table.appendChild(headerTr);

  // Content row: each column's div in its own <td>
  const contentTr = document.createElement('tr');
  columns.forEach((col) => {
    const td = document.createElement('td');
    td.appendChild(col);
    contentTr.appendChild(td);
  });
  table.appendChild(contentTr);

  element.replaceWith(table);
}
