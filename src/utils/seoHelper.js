/**
 * Generates a clean URL slug from a salon name and city.
 * @param {string} name 
 * @param {string} city 
 * @returns {string}
 */
export function generateSalonSlug(name, city) {
  const cleanName = (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const cleanCity = (city || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${cleanName}-${cleanCity}`;
}

/**
 * Dynamically updates primary HTML meta tags.
 * @param {Object} metadata
 * @param {string} metadata.title
 * @param {string} metadata.description
 * @param {string} metadata.keywords
 */
export function updateSEOMetadata({ title, description, keywords }) {
  if (title) {
    document.title = title;
    
    // Update og:title and twitter:title
    const titleTags = [
      document.querySelector('meta[name="title"]'),
      document.querySelector('meta[property="og:title"]'),
      document.querySelector('meta[name="twitter:title"]')
    ];
    titleTags.forEach(tag => {
      if (tag) tag.setAttribute('content', title);
    });
  }

  if (description) {
    const descTags = [
      document.querySelector('meta[name="description"]'),
      document.querySelector('meta[property="og:description"]'),
      document.querySelector('meta[name="twitter:description"]')
    ];
    descTags.forEach(tag => {
      if (tag) tag.setAttribute('content', description);
    });
  }

  if (keywords) {
    const keywordsTag = document.querySelector('meta[name="keywords"]');
    if (keywordsTag) {
      keywordsTag.setAttribute('content', keywords);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = keywords;
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
  }
}

/**
 * Injects a JSON-LD structured schema script in the head, replacing any existing ones.
 * @param {Object|Object[]} schema
 */
export function injectJSONLD(schema) {
  // Remove existing JSON-LD scripts to avoid duplication
  const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
  existingScripts.forEach(script => script.remove());

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schema);
  document.getElementsByTagName('head')[0].appendChild(script);
}
