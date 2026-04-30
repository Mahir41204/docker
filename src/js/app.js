// ============================================
// APP.JS — Main SPA Controller
// ============================================
// Wires together: Router, Renderer, Search,
// KeyboardShortcuts, Analytics, SEO, Progress, Bookmarks

import Router from './router.js';
import Renderer from './renderer.js';
import SearchEngine from './search.js';
import KeyboardShortcutManager from './keyboard-shortcuts.js';
import AnalyticsManager from './analytics.js';
import { quickNotes } from '../data/quick-notes.js';
import { overview } from '../data/overview.js';
import { levels } from '../data/levels.js';
import { compose } from '../data/compose.js';
import { features } from '../data/features.js';
import { tools } from '../data/tools.js';
import { integrations } from '../data/integrations.js';
import { guides } from '../data/guides.js';
import { systemDesign } from '../data/system-design.js';
import { mistakes } from '../data/mistakes.js';
import { glossary } from '../data/glossary.js';
import { resources } from '../data/resources.js';
import { implementation } from '../data/implementation.js';
import { languages } from '../data/languages.js';

class App {
  constructor() {
    this.router = new Router();
    this.renderer = new Renderer();
    this.search = new SearchEngine();
    this.analytics = new AnalyticsManager();
    this.shortcuts = null;

    // All pages registry
    this.pages = {
      'quick-notes': quickNotes,
      'overview': overview,
      'level-0': levels['level-0'],
      'level-1': levels['level-1'],
      'level-2': levels['level-2'],
      'level-3': levels['level-3'],
      'level-4': levels['level-4'],
      'compose': compose,
      'features': features,
      'tools': tools,
      'integrations': integrations,
      'guides': guides,
      'system-design': systemDesign,
      'mistakes': mistakes,
      'glossary': glossary,
      'resources': resources,
      'implementation': implementation,
      'languages': languages
    };

    // Expose to global for onclick handlers
    window.__app = this;
  }

  init() {
    // Build search index
    this.search.buildIndex(this.pages);

    // Register routes
    Object.keys(this.pages).forEach(route => {
      this.router.register(route, () => this.loadPage(route));
    });

    // Route change handler
    this.router.onRouteChange = (hash, route) => {
      this.updateSidebar(route);
      this.updateBreadcrumb(route);

      // Track last visit for "Continue where you left off"
      const page = this.pages[route];
      if (page) {
        this.analytics.saveLastVisit(route, 0, page.title || route);
      }
    };

    // Initialize search
    this.initSearch();

    // Initialize sidebar
    this.initSidebar();

    // Initialize bookmarks panel
    this.initBookmarksPanel();

    // Initialize Theme Toggle
    this.initThemeToggle();

    // Initialize keyboard shortcuts
    this.initKeyboardShortcuts();

    // Start router
    this.router.init();

    // Update progress on load
    this.renderer.progress.updateSidebarProgress();

    // Show "Continue where you left off" if applicable
    this._showContinueReading();
  }

  initThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    // Check localStorage or system preference
    const savedTheme = localStorage.getItem('docker-hub-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.setAttribute('data-theme', 'dark');
      toggle.checked = true;
    } else {
      document.documentElement.removeAttribute('data-theme');
      toggle.checked = false;
    }

    toggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('docker-hub-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('docker-hub-theme', 'light');
      }
    });
  }

  loadPage(route) {
    const page = this.pages[route];
    if (page) {
      this.renderer.render(page, route);
    }
  }

  // --- Keyboard Shortcuts ---
  initKeyboardShortcuts() {
    this.shortcuts = new KeyboardShortcutManager({
      onSearch: () => {
        const input = document.getElementById('search-input');
        if (input) {
          input.focus();
          input.select();
        }
      },
      onEscape: () => {
        // Close bookmarks panel
        this.renderer.bookmarks.closePanel();

        // Blur search and close results
        const input = document.getElementById('search-input');
        const results = document.getElementById('search-results');
        if (input && document.activeElement === input) {
          input.blur();
        }
        if (results) results.classList.remove('visible');
      },
    });
    this.shortcuts.init();
  }

  // --- Sidebar ---
  initSidebar() {
    // Expandable items with ARIA
    document.querySelectorAll('.sidebar__item[data-expand]').forEach(item => {
      const targetId = item.dataset.expand;
      const target = document.getElementById(targetId);

      // Set initial ARIA state
      item.setAttribute('role', 'button');
      item.setAttribute('aria-expanded', target?.classList.contains('open') ? 'true' : 'false');
      item.setAttribute('aria-controls', targetId);
      item.setAttribute('tabindex', '0');

      item.addEventListener('click', () => {
        if (target) {
          target.classList.toggle('open');
          const isOpen = target.classList.contains('open');
          item.setAttribute('aria-expanded', String(isOpen));
          const arrow = item.querySelector('.sidebar__toggle-expand');
          if (arrow) arrow.classList.toggle('rotated', isOpen);
        }
      });

      // Keyboard support
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          item.click();
        }
      });
    });

    // Navigable items
    document.querySelectorAll('.sidebar__item[data-route]').forEach(item => {
      item.setAttribute('role', 'link');
      item.setAttribute('tabindex', '0');
      item.addEventListener('click', () => {
        this.router.navigate(item.dataset.route);
        this.closeMobileSidebar();
      });
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          item.click();
        }
      });
    });

    document.querySelectorAll('.sidebar__subitem[data-route]').forEach(item => {
      item.setAttribute('role', 'link');
      item.setAttribute('tabindex', '0');
      item.addEventListener('click', () => {
        this.router.navigate(item.dataset.route);
        this.closeMobileSidebar();
      });
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          item.click();
        }
      });
    });

    // Mobile hamburger with ARIA
    const hamburger = document.getElementById('hamburger');
    const overlay = document.getElementById('sidebar-overlay');
    const sidebar = document.querySelector('.sidebar');

    if (hamburger) {
      hamburger.addEventListener('click', () => {
        const isOpen = sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('visible', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
      });
    }
    if (overlay) {
      overlay.addEventListener('click', () => this.closeMobileSidebar());
    }
  }

  closeMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const hamburger = document.getElementById('hamburger');

    sidebar?.classList.remove('mobile-open');
    overlay?.classList.remove('visible');
    hamburger?.setAttribute('aria-expanded', 'false');
  }

  updateSidebar(route) {
    document.querySelectorAll('.sidebar__item, .sidebar__subitem').forEach(el => {
      el.classList.remove('active');
      el.removeAttribute('aria-current');
    });

    const active = document.querySelector(`[data-route="${route}"]`);
    if (active) {
      active.classList.add('active');
      active.setAttribute('aria-current', 'page');

      // Expand parent if sub-item
      const parent = active.closest('.sidebar__subitems');
      if (parent) {
        parent.classList.add('open');
        const expander = parent.previousElementSibling;
        if (expander) {
          expander.setAttribute('aria-expanded', 'true');
          const toggle = expander.querySelector('.sidebar__toggle-expand');
          if (toggle) toggle.classList.add('rotated');
        }
      }
    }
  }

  updateBreadcrumb(route) {
    const bc = document.getElementById('breadcrumb');
    if (!bc) return;
    const page = this.pages[route];
    const title = page?.title || route;
    bc.innerHTML = `
      <span>docker-hub</span>
      <span class="topbar__breadcrumb-sep">/</span>
      <span class="topbar__breadcrumb-current">${title}</span>
    `;
  }

  // --- Search ---
  initSearch() {
    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');
    if (!input || !results) return;

    let debounce;
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        const q = input.value.trim();
        if (q.length < 2) {
          results.classList.remove('visible');
          input.setAttribute('aria-expanded', 'false');
          return;
        }
        const hits = this.search.search(q);
        this.renderSearchResults(hits, results);
        input.setAttribute('aria-expanded', 'true');
      }, 200);
    });

    input.addEventListener('focus', () => {
      if (input.value.trim().length >= 2) {
        results.classList.add('visible');
        input.setAttribute('aria-expanded', 'true');
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.sidebar__search')) {
        results.classList.remove('visible');
        input.setAttribute('aria-expanded', 'false');
      }
    });
  }

  renderSearchResults(hits, container) {
    if (hits.length === 0) {
      container.innerHTML = '<div class="search-results__empty" role="option">No results found</div>';
    } else {
      container.innerHTML = hits.map((h, i) => `
        <div class="search-results__item"
             role="option"
             id="search-result-${i}"
             tabindex="0"
             onclick="window.location.hash='${h.route}'"
             onkeydown="if(event.key==='Enter')window.location.hash='${h.route}'">
          <div class="search-results__title">${h.icon} ${h.title}</div>
          <div class="search-results__snippet">${h.snippet}</div>
        </div>
      `).join('');
    }
    container.classList.add('visible');
  }

  // --- Bookmarks ---
  initBookmarksPanel() {
    const closeBtn = document.getElementById('bookmarks-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.renderer.bookmarks.closePanel());
    }
  }

  toggleBookmark(id, title, section) {
    const added = this.renderer.bookmarks.toggle(id, title, section);
    // Track in analytics
    if (added) {
      this.analytics.trackBookmarkAdd(id);
    }
  }

  toggleBookmarksPanel() {
    this.renderer.bookmarks.togglePanel();
  }

  // --- Progress ---
  toggleProgress(sectionId) {
    const completed = this.renderer.progress.toggle(sectionId);
    // Track in analytics
    if (completed) {
      this.analytics.trackCompletion(sectionId);
    }
  }

  // --- Code Copy ---
  copyCode(btn) {
    const codeBlock = btn.closest('.code-block');
    const code = codeBlock.querySelector('code').textContent;
    navigator.clipboard.writeText(code).then(() => {
      btn.textContent = 'copied!';
      btn.classList.add('copied');
      btn.setAttribute('aria-label', 'Code copied!');
      setTimeout(() => {
        btn.textContent = 'copy';
        btn.classList.remove('copied');
        btn.setAttribute('aria-label', 'Copy code to clipboard');
      }, 2000);
    });
  }

  // --- Continue Where You Left Off ---
  _showContinueReading() {
    const lastVisit = this.analytics.getLastVisit();
    if (!lastVisit) return;

    // Don't show if we're already on that page
    const currentRoute = this.router.getCurrentRoute();
    if (currentRoute === lastVisit.route) return;

    // Don't show if it's the default page
    if (lastVisit.route === 'overview') return;

    // Create banner
    const banner = document.createElement('div');
    banner.className = 'continue-banner';
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');
    banner.innerHTML = `
      <div class="continue-banner__content">
        <span class="continue-banner__icon">📖</span>
        <span class="continue-banner__text">Continue reading <strong>${lastVisit.title || lastVisit.route}</strong>?</span>
        <button class="continue-banner__btn continue-banner__btn--go" aria-label="Continue reading ${lastVisit.title || lastVisit.route}">Continue</button>
        <button class="continue-banner__btn continue-banner__btn--dismiss" aria-label="Dismiss">✕</button>
      </div>
    `;

    // Insert at top of content
    const contentArea = document.getElementById('content-area');
    if (contentArea) {
      contentArea.prepend(banner);

      // Animate in
      requestAnimationFrame(() => banner.classList.add('visible'));

      // Event handlers
      banner.querySelector('.continue-banner__btn--go').addEventListener('click', () => {
        this.router.navigate(lastVisit.route);
        banner.remove();
        // Restore scroll position after page loads
        setTimeout(() => {
          this.renderer.progress.restoreScrollPosition(lastVisit.route);
        }, 300);
      });

      banner.querySelector('.continue-banner__btn--dismiss').addEventListener('click', () => {
        banner.classList.remove('visible');
        setTimeout(() => banner.remove(), 300);
        this.analytics.clearLastVisit();
      });

      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        if (banner.parentElement) {
          banner.classList.remove('visible');
          setTimeout(() => banner.remove(), 300);
        }
      }, 10000);
    }
  }
}

export default App;
