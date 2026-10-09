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
 * Sets an existing meta tag or creates one if it doesn't exist.
 * @param {string} attrName ('name' or 'property')
 * @param {string} attrVal (e.g. 'description', 'og:title')
 * @param {string} content 
 */
function setOrCreateMeta(attrName, attrVal, content) {
  if (content === undefined || content === null) return;
  let tag = document.querySelector(`meta[${attrName}="${attrVal}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attrName, attrVal);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

/**
 * Dynamically updates primary HTML meta tags, Open Graph tags, and Twitter Card tags.
 * @param {Object} metadata
 * @param {string} metadata.title
 * @param {string} metadata.description
 * @param {string} metadata.keywords
 * @param {string} [metadata.image]
 * @param {string} [metadata.url]
 * @param {string} [metadata.type]
 */
export function updateSEOMetadata({ title, description, keywords, image, url, type = 'article' }) {
  if (title) {
    document.title = title;
    setOrCreateMeta('name', 'title', title);
    setOrCreateMeta('property', 'og:title', title);
    setOrCreateMeta('name', 'twitter:title', title);
  }

  if (description) {
    setOrCreateMeta('name', 'description', description);
    setOrCreateMeta('property', 'og:description', description);
    setOrCreateMeta('name', 'twitter:description', description);
  }

  if (keywords) {
    setOrCreateMeta('name', 'keywords', keywords);
  }

  if (image) {
    setOrCreateMeta('property', 'og:image', image);
    setOrCreateMeta('name', 'twitter:image', image);
  }

  if (url) {
    setOrCreateMeta('property', 'og:url', url);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  }

  setOrCreateMeta('property', 'og:type', type);
  setOrCreateMeta('name', 'twitter:card', 'summary_large_image');
}

/**
 * Injects a JSON-LD structured schema script in the head, replacing any existing ones.
 * @param {Object|Object[]} schema
 */
export function injectJSONLD(schema) {
  if (!schema) return;
  // Remove existing JSON-LD scripts to avoid duplication
  const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
  existingScripts.forEach(script => script.remove());

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schema);
  document.getElementsByTagName('head')[0].appendChild(script);
}

/**
 * Generates Google BlogPosting JSON-LD schema for articles
 * @param {Object} blog
 * @returns {Object}
 */
export function generateBlogPostingSchema(blog) {
  if (!blog) return null;
  const cleanDesc = blog.metaDescription || (blog.content ? blog.content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 160) : '');
  const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://neoparlour.com/blogs/${blog.slug || blog.id}`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.metaTitle || blog.title,
    "description": cleanDesc,
    "image": blog.imageUrl ? [blog.imageUrl] : [],
    "datePublished": blog.createdAt || new Date().toISOString(),
    "dateModified": blog.updatedAt || blog.createdAt || new Date().toISOString(),
    "author": {
      "@type": "Person",
      "name": blog.author || "NeoParlour Editorial Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "NeoParlour",
      "logo": {
        "@type": "ImageObject",
        "url": "https://neoparlour.com/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": pageUrl
    }
  };
}
