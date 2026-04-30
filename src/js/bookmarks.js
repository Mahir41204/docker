// ============================================
// BOOKMARKS.JS — Persistent Bookmark System
// ============================================
// Features:
//   - Add/remove bookmarks with deduplication
//   - Slide-out panel with ARIA dialog + focus trap
//   - Remove button per item in the panel
//   - Badge count on topbar button
//   - localStorage with graceful fallback

const STORAGE_KEY = 'docker_hub_bookmarks';

class BookmarkManager {
  constructor() {
    this.bookmarks = this._load();
    this.panel = null;
    this.panelBody = null;
    this._previousFocus = null;
    this._boundTrapFocus = this._trapFocus.bind(this);
    this._boundEscClose = this._escClose.bind(this);
  }

  /**
   * Late-init DOM references (called after DOM ready).
   */
  initDOM() {
    this.panel = document.getElementById('bookmarks-panel');
    this.panelBody = document.getElementById('bookmarks-panel-body');
  }

  // ── Persistence ──

  _load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch { return []; }
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.bookmarks));
    } catch {
      // localStorage unavailable — bookmarks stay in memory only
    }
  }

  // ── CRUD ──

  /**
   * Toggle a bookmark. Prevents duplicates.
   * @param {string} id - Unique bookmark ID (route or section slug)
   * @param {string} title - Display title
   * @param {string} page - Page route
   * @returns {boolean} true if added, false if removed
   */
  toggle(id, title, page) {
    const idx = this.bookmarks.findIndex(b => b.id === id);
    if (idx >= 0) {
      this.bookmarks.splice(idx, 1);
      this._showToast('Bookmark removed');
      this._save();
      this.updateUI();
      return false;
    }

    // Deduplication guard
    if (!this.bookmarks.some(b => b.id === id)) {
      this.bookmarks.push({
        id,
        title: title || id,
        page: page || id,
        timestamp: Date.now(),
      });
    }

    this._showToast('Bookmark added ★');
    this._save();
    this.updateUI();
    return true;
  }

  /**
   * Remove a bookmark by ID.
   * @param {string} id
   */
  remove(id) {
    this.bookmarks = this.bookmarks.filter(b => b.id !== id);
    this._save();
    this.updateUI();
    if (this.panel?.classList.contains('open')) this._renderPanel();
  }

  isBookmarked(id) {
    return this.bookmarks.some(b => b.id === id);
  }

  getAll() {
    return [...this.bookmarks];
  }

  getCount() {
    return this.bookmarks.length;
  }

  // ── Panel (Accessible Dialog) ──

  togglePanel() {
    if (!this.panel) this.initDOM();
    if (this.panel.classList.contains('open')) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  openPanel() {
    if (!this.panel) this.initDOM();
    this._previousFocus = document.activeElement;

    this.panel.classList.add('open');
    this.panel.setAttribute('aria-hidden', 'false');
    this._renderPanel();

    // Focus the close button
    const closeBtn = document.getElementById('bookmarks-close');
    if (closeBtn) {
      requestAnimationFrame(() => closeBtn.focus());
    }

    // Activate focus trap
    document.addEventListener('keydown', this._boundTrapFocus);
    document.addEventListener('keydown', this._boundEscClose);
  }

  closePanel() {
    if (!this.panel) return;
    this.panel.classList.remove('open');
    this.panel.setAttribute('aria-hidden', 'true');

    // Remove focus trap
    document.removeEventListener('keydown', this._boundTrapFocus);
    document.removeEventListener('keydown', this._boundEscClose);

    // Restore focus
    if (this._previousFocus && typeof this._previousFocus.focus === 'function') {
      this._previousFocus.focus();
    }
    this._previousFocus = null;
  }

  /**
   * Focus trap: keeps Tab/Shift+Tab within the panel.
   */
  _trapFocus(e) {
    if (e.key !== 'Tab' || !this.panel) return;

    const focusable = this.panel.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  /**
   * Close panel on Escape.
   */
  _escClose(e) {
    if (e.key === 'Escape') {
      this.closePanel();
    }
  }

  // ── Rendering ──

  _renderPanel() {
    if (!this.panelBody) this.initDOM();
    if (!this.panelBody) return;

    if (this.bookmarks.length === 0) {
      this.panelBody.innerHTML = `
        <div class="bookmarks-panel__empty">
          No bookmarks yet.<br>Click ☆ to save sections.
        </div>`;
      return;
    }

    this.panelBody.innerHTML = this.bookmarks.map(b => `
      <div class="bookmarks-panel__item" role="listitem">
        <div class="bookmarks-panel__item-content"
             onclick="window.location.hash='${b.id}'; window.__app?.renderer?.bookmarks?.closePanel()"
             tabindex="0"
             role="link"
             aria-label="Go to ${this._escapeHtml(b.title)}">
          <div class="bookmarks-panel__item-title">${this._escapeHtml(b.title)}</div>
          <div class="bookmarks-panel__item-page">${this._escapeHtml(b.page || '')}</div>
        </div>
        <button class="bookmarks-panel__item-remove"
                onclick="event.stopPropagation(); window.__app?.renderer?.bookmarks?.remove('${b.id}')"
                aria-label="Remove bookmark: ${this._escapeHtml(b.title)}"
                title="Remove bookmark">✕</button>
      </div>
    `).join('');
  }

  // ── UI Sync ──

  updateUI() {
    // Update bookmark buttons in content
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
      const id = btn.dataset.id;
      const marked = this.isBookmarked(id);
      btn.classList.toggle('bookmarked', marked);
      btn.textContent = marked ? '★' : '☆';
      btn.setAttribute('aria-label', marked ? 'Remove bookmark' : 'Bookmark this page');
      btn.setAttribute('aria-pressed', String(marked));
    });

    // Update panel if open
    if (this.panel?.classList.contains('open')) this._renderPanel();

    // Update badge count on topbar button
    this._updateBadge();
  }

  _updateBadge() {
    const btn = document.querySelector('.topbar__btn--bookmarks');
    if (!btn) return;

    let badge = btn.querySelector('.bookmark-count-badge');
    const count = this.getCount();

    if (count > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'bookmark-count-badge';
        btn.appendChild(badge);
      }
      badge.textContent = count;
      badge.style.display = '';
    } else if (badge) {
      badge.style.display = 'none';
    }
  }

  // ── Toast Notification ──

  _showToast(msg) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast toast--info';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove('visible'), 2000);
  }

  _escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }
}

export default BookmarkManager;
