// ============================================
// SEO.JS — Dynamic SEO Meta Tag Manager
// ============================================

const DOMAIN = 'https://docker-learning-hub.com';

class SEOManager {
  constructor() {
    this._ensureMetaTags();
  }

  /**
   * Ensure all required meta tags exist in <head>.
   * Creates them if missing so we can update them dynamically.
   */
  _ensureMetaTags() {
    const metaDefs = [
      { attr: 'name', key: 'description' },
      { attr: 'property', key: 'og:title' },
      { attr: 'property', key: 'og:description' },
      { attr: 'property', key: 'og:image' },
      { attr: 'property', key: 'og:type' },
      { attr: 'property', key: 'og:url' },
      { attr: 'name', key: 'twitter:card' },
      { attr: 'name', key: 'twitter:title' },
      { attr: 'name', key: 'twitter:description' },
    ];

    metaDefs.forEach(({ attr, key }) => {
      if (!document.querySelector(`meta[${attr}="${key}"]`)) {
        const meta = document.createElement('meta');
        meta.setAttribute(attr, key);
        meta.setAttribute('content', '');
        document.head.appendChild(meta);
      }
    });

    // Canonical link
    if (!document.querySelector('link[rel="canonical"]')) {
      const link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', DOMAIN);
      document.head.appendChild(link);
    }
  }

  /**
   * Update all SEO meta tags for a given page.
   * @param {Object} opts
   * @param {string} opts.title - Page title
   * @param {string} opts.description - Page description
   * @param {string} opts.route - Current route slug
   * @param {string} [opts.image] - OG image URL
   * @param {string} [opts.type] - OG type (default: 'article')
   */
  update({ title, description, route, image, type }) {
    const fullTitle = title
      ? `${title} — Docker Learning Hub`
      : 'Docker Learning Hub — Master Containerization';

    const desc = description || 'A comprehensive learning platform for Docker and containerization.';
    const pageUrl = `${DOMAIN}/#${route || ''}`;
    const ogImage = image || `${DOMAIN}/favicon-512.png`;
    const ogType = type || 'article';

    // Document title
    document.title = fullTitle;

    // Standard meta
    this._setMeta('name', 'description', desc);

    // Open Graph
    this._setMeta('property', 'og:title', fullTitle);
    this._setMeta('property', 'og:description', desc);
    this._setMeta('property', 'og:image', ogImage);
    this._setMeta('property', 'og:type', ogType);
    this._setMeta('property', 'og:url', pageUrl);

    // Twitter Card
    this._setMeta('name', 'twitter:card', 'summary_large_image');
    this._setMeta('name', 'twitter:title', fullTitle);
    this._setMeta('name', 'twitter:description', desc);

    // Canonical
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', pageUrl);
  }

  /**
   * Set a meta tag's content attribute.
   * @param {string} attr - 'name' or 'property'
   * @param {string} key - The meta tag identifier
   * @param {string} value - Content value
   */
  _setMeta(attr, key, value) {
    const el = document.querySelector(`meta[${attr}="${key}"]`);
    if (el) el.setAttribute('content', value);
  }
}

export default SEOManager;
