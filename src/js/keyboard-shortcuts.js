// ============================================
// KEYBOARD-SHORTCUTS.JS — Global Shortcut Manager
// ============================================

class KeyboardShortcutManager {
  /**
   * @param {Object} opts
   * @param {Function} opts.onSearch - Callback to focus search
   * @param {Function} opts.onEscape - Callback for escape key
   */
  constructor({ onSearch, onEscape } = {}) {
    this.onSearch = onSearch || (() => {});
    this.onEscape = onEscape || (() => {});
    this._boundHandler = this._handleKeyDown.bind(this);
    this._active = false;
  }

  /**
   * Start listening for keyboard shortcuts.
   */
  init() {
    if (this._active) return;
    document.addEventListener('keydown', this._boundHandler);
    this._active = true;
  }

  /**
   * Remove keyboard shortcut listeners — prevents memory leaks.
   */
  destroy() {
    document.removeEventListener('keydown', this._boundHandler);
    this._active = false;
  }

  /**
   * Core keydown handler.
   * Ignores events when the user is typing in inputs/textareas.
   */
  _handleKeyDown(e) {
    const tag = document.activeElement?.tagName?.toLowerCase();
    const isEditable = document.activeElement?.isContentEditable;
    const isInput = tag === 'input' || tag === 'textarea' || tag === 'select' || isEditable;

    // Ctrl+K / Cmd+K — always trigger search, even in inputs
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      e.stopPropagation();
      this.onSearch();
      return;
    }

    // Escape — close panels, blur search
    if (e.key === 'Escape') {
      this.onEscape();
      return;
    }

    // "/" — focus search (only when NOT in an input)
    if (e.key === '/' && !isInput) {
      e.preventDefault();
      this.onSearch();
      return;
    }
  }
}

export default KeyboardShortcutManager;
