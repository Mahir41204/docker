// ============================================
// RENDERER.JS — Content to HTML Renderer
// ============================================

import BookmarkManager from './bookmarks.js';
import ProgressManager from './progress.js';

class Renderer {
  constructor() {
    this.bookmarks = new BookmarkManager();
    this.progress = new ProgressManager();
    this.contentEl = document.getElementById('content-inner');
  }

  render(page, route) {
    if (!page || !this.contentEl) return;
    let html = '';

    // Page header
    html += this.renderPageHeader(page, route);

    // Sections
    if (page.sections) {
      page.sections.forEach((section, i) => {
        html += this.renderSection(section, route, i);
      });
    }

    // Cards grid (for quick notes, features, etc.)
    if (page.cards) {
      html += this.renderCardGrid(page);
    }

    // Items list (for glossary, resources, etc.)
    if (page.items) {
      html += this.renderItems(page);
    }

    // Level cards (for overview page)
    if (page.levelCards) {
      html += this.renderLevelCards(page.levelCards);
    }

    // Comparison table
    if (page.comparisonTable) {
      html += this.renderComparisonTable(page.comparisonTable);
    }

    this.contentEl.innerHTML = html;

    // Initialize interactive elements
    this.initCodeCopy();
    this.initTabs();
    this.initMermaid();
    this.bookmarks.updateUI();
    this.progress.updateUI();

    // Re-animate
    this.contentEl.style.animation = 'none';
    this.contentEl.offsetHeight; // trigger reflow
    this.contentEl.style.animation = 'fadeIn 0.3s ease';

    // Scroll to top
    document.getElementById('content-area').scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderPageHeader(page, route) {
    const isBookmarked = this.bookmarks.isBookmarked(route);
    return `
      <div class="page-header animate-fade-in">
        ${page.icon ? `<div class="page-header__icon">${page.icon}</div>` : ''}
        <div style="display:flex;align-items:center;gap:var(--space-md);justify-content:space-between;flex-wrap:wrap">
          <h1 class="page-header__title">${page.title || ''}</h1>
          <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" data-id="${route}" onclick="window.__app.toggleBookmark('${route}', '${this.escapeAttr(page.title || '')}', '${this.escapeAttr(page.section || '')}')">${isBookmarked ? '★' : '☆'}</button>
        </div>
        ${page.subtitle ? `<p class="page-header__subtitle">${page.subtitle}</p>` : ''}
        ${page.meta ? `<div class="page-header__meta">
          ${page.meta.map(m => `<span class="page-header__meta-item">${m}</span>`).join('')}
        </div>` : ''}
        ${page.tags ? `<div class="tags" style="margin-top:var(--space-md)">${page.tags.map(t => `<span class="tag">#${t}</span>`).join('')}</div>` : ''}
      </div>
      <hr>
    `;
  }

  renderSection(section, route, index) {
    const sectionId = `${route}/${section.id || index}`;
    let html = `<div class="section-block animate-fade-in delay-${Math.min(index + 1, 6)}">`;

    if (section.title) {
      html += `<h2>${section.title}</h2>`;
    }

    if (section.content) {
      html += `<div class="card__body">${section.content}</div>`;
    }

    // Images
    if (section.images) {
      section.images.forEach(img => {
        html += `<div class="image-container">
          <img src="${img.url}" alt="${img.alt || ''}" loading="lazy" onerror="this.parentElement.style.display='none'">
          ${img.caption ? `<div class="image-container__caption">${img.caption}</div>` : ''}
        </div>`;
      });
    }

    // Code examples
    if (section.codeExamples) {
      section.codeExamples.forEach(code => {
        html += this.renderCodeBlock(code);
      });
    }

    // Diagrams
    if (section.diagrams) {
      section.diagrams.forEach(d => {
        html += this.renderDiagram(d);
      });
    }

    // Key takeaways
    if (section.keyTakeaways && section.keyTakeaways.length) {
      html += `<div class="takeaways">
        <div class="takeaways__title">💡 Key Takeaways</div>
        <ul>${section.keyTakeaways.map(t => `<li>${t}</li>`).join('')}</ul>
      </div>`;
    }

    // Alerts
    if (section.alerts) {
      section.alerts.forEach(a => {
        html += this.renderAlert(a);
      });
    }

    // Steps
    if (section.steps) {
      html += this.renderSteps(section.steps);
    }

    // Sub-sections
    if (section.subsections) {
      section.subsections.forEach(sub => {
        html += `<div style="margin-left:var(--space-lg);margin-top:var(--space-lg)">`;
        if (sub.title) html += `<h3>${sub.title}</h3>`;
        if (sub.content) html += `<div class="card__body">${sub.content}</div>`;
        if (sub.codeExamples) sub.codeExamples.forEach(c => { html += this.renderCodeBlock(c); });
        if (sub.diagrams) sub.diagrams.forEach(d => { html += this.renderDiagram(d); });
        if (sub.images) sub.images.forEach(img => {
          html += `<div class="image-container">
            <img src="${img.url}" alt="${img.alt || ''}" loading="lazy" onerror="this.parentElement.style.display='none'">
            ${img.caption ? `<div class="image-container__caption">${img.caption}</div>` : ''}
          </div>`;
        });
        if (sub.keyTakeaways) {
          html += `<div class="takeaways"><div class="takeaways__title">💡 Key Takeaways</div><ul>${sub.keyTakeaways.map(t => `<li>${t}</li>`).join('')}</ul></div>`;
        }
        html += `</div>`;
      });
    }

    // Section completion checkbox
    html += `<div class="section-complete" data-section-id="${sectionId}" onclick="window.__app.toggleProgress('${sectionId}')">
      <div class="section-complete__checkbox"></div>
      <span class="section-complete__label">Mark as completed</span>
    </div>`;

    html += `</div>`;
    return html;
  }

  renderCodeBlock(code) {
    const escaped = this.escapeHtml(code.code || '');
    return `<div class="code-block">
      <div class="code-block__header">
        <div class="code-block__dots">
          <span class="code-block__dot code-block__dot--red"></span>
          <span class="code-block__dot code-block__dot--yellow"></span>
          <span class="code-block__dot code-block__dot--green"></span>
        </div>
        ${code.title ? `<span class="code-block__title">${code.title}</span>` : ''}
        <div style="display:flex;gap:var(--space-sm);align-items:center">
          <span class="code-block__lang">${code.language || 'shell'}</span>
          <button class="code-block__copy" onclick="window.__app.copyCode(this)">copy</button>
        </div>
      </div>
      <div class="code-block__body"><code>${escaped}</code></div>
      ${code.explanation ? `<div class="code-block__explanation">💬 ${code.explanation}</div>` : ''}
    </div>`;
  }

  renderDiagram(diagram) {
    if (diagram.type === 'mermaid') {
      return `<div class="diagram-container">
        ${diagram.title ? `<div class="diagram-container__title">📊 ${diagram.title}</div>` : ''}
        <div class="mermaid">${diagram.code}</div>
      </div>`;
    }
    if (diagram.type === 'image') {
      return `<div class="image-container">
        <img src="${diagram.url}" alt="${diagram.alt || diagram.title || ''}" loading="lazy" onerror="this.parentElement.style.display='none'">
        ${diagram.caption ? `<div class="image-container__caption">${diagram.caption}</div>` : ''}
      </div>`;
    }
    return '';
  }

  renderAlert(alert) {
    const icons = { info: 'ℹ️', warning: '⚠️', success: '✅', danger: '🚫', tip: '💡' };
    return `<div class="alert alert--${alert.type || 'info'}">
      <span class="alert__icon">${icons[alert.type] || 'ℹ️'}</span>
      <div class="alert__content">
        ${alert.title ? `<div class="alert__title">${alert.title}</div>` : ''}
        <div class="alert__text">${alert.text}</div>
      </div>
    </div>`;
  }

  renderSteps(steps) {
    return `<div class="steps">${steps.map((s, i) => `
      <div class="step">
        <div class="step__number">${i + 1}</div>
        <div class="step__content">
          <div class="step__title">${s.title}</div>
          <div class="step__desc">${s.desc || ''}</div>
          ${s.code ? this.renderCodeBlock(s.code) : ''}
        </div>
      </div>
    `).join('')}</div>`;
  }

  renderCardGrid(page) {
    const cardClass = page.cardClass || '';
    return `<div class="card-grid">${page.cards.map(c => `
      <div class="quick-note-card ${cardClass} ${c.colorClass || ''}">
        <div class="quick-note-card__title">${c.icon || ''} ${c.title}</div>
        <div class="quick-note-card__content">${c.content || ''}
          ${c.items ? `<ul>${c.items.map(i => `<li>${i}</li>`).join('')}</ul>` : ''}
        </div>
      </div>
    `).join('')}</div>`;
  }

  renderItems(page) {
    if (page.itemType === 'glossary') {
      return page.items.map(i => `
        <div class="glossary-item">
          <div class="glossary-item__term">${i.term}</div>
          <div class="glossary-item__def">${i.definition}</div>
        </div>
      `).join('');
    }
    // Resource items
    return page.items.map(i => `
      <div class="card">
        <div class="card__header">
          <div class="card__title">${i.icon || '🔗'} ${i.title}</div>
          ${i.badge ? `<span class="difficulty-badge difficulty-badge--${i.badge}">${i.badge}</span>` : ''}
        </div>
        <div class="card__body">${i.desc || i.content || ''}</div>
        ${i.url ? `<a href="${i.url}" target="_blank" rel="noopener" style="font-size:var(--text-sm)">Visit →</a>` : ''}
      </div>
    `).join('');
  }

  renderLevelCards(levels) {
    return levels.map(l => `
      <div class="level-card" onclick="window.location.hash='${l.route}'">
        <div class="level-card__level level-card__level--${l.level}">${l.level}</div>
        <div class="level-card__info">
          <div class="level-card__title">${l.title}</div>
          <div class="level-card__desc">${l.desc}</div>
          <div class="level-card__progress-bar">
            <div class="level-card__progress-fill" style="width:0%;background:${l.color}"></div>
          </div>
        </div>
        <div class="level-card__arrow">→</div>
      </div>
    `).join('');
  }

  renderComparisonTable(table) {
    return `<div class="comparison-table">
      <table>
        <thead><tr>${table.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${table.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    </div>`;
  }

  // Utilities
  escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  escapeAttr(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  initCodeCopy() {
    // Copy buttons handled via onclick in renderCodeBlock
  }

  initTabs() {
    document.querySelectorAll('.tabs__tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const parent = tab.closest('.tabs');
        parent.querySelectorAll('.tabs__tab').forEach(t => t.classList.remove('active'));
        parent.querySelectorAll('.tabs__content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const target = parent.querySelector(`#${tab.dataset.tab}`);
        if (target) target.classList.add('active');
      });
    });
  }

  initMermaid() {
    if (window.mermaid) {
      window.mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: {
          primaryColor: '#1a2035',
          primaryTextColor: '#e2e8f0',
          primaryBorderColor: '#22d3ee',
          lineColor: '#94a3b8',
          secondaryColor: '#212a42',
          tertiaryColor: '#111827',
          noteBkgColor: '#1a2035',
          noteTextColor: '#e2e8f0',
          fontSize: '14px'
        }
      });
      window.mermaid.run();
    }
  }
}

export default Renderer;
