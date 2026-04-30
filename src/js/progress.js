// ============================================
// PROGRESS.JS — Persistent Progress Tracking
// ============================================
// Features:
//   - Section completion checkboxes (persisted)
//   - Per-page scroll progress tracking (debounced)
//   - Resume scroll position on page revisit
//   - Safe localStorage with in-memory fallback

const STORAGE_KEY = 'docker_hub_progress';
const SCROLL_PREFIX = 'progress_';
const DEBOUNCE_MS = 200;

/**
 * Safe localStorage wrapper with in-memory fallback.
 */
class SafeStorage {
  constructor() {
    this._fallback = new Map();
    this._available = SafeStorage._test();
  }

  static _test() {
    try {
      const k = '__storage_test__';
      localStorage.setItem(k, '1');
      localStorage.removeItem(k);
      return true;
    } catch { return false; }
  }

  get(key, fallback) {
    try {
      if (this._available) {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      }
      return this._fallback.has(key) ? this._fallback.get(key) : fallback;
    } catch { return fallback; }
  }

  set(key, value) {
    try {
      if (this._available) {
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        this._fallback.set(key, value);
      }
    } catch { this._fallback.set(key, value); }
  }
}

class ProgressManager {
  constructor() {
    this.storage = new SafeStorage();
    this.completed = this.storage.get(STORAGE_KEY, {});
    this._scrollHandler = null;
    this._scrollTimer = null;
    this._currentRoute = null;
    this._contentArea = null;
  }

  // ── Section Completion ──

  /**
   * Toggle a section's completion state.
   * @param {string} sectionId
   * @returns {boolean} New completion state
   */
  toggle(sectionId) {
    if (this.completed[sectionId]) {
      delete this.completed[sectionId];
    } else {
      this.completed[sectionId] = Date.now();
    }
    this._save();
    this.updateUI();
    return !!this.completed[sectionId];
  }

  isCompleted(sectionId) {
    return !!this.completed[sectionId];
  }

  getCompletedCount(routeIds) {
    // Count how many completed section keys belong to the given routes
    return Object.keys(this.completed).filter(key => {
      const route = key.split('/')[0];
      return routeIds.includes(route);
    }).length;
  }

  getOverallProgress(allRouteIds) {
    if (!allRouteIds || !allRouteIds.length) return 0;

    // Calculate total sections across all valid routes
    let totalSections = 0;
    if (window.__app && window.__app.pages) {
      Object.keys(window.__app.pages).forEach(route => {
        if (allRouteIds.includes(route)) {
          const page = window.__app.pages[route];
          if (page.sections) {
            totalSections += page.sections.length;
          } else {
            totalSections += 1; // Fallback if a page has no sections
          }
        }
      });
    }

    if (totalSections === 0) return 0;
    
    const completedCount = this.getCompletedCount(allRouteIds);
    return Math.min(100, Math.round((completedCount / totalSections) * 100));
  }

  // ── Per-Page Scroll Progress ──

  /**
   * Start tracking scroll progress for a given route.
   * Attaches a debounced scroll listener to #content-area.
   * @param {string} route
   */
  startScrollTracking(route) {
    this.stopScrollTracking(); // clean up previous

    this._currentRoute = route;
    this._contentArea = document.getElementById('content-area');
    if (!this._contentArea) return;

    this._scrollHandler = () => {
      clearTimeout(this._scrollTimer);
      this._scrollTimer = setTimeout(() => {
        this._recordScrollProgress();
      }, DEBOUNCE_MS);
    };

    this._contentArea.addEventListener('scroll', this._scrollHandler, { passive: true });
  }

  /**
   * Stop tracking scroll and clean up listener to prevent memory leaks.
   */
  stopScrollTracking() {
    if (this._scrollHandler && this._contentArea) {
      this._contentArea.removeEventListener('scroll', this._scrollHandler);
    }
    clearTimeout(this._scrollTimer);
    this._scrollHandler = null;
    this._scrollTimer = null;
  }

