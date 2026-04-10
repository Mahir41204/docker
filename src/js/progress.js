// ============================================
// PROGRESS.JS — LocalStorage Progress Tracking
// ============================================

const STORAGE_KEY = 'docker_hub_progress';

class ProgressManager {
  constructor() {
    this.completed = this.load();
  }

  load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch { return {}; }
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.completed));
  }

  toggle(sectionId) {
    if (this.completed[sectionId]) {
      delete this.completed[sectionId];
    } else {
      this.completed[sectionId] = Date.now();
    }
    this.save();
    this.updateUI();
  }

  isCompleted(sectionId) {
    return !!this.completed[sectionId];
  }

  getCompletedCount(sectionIds) {
    return sectionIds.filter(id => this.completed[id]).length;
  }

  getOverallProgress(allSectionIds) {
    if (!allSectionIds.length) return 0;
    return Math.round((this.getCompletedCount(allSectionIds) / allSectionIds.length) * 100);
  }

  updateUI() {
    // Update section checkboxes
    document.querySelectorAll('.section-complete').forEach(el => {
      const id = el.dataset.sectionId;
      el.classList.toggle('completed', this.isCompleted(id));
      const checkbox = el.querySelector('.section-complete__checkbox');
      if (checkbox) checkbox.innerHTML = this.isCompleted(id) ? '✓' : '';
    });

    // Update sidebar progress
    this.updateSidebarProgress();
  }

  updateSidebarProgress() {
    const fill = document.getElementById('progress-fill');
    const label = document.getElementById('progress-label');
    if (!fill || !label) return;

    const allIds = this.getAllSectionIds();
    const pct = this.getOverallProgress(allIds);
    fill.style.width = pct + '%';
    label.textContent = pct + '% complete';
  }

  getAllSectionIds() {
    // Collect all possible section IDs from the navigation
    const ids = [];
    document.querySelectorAll('.sidebar__item[data-route], .sidebar__subitem[data-route]').forEach(el => {
      if (el.dataset.route) ids.push(el.dataset.route);
    });
    return ids.length > 0 ? ids : Object.keys(this.completed);
  }
}

export default ProgressManager;
