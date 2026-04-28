// ============================================
// APP.JS — Main SPA Controller
// ============================================

import Router from './router.js';
import Renderer from './renderer.js';
import SearchEngine from './search.js';
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
    };

    // Initialize search
    this.initSearch();

    // Initialize sidebar
    this.initSidebar();

    // Initialize bookmarks panel
    this.initBookmarksPanel();

    // Initialize Theme Toggle
    this.initThemeToggle();

    // Start router
    this.router.init();

    // Update progress on load
    this.renderer.progress.updateSidebarProgress();
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

  // --- Sidebar ---
  initSidebar() {
    // Expandable items
    document.querySelectorAll('.sidebar__item[data-expand]').forEach(item => {
      item.addEventListener('click', (e) => {
        const target = document.getElementById(item.dataset.expand);
        const arrow = item.querySelector('.sidebar__toggle-expand');
        if (target) {
          target.classList.toggle('open');
          if (arrow) arrow.classList.toggle('rotated');
        }
      });
    });

    // Navigable items
    document.querySelectorAll('.sidebar__item[data-route]').forEach(item => {
      item.addEventListener('click', () => {
        this.router.navigate(item.dataset.route);
        this.closeMobileSidebar();
      });
    });

    document.querySelectorAll('.sidebar__subitem[data-route]').forEach(item => {
      item.addEventListener('click', () => {
        this.router.navigate(item.dataset.route);
        this.closeMobileSidebar();
      });
    });

    // Mobile hamburger
    const hamburger = document.getElementById('hamburger');
    const overlay = document.getElementById('sidebar-overlay');
    if (hamburger) {
      hamburger.addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('mobile-open');
        overlay.classList.toggle('visible');
      });
    }
    if (overlay) {
      overlay.addEventListener('click', () => this.closeMobileSidebar());
    }
  }

  closeMobileSidebar() {
    document.querySelector('.sidebar').classList.remove('mobile-open');
    document.getElementById('sidebar-overlay').classList.remove('visible');
  }

  updateSidebar(route) {
    document.querySelectorAll('.sidebar__item, .sidebar__subitem').forEach(el => {
      el.classList.remove('active');
    });

    const active = document.querySelector(`[data-route="${route}"]`);
    if (active) {
      active.classList.add('active');
      // Expand parent if sub-item
      const parent = active.closest('.sidebar__subitems');
      if (parent) {
        parent.classList.add('open');
        const toggle = parent.previousElementSibling?.querySelector('.sidebar__toggle-expand');
        if (toggle) toggle.classList.add('rotated');
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
          return;
        }
        const hits = this.search.search(q);
        this.renderSearchResults(hits, results);
      }, 200);
    });

    input.addEventListener('focus', () => {
      if (input.value.trim().length >= 2) {
        results.classList.add('visible');
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.sidebar__search')) {
        results.classList.remove('visible');
      }
    });
  }

  renderSearchResults(hits, container) {
    if (hits.length === 0) {
      container.innerHTML = '<div class="search-results__empty">No results found</div>';
    } else {
      container.innerHTML = hits.map(h => `
        <div class="search-results__item" onclick="window.location.hash='${h.route}'">
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
    this.renderer.bookmarks.toggle(id, title, section);
  }

  toggleBookmarksPanel() {
    this.renderer.bookmarks.togglePanel();
  }

  // --- Progress ---
  toggleProgress(sectionId) {
    this.renderer.progress.toggle(sectionId);
  }

  // --- Code Copy ---
  copyCode(btn) {
    const codeBlock = btn.closest('.code-block');
    const code = codeBlock.querySelector('code').textContent;
    navigator.clipboard.writeText(code).then(() => {
      btn.textContent = 'copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = 'copy';
        btn.classList.remove('copied');
      }, 2000);
    });
  }
}

export default App;
