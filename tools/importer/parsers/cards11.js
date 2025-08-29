/* global WebImporter */
export default function parse(element, { document }) {
  // Header row as per block name
  const headerRow = ['Cards (cards11)'];
  const rows = [];
  // Find the swiper-wrapper containing all slides/cards
  const wrapper = element.querySelector('.swiper-wrapper');
  if (!wrapper) return;
  const slides = wrapper.querySelectorAll('.swiper-slide');
  slides.forEach((slide) => {
    // Each slide has .services-carousel--card
    const card = slide.querySelector('.services-carousel--card');
    if (!card) return;
    // 1st column: image (reference existing <img> element)
    const imgEl = card.querySelector('.services-carousel--img-container img');
    // 2nd column: text (title as <strong> + description text)
    const contentContainer = card.querySelector('.services-carousel--content-container');
    const textContent = [];
    if (contentContainer) {
      // Title
      const title = contentContainer.querySelector('.title');
      if (title && title.textContent.trim()) {
        const strong = document.createElement('strong');
        strong.textContent = title.textContent.trim();
        textContent.push(strong);
        // Add <br> only if description exists
        if (contentContainer.querySelector('.description')) {
          textContent.push(document.createElement('br'));
        }
      }
      // Description
      const description = contentContainer.querySelector('.description');
      if (description && description.textContent.trim()) {
        // Reference the existing description element directly
        textContent.push(description);
      }
    }
    rows.push([imgEl, textContent]);
  });
  const cells = [headerRow, ...rows];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  element.replaceWith(table);
}
