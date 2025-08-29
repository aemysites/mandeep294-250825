/* global WebImporter */
export default function parse(element, { document }) {
  // Helper: Remove all class attributes for clean output
  function stripClass(el) {
    if (!el) return;
    if (el.removeAttribute) el.removeAttribute('class');
    if (el.querySelectorAll) {
      el.querySelectorAll('[class]').forEach(e => e.removeAttribute('class'));
    }
  }

  // --- Row 1, Col 1: Footer menus (all headings/links) ---
  const menuSection = element.querySelector('.details');
  let menuCol = document.createElement('div');
  if (menuSection) {
    const accordionContainers = menuSection.querySelectorAll('.accordion_container');
    accordionContainers.forEach(container => {
      const label = container.querySelector('.accordion-panel-label');
      if (label) {
        const h4 = document.createElement('h4');
        h4.textContent = label.textContent.trim();
        menuCol.appendChild(h4);
      }
      const list = container.querySelector('ul');
      if (list) {
        stripClass(list);
        menuCol.appendChild(list);
      }
    });
  }

  // --- Row 1, Col 2: Awards block (heading + images/text) ---
  const awardsSection = element.querySelector('.awards-section');
  let awardsCol = document.createElement('div');
  if (awardsSection) {
    const heading = awardsSection.querySelector('.award-section-heading');
    if (heading) {
      const h4 = document.createElement('h4');
      h4.textContent = heading.textContent.trim();
      awardsCol.appendChild(h4);
    }
    const desc = awardsSection.querySelector('.award-section_description');
    if (desc) {
      const descClone = desc.cloneNode(true);
      stripClass(descClone);
      awardsCol.appendChild(descClone);
    }
  }

  // --- Row 2, Col 1: QR code image from download app block ---
  const socialSection = element.querySelector('.social-links');
  let qrCol = document.createElement('div');
  if (socialSection) {
    const qr = socialSection.querySelector('.barcode-download-app');
    if (qr) {
      qrCol.appendChild(qr);
    }
  }

  // --- Row 2, Col 2: Social/media + download app (NO QR image) ---
  let socialCol = document.createElement('div');
  if (socialSection) {
    const socialBlocks = socialSection.querySelectorAll('.social-links_icons');
    socialBlocks.forEach(block => {
      const socialTitle = block.querySelector('.social-title');
      // Social Media block
      if (socialTitle && /social media/i.test(socialTitle.textContent)) {
        const clone = block.cloneNode(true);
        stripClass(clone);
        socialCol.appendChild(clone);
      }
      // Download App block (but remove QR code img)
      if (socialTitle && /download app/i.test(socialTitle.textContent)) {
        const clone = block.cloneNode(true);
        const qrImg = clone.querySelector('.barcode-download-app');
        if (qrImg) qrImg.remove();
        stripClass(clone);
        socialCol.appendChild(clone);
      }
    });
  }

  // Build the structure to match exactly the example: header, two rows of two columns each
  const cells = [
    ['Columns (columns13)'],
    [menuCol, awardsCol],
    [qrCol, socialCol]
  ];
  const block = WebImporter.DOMUtils.createTable(cells, document);
  element.replaceWith(block);
}
