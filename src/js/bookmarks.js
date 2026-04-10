// ============================================
// BOOKMARKS.JS — LocalStorage Bookmark System
// ============================================

const STORAGE_KEY = 'docker_hub_bookmarks';

class BookmarkManager {
  constructor() {
    this.bookmarks = this.load();
    this.panel = document.getElementById('bookmarks-panel');
    this.panelBody = document.getElementById('bookmarks-panel-body');
  }

  load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch { return []; }
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.bookmarks));
  }

  toggle(id, title, section) {
    const idx = this.bookmarks.findIndex(b => b.id === id);
    if (idx >= 0) {
      this.bookmarks.splice(idx, 1);
      this.showToast('Bookmark removed');
    } else {
      this.bookmarks.push({ id, title, section, timestamp: Date.now() });
      this.showToast('Bookmark added ★');
    }
    this.save();
    this.updateUI();
    return idx < 0;
  }

  isBookmarked(id) {
    return this.bookmarks.some(b => b.id === id);
  }

  getAll() {
    return this.bookmarks;
  }

  togglePanel() {
    this.panel.classList.toggle('open');
    if (this.panel.classList.contains('open')) this.renderPanel();
  }

  closePanel() {
    this.panel.classList.remove('open');
  }

  renderPanel() {
    if (!this.panelBody) return;
    if (this.bookmarks.length === 0) {
      this.panelBody.innerHTML = '<div class="bookmarks-panel__empty">No bookmarks yet.<br>Click ☆ to save sections.</div>';
      return;
    }
    this.panelBody.innerHTML = this.bookmarks.map(b => `
      <div class="bookmarks-panel__item" onclick="window.location.hash='${b.id}'">
        <div class="bookmarks-panel__item-title">${b.title}</div>
        <div class="bookmarks-panel__item-section">${b.section || ''}</div>
      </div>
    `).join('');
  }

  updateUI() {
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
      const id = btn.dataset.id;
      btn.classList.toggle('bookmarked', this.isBookmarked(id));
      btn.textContent = this.isBookmarked(id) ? '★' : '☆';
    });
    if (this.panel.classList.contains('open')) this.renderPanel();
  }

  showToast(msg) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast toast--info';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove('visible'), 2000);
  }
}

export default BookmarkManager;
