/* global WebImporter */
export default function parse(element, { document }) {
  // Header row exactly as specified
  const headerRow = ['Cards (cards10)'];
  const cells = [headerRow];

  // Locate the swiper carousel block
  const swiper = element.querySelector('.swiper');
  if (!swiper) {
    // If no carousel, do nothing
    return;
  }

  // Find all card slides
  const slides = swiper.querySelectorAll('.swiper-slide');
  slides.forEach(slide => {
    const card = slide.querySelector('.image-carousel--card');
    if (!card) return;

    // Image: reference the <img> element directly
    let img = '';
    const imgContainer = card.querySelector('.image-carousel--img-container');
    if (imgContainer) {
      const foundImg = imgContainer.querySelector('img');
      if (foundImg) {
        img = foundImg;
      }
    }

    // Title: use a <strong> element for semantic heading, as in example
    let textCell;
    const contentContainer = card.querySelector('.image-carousel--content-container');
    if (contentContainer) {
      const titleElem = contentContainer.querySelector('.title');
      if (titleElem && titleElem.textContent.trim()) {
        const strong = document.createElement('strong');
        strong.textContent = titleElem.textContent.trim();
        textCell = strong;
      } else {
        // fallback empty
        textCell = document.createTextNode('');
      }
    } else {
      textCell = document.createTextNode('');
    }

    cells.push([img, textCell]);
  });

  // Create and replace with the new block table
  const table = WebImporter.DOMUtils.createTable(cells, document);
  element.replaceWith(table);
}
