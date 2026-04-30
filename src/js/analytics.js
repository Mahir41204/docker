// ============================================
// ANALYTICS.JS — Local Analytics + Continue Reading
// ============================================

const KEYS = {
  BOOKMARKS: 'docker_hub_analytics_bookmarks',
  COMPLETED: 'docker_hub_analytics_completed',
  LAST_VISIT: 'docker_hub_last_visit',
};

/**
 * Safe localStorage wrapper.
 * Falls back silently if localStorage is unavailable.
 */
function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

class AnalyticsManager {
  constructor() {
    this.bookmarkCounts = safeGet(KEYS.BOOKMARKS, {});
    this.completedCounts = safeGet(KEYS.COMPLETED, {});
  }

  // ── Bookmark Analytics ──

  /**
   * Record a bookmark add event for a page.
   * @param {string} pageId
   */
  trackBookmarkAdd(pageId) {
    this.bookmarkCounts[pageId] = (this.bookmarkCounts[pageId] || 0) + 1;
    safeSet(KEYS.BOOKMARKS, this.bookmarkCounts);
  }

  /**
   * Get the N most bookmarked pages.
   * @param {number} n
   * @returns {Array<{page: string, count: number}>}
   */
  getMostBookmarked(n = 5) {
    return Object.entries(this.bookmarkCounts)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, n);
  }

  // ── Completion Analytics ──

  /**
   * Record a section completion event.
   * @param {string} sectionId
   */
  trackCompletion(sectionId) {
    // Extract page slug from sectionId (format: "page/sectionIndex")
    const page = sectionId.split('/')[0];
    this.completedCounts[page] = (this.completedCounts[page] || 0) + 1;
    safeSet(KEYS.COMPLETED, this.completedCounts);
  }

  /**
   * Get the N most completed pages.
   * @param {number} n
   * @returns {Array<{page: string, count: number}>}
   */
  getMostCompleted(n = 5) {
    return Object.entries(this.completedCounts)
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, n);
  }

  // ── Continue Where You Left Off ──

  /**
   * Save the user's current reading position.
   * @param {string} route - Current page route
   * @param {number} scrollTop - Scroll position
   * @param {string} title - Page title
   */
  saveLastVisit(route, scrollTop, title) {
    safeSet(KEYS.LAST_VISIT, {
      route,
      scrollTop,
      title,
      timestamp: Date.now(),
    });
  }

  /**
   * Get the last visit data.
   * Returns null if no previous visit or if data is stale (>7 days).
   * @returns {Object|null}
   */
  getLastVisit() {
    const data = safeGet(KEYS.LAST_VISIT, null);
    if (!data) return null;

    // Expire after 7 days
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - data.timestamp > SEVEN_DAYS) {
      this.clearLastVisit();
      return null;
    }

    return data;
  }

  /**
   * Clear last visit data (e.g., after user dismisses the banner).
   */
  clearLastVisit() {
    try { localStorage.removeItem(KEYS.LAST_VISIT); } catch {}
  }
}

export default AnalyticsManager;
