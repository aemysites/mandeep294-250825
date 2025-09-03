/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import { TransformHook } from './transform.js';

/**
 * Extracts the image URL from a picture element sources
 * @param {HTMLElement} pictureElement - The picture element
 * @returns {string|null} The URL for the largest viewport image, or null if not found
 */
function extractPictureSource(pictureElement) {
  const sources = pictureElement.querySelectorAll('source');

  if (sources.length === 0) {
    return null;
  }

  // Find the source with the largest max-width
  let largestSource = null;
  let largestMaxWidth = -1;

  for (const source of sources) {
    const mediaQuery = source.getAttribute('media');
    if (!mediaQuery) {
      // No media query means it's the largest
      largestSource = source;
      break;
    }

    const match = mediaQuery.match(/max-width:\s*(\d+)px/);
    if (match) {
      const maxWidth = parseInt(match[1], 10);
      if (maxWidth > largestMaxWidth) {
        largestMaxWidth = maxWidth;
        largestSource = source;
      }
    }
  }

  // If no source with max-width found, use the last source
  if (!largestSource) {
    largestSource = sources[sources.length - 1];
  }

  // Extract the first URL from the srcset
  if (largestSource) {
    const srcset = largestSource.getAttribute('srcset');
    if (srcset) {
      const firstUrl = srcset.split(',')[0].trim().split(/\s+/)[0];
      if (firstUrl) {
        return firstUrl;
      }
    }
  }
  return null;
}

function adjustPictureImages(main) {
  const pictures = main.querySelectorAll('picture');
  pictures.forEach((picture) => {
    const img = picture.querySelector('img');
    if (!img || !img.src) {
      const newImg = picture.ownerDocument.createElement('img');
      newImg.src = extractPictureSource(picture);
      if (img) {
        img.replaceWith(newImg);
      } else {
        picture.appendChild(newImg);
      }
    }
  });
}

function adjustImageUrls(main, url, current) {
  [...main.querySelectorAll('img')].forEach((img) => {
    let src = img.getAttribute('src');
    if (src) {
      // handle relative URLs that are not starting with ./ or / or ../
      try {
        /* eslint-disable no-new */
        new URL(src);
      } catch (e) {
        if (!src.startsWith('/')) {
          // enforce transform image url to relative url
          src = `./${src}`;
        }
      }

      try {
        if (src.startsWith('./') || src.startsWith('/') || src.startsWith('../')) {
          // transform relative URLs to absolute URLs
          const targetUrl = new URL(src, url);
          // eslint-disable-next-line no-param-reassign
          img.src = targetUrl.toString();
        } else if (current) {
          // also transform absolute URLs to current host
          const currentSrc = new URL(src);
          const currentUrl = new URL(current);
          if (currentSrc.host === currentUrl.host) {
            // if current host is same than src host, switch src host with url host
            // this is the case for absolutes URLs pointing to the same host
            const targetUrl = new URL(url);
            const newSrc = new URL(`${currentSrc.pathname}${currentSrc.search}${currentSrc.hash}`, `${targetUrl.protocol}//${targetUrl.host}`);
            // eslint-disable-next-line no-param-reassign
            img.src = newSrc.toString();
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(`Unable to adjust image URL ${img.src} - removing image`);
        img.remove();
      }
    }
  });
}

function transformSvgsToPng(main) {
  const svgs = main.querySelectorAll('svg');
  svgs.forEach((svg) => {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
    const img = svg.ownerDocument.createElement('img');
    img.src = svgDataUrl;
    svg.replaceWith(img);
  });
}

export default function transform(hookName, element, { url, originalURL }) {
  if (hookName === TransformHook.beforeTransform) {
    // adjust picture images
    adjustPictureImages(element);
    // adjust image urls
    adjustImageUrls(element, url, originalURL);
    // transform svgs to png
    transformSvgsToPng(element);
  }
}
