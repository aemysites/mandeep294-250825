/* global WebImporter */
export default function parse(element, { document }) {
  // Block header as per instructions
  const headerRow = ['Cards (cards9)'];
  const cells = [headerRow];

  // Get all cards in the slider (each .swiper-slide is a card)
  const slides = element.querySelectorAll('.swiper-slide');

  slides.forEach(slide => {
    const card = slide.querySelector('.seo-hotel-strip--item');
    if (!card) return;
    // --- IMAGE CELL ---
    const imageBlock = card.querySelector('.seo-hotel-strip--image-block');
    let imageCell = [];
    if (imageBlock) {
      const img = imageBlock.querySelector('img');
      if (img) imageCell.push(img);
      // Add rating overlay (e.g., "4/5 (926 reviews)") if present
      const ratingOverlay = imageBlock.querySelector('.seo-hotel-strip--rating');
      if (ratingOverlay) imageCell.push(ratingOverlay);
    }

    // --- TEXT CELL ---
    let textCell = [];
    const infoBlock = card.querySelector('.seo-hotel-strip--info');
    if (infoBlock) {
      // Title section
      const titleBlock = infoBlock.querySelector('.seo-hotel-strip--title-block');
      if (titleBlock) {
        const title = titleBlock.querySelector('.seo-hotel-strip--title-block--title');
        if (title && title.textContent.trim()) {
          const titleEl = document.createElement('strong');
          titleEl.textContent = title.textContent;
          textCell.push(titleEl);
        }
        // Location (Delhi)
        const location = titleBlock.querySelector('.seo-hotel-strip--location');
        if (location && location.textContent.trim()) {
          textCell.push(document.createElement('br'));
          textCell.push(location);
        }
        // Stars (number of star icons)
        const stars = titleBlock.querySelector('.seo-hotel-strip--stars');
        if (stars) {
          textCell.push(document.createElement('br'));
          textCell.push(stars);
        }
      }
      // Divider (visual only, ignored for semantic text)
      // Price block
      const priceBlock = infoBlock.querySelector('.seo-hotel-strip--price-block');
      if (priceBlock) {
        const priceWrapper = priceBlock.querySelector('.seo-hotel-strip--price-block--wrapper');
        if (priceWrapper) {
          // Actual price, if present
          const actualPrice = priceWrapper.querySelector('.seo-hotel-strip--price-block--actual-price');
          if (actualPrice && actualPrice.textContent.trim()) {
            textCell.push(document.createElement('br'));
            textCell.push(actualPrice);
          }
          // Hotel price (always present)
          const hotelPrice = priceWrapper.querySelector('.seo-hotel-strip--hotel-price');
          if (hotelPrice && hotelPrice.textContent.trim()) {
            textCell.push(document.createElement('br'));
            textCell.push(hotelPrice);
          }
          // Taxes & fees block
          const taxBlock = priceWrapper.querySelector('.seo-hotel-strip--price-block--tax');
          if (taxBlock) {
            textCell.push(document.createElement('br'));
            textCell.push(taxBlock);
          }
        }
        // CTA (Book button - converted to link)
        const cta = priceBlock.querySelector('.seo-hotel-strip--book-now-cta');
        if (cta && cta.textContent.trim()) {
          textCell.push(document.createElement('br'));
          const a = document.createElement('a');
          a.textContent = cta.textContent;
          a.href = '#'; // No href in source, placeholder
          textCell.push(a);
        }
      }
    }
    // Ensure minimum required fields are present per spec
    if (imageCell.length === 0) return; // must have at least image
    if (textCell.length === 0) return;
    cells.push([imageCell, textCell]);
  });

  // Output the table in place of the original element
  const table = WebImporter.DOMUtils.createTable(cells, document);
  element.replaceWith(table);
}