  /**
   * Record current scroll position and percentage for the active route.
   */
  _recordScrollProgress() {
    if (!this._contentArea || !this._currentRoute) return;

    const { scrollTop, scrollHeight, clientHeight } = this._contentArea;
    const maxScroll = scrollHeight - clientHeight;
    const scrollPercent = maxScroll > 0 ? Math.round((scrollTop / maxScroll) * 100) : 0;

    this.storage.set(`${SCROLL_PREFIX}${this._currentRoute}`, {
      scrollTop,
      scrollPercent,
      timestamp: Date.now(),
    });
  }

  /**
   * Get the stored scroll progress for a page.
   * @param {string} route
   * @returns {Object|null} { scrollTop, scrollPercent, timestamp }
   */
  getScrollProgress(route) {
    return this.storage.get(`${SCROLL_PREFIX}${route}`, null);
  }

  /**
   * Restore the user's last scroll position for a route.
   * @param {string} route
   * @param {boolean} [smooth=true] - Whether to use smooth scrolling
   */
  restoreScrollPosition(route, smooth = true) {
    const data = this.getScrollProgress(route);
    if (!data || !data.scrollTop) return;

    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;

    // Delay slightly to let content render first
    requestAnimationFrame(() => {
      contentArea.scrollTo({
        top: data.scrollTop,
        behavior: smooth ? 'smooth' : 'auto',
      });
    });
  }

  /**
   * Get the current scroll percentage for the reading progress bar.
   * @returns {number} 0-100
   */
  getCurrentScrollPercent() {
    if (!this._contentArea) return 0;
    const { scrollTop, scrollHeight, clientHeight } = this._contentArea;
    const maxScroll = scrollHeight - clientHeight;
    return maxScroll > 0 ? Math.min(100, Math.round((scrollTop / maxScroll) * 100)) : 0;
  }

  // ── UI Updates ──

  updateUI() {
    // Update section checkboxes
    document.querySelectorAll('.section-complete').forEach(el => {
      const id = el.dataset.sectionId;
      const done = this.isCompleted(id);
      el.classList.toggle('completed', done);

      // ARIA
      el.setAttribute('role', 'checkbox');
      el.setAttribute('aria-checked', String(done));
      el.setAttribute('tabindex', '0');

      const checkbox = el.querySelector('.section-complete__checkbox');
      if (checkbox) checkbox.innerHTML = done ? '✓' : '';

      const label = el.querySelector('.section-complete__label');
      if (label) label.textContent = done ? 'Completed' : 'Mark as completed';
    });

    // Update sidebar progress
    this.updateSidebarProgress();
  }

  updateSidebarProgress() {
    const fill = document.getElementById('progress-fill');
    const label = document.getElementById('progress-label');
    if (!fill || !label) return;

    const allIds = this._getAllSectionIds();
    const pct = this.getOverallProgress(allIds);
    fill.style.width = pct + '%';
    label.textContent = pct + '% complete';

    // ARIA
    const bar = fill.closest('.sidebar__progress-bar');
    if (bar) {
      bar.setAttribute('role', 'progressbar');
      bar.setAttribute('aria-valuenow', String(pct));
      bar.setAttribute('aria-valuemin', '0');
      bar.setAttribute('aria-valuemax', '100');
      bar.setAttribute('aria-label', `Learning progress: ${pct}% complete`);
    }
  }

  _getAllSectionIds() {
    const ids = [];
    document.querySelectorAll('.sidebar__item[data-route], .sidebar__subitem[data-route]').forEach(el => {
      if (el.dataset.route) ids.push(el.dataset.route);
    });
    return ids.length > 0 ? ids : Object.keys(this.completed);
  }

  _save() {
    this.storage.set(STORAGE_KEY, this.completed);
  }
}

export default ProgressManager;
