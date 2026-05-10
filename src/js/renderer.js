// ============================================
// RENDERER.JS — Content to HTML Renderer
// ============================================
// Enhanced with:
//   - ARIA attributes on all interactive elements
//   - SEO metadata updates per page
//   - Reading progress bar
//   - Analytics hooks
//   - Keyboard-accessible controls

import BookmarkManager from "./bookmarks.js";
import ProgressManager from "./progress.js";
import SEOManager from "./seo.js";

class Renderer {
  constructor() {
    this.bookmarks = new BookmarkManager();
    this.progress = new ProgressManager();
    this.seo = new SEOManager();
    this.contentEl = document.getElementById("content-inner");
    this._currentRoute = null;
  }

  render(page, route) {
    if (!page || !this.contentEl) return;

    // Stop previous scroll tracking
    this.progress.stopScrollTracking();

    this._currentRoute = route;
    let html = "";

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

    // Inject reading progress bar into content-area (outside content__inner)
    this._injectReadingProgressBar();

    // Initialize interactive elements
    this.initCodeCopy();
    this.initTabs();
    this.initMermaid();
    this.initKeyboardNav();
    this.bookmarks.initDOM();
    this.bookmarks.updateUI();
    this.progress.updateUI();

    // Start scroll tracking for this page
    this.progress.startScrollTracking(route);
    this._initReadingProgress();

    // Update SEO metadata
    this.seo.update({
      title: page.title,
      description: page.subtitle || this._extractDescription(page),
      route: route,
      type: route === "overview" ? "website" : "article",
    });

    // Re-animate
    this.contentEl.style.animation = "none";
    this.contentEl.offsetHeight; // trigger reflow
    this.contentEl.style.animation = "fadeIn 0.3s ease";

    // Scroll to top (or restore position)
    const contentArea = document.getElementById("content-area");
    if (contentArea) {
      contentArea.scrollTo({ top: 0, behavior: "auto" });
    }
  }

  /**
   * Extract a description from the page content for SEO.
   */
  _extractDescription(page) {
    if (page.sections && page.sections.length > 0) {
      const first = page.sections[0];
      const text = (first.content || first.title || "").replace(/<[^>]+>/g, "");
      return text.slice(0, 160);
    }
    return "";
  }

  /**
   * Inject the reading progress bar outside of the scroll container,
   * directly below the topbar so it sits perfectly flush.
   */
  _injectReadingProgressBar() {
    const contentArea = document.getElementById("content-area");
    if (!contentArea) return;

    // Remove existing bar if present
    const existing = document.getElementById("reading-progress");
    if (existing) existing.remove();

    const bar = document.createElement("div");
    bar.className = "reading-progress";
    bar.id = "reading-progress";
    bar.setAttribute("aria-hidden", "true");
    bar.innerHTML =
      '<div class="reading-progress__fill" id="reading-progress-fill"></div>';

    // Insert before contentArea so it sits right under topbar
    contentArea.parentNode.insertBefore(bar, contentArea);
  }

  /**
   * Initialize the reading progress bar that shows scroll position.
   */
  _initReadingProgress() {
    const contentArea = document.getElementById("content-area");
    const fill = document.getElementById("reading-progress-fill");
    if (!contentArea || !fill) return;

    const updateBar = () => {
      const pct = this.progress.getCurrentScrollPercent();
      fill.style.width = pct + "%";
    };

    contentArea.addEventListener("scroll", updateBar, { passive: true });
    updateBar();
  }

  renderPageHeader(page, route) {
    const isBookmarked = this.bookmarks.isBookmarked(route);
    return `
      <div class="page-header animate-fade-in">
        ${page.icon ? `<div class="page-header__icon">${page.icon}</div>` : ""}
        <div style="display:flex;align-items:center;gap:var(--space-md);justify-content:space-between;flex-wrap:wrap">
          <h1 class="page-header__title">${page.title || ""}</h1>
          <button class="bookmark-btn ${isBookmarked ? "bookmarked" : ""}"
                  data-id="${route}"
                  onclick="window.__app.toggleBookmark('${route}', '${this.escapeAttr(page.title || "")}', '${this.escapeAttr(page.section || "")}')"
                  aria-label="${isBookmarked ? "Remove bookmark" : "Bookmark this page"}"
                  aria-pressed="${isBookmarked}">${isBookmarked ? "★" : "☆"}</button>
        </div>
        ${page.subtitle ? `<p class="page-header__subtitle">${page.subtitle}</p>` : ""}
        ${
          page.meta
            ? `<div class="page-header__meta">
          ${page.meta.map((m) => `<span class="page-header__meta-item">${m}</span>`).join("")}
        </div>`
            : ""
        }
        ${page.tags ? `<div class="tags" style="margin-top:var(--space-md)">${page.tags.map((t) => `<span class="tag">#${t}</span>`).join("")}</div>` : ""}
      </div>
      <hr>
    `;
  }

  renderSection(section, route, index) {
    const sectionId = `${route}/${section.id || index}`;
    const isCompleted = this.progress.isCompleted(sectionId);
    let html = `<div class="section-block animate-fade-in delay-${Math.min(index + 1, 6)}" id="section-${section.id || index}">`;

    if (section.title) {
      html += `<h2>${section.title}</h2>`;
    }

    if (section.content) {
      html += `<div class="card__body">${section.content}</div>`;
    }

    // Images
    if (section.images) {
      section.images.forEach((img) => {
        html += `<div class="image-container">
          <img src="${img.url}" alt="${img.alt || ""}" loading="lazy" onerror="this.parentElement.style.display='none'">
          ${img.caption ? `<div class="image-container__caption">${img.caption}</div>` : ""}
        </div>`;
      });
    }

    // Code examples
    if (section.codeExamples) {
      section.codeExamples.forEach((code) => {
        html += this.renderCodeBlock(code);
      });
    }

    // Diagrams
    if (section.diagrams) {
      section.diagrams.forEach((d) => {
        html += this.renderDiagram(d);
      });
    }

    // Key takeaways
    if (section.keyTakeaways && section.keyTakeaways.length) {
      html += `<div class="takeaways">
        <div class="takeaways__title">💡 Key Takeaways</div>
        <ul>${section.keyTakeaways.map((t) => `<li>${t}</li>`).join("")}</ul>
      </div>`;
    }

    // Alerts
    if (section.alerts) {
      section.alerts.forEach((a) => {
        html += this.renderAlert(a);
      });
    }

    // Steps
    if (section.steps) {
      html += this.renderSteps(section.steps);
    }

    // Sub-sections
    if (section.subsections) {
      section.subsections.forEach((sub) => {
        html += `<div style="margin-left:var(--space-lg);margin-top:var(--space-lg)">`;
        if (sub.title) html += `<h3>${sub.title}</h3>`;
        if (sub.content) html += `<div class="card__body">${sub.content}</div>`;
        if (sub.codeExamples)
          sub.codeExamples.forEach((c) => {
            html += this.renderCodeBlock(c);
          });
        if (sub.diagrams)
          sub.diagrams.forEach((d) => {
            html += this.renderDiagram(d);
          });
        if (sub.images)
          sub.images.forEach((img) => {
            html += `<div class="image-container">
            <img src="${img.url}" alt="${img.alt || ""}" loading="lazy" onerror="this.parentElement.style.display='none'">
            ${img.caption ? `<div class="image-container__caption">${img.caption}</div>` : ""}
          </div>`;
          });
        if (sub.keyTakeaways) {
          html += `<div class="takeaways"><div class="takeaways__title">💡 Key Takeaways</div><ul>${sub.keyTakeaways.map((t) => `<li>${t}</li>`).join("")}</ul></div>`;
        }
        html += `</div>`;
      });
    }

    // Section completion checkbox with ARIA
    html += `<div class="section-complete ${isCompleted ? "completed" : ""}"
                 data-section-id="${sectionId}"
                 onclick="window.__app.toggleProgress('${sectionId}')"
                 role="checkbox"
                 aria-checked="${isCompleted}"
                 aria-label="Mark section as completed: ${this.escapeAttr(section.title || "Section " + (index + 1))}"
                 tabindex="0">
      <div class="section-complete__checkbox">${isCompleted ? "✓" : ""}</div>
      <span class="section-complete__label">${isCompleted ? "Completed" : "Mark as completed"}</span>
    </div>`;

    html += `</div>`;
    return html;
  }

  renderCodeBlock(code) {
    const escaped = this.escapeHtml(code.code || "");
    return `<div class="code-block">
      <div class="code-block__header">
        <div class="code-block__dots">
          <span class="code-block__dot code-block__dot--red"></span>
          <span class="code-block__dot code-block__dot--yellow"></span>
          <span class="code-block__dot code-block__dot--green"></span>
        </div>
        ${code.title ? `<span class="code-block__title">${code.title}</span>` : ""}
        <div style="display:flex;gap:var(--space-sm);align-items:center">
          <span class="code-block__lang">${code.language || "shell"}</span>
          <button class="code-block__copy"
                  onclick="window.__app.copyCode(this)"
                  aria-label="Copy code to clipboard">copy</button>
        </div>
      </div>
      <div class="code-block__body"><code>${escaped}</code></div>
      ${code.explanation ? `<div class="code-block__explanation">💬 ${code.explanation}</div>` : ""}
    </div>`;
  }

  renderDiagram(diagram) {
    if (diagram.type === "mermaid") {
      return `<div class="diagram-container" role="img" aria-label="${this.escapeAttr(diagram.title || "Diagram")}">
        ${diagram.title ? `<div class="diagram-container__title">📊 ${diagram.title}</div>` : ""}
        <div class="mermaid">${diagram.code}</div>
      </div>`;
    }
    if (diagram.type === "image") {
      return `<div class="image-container">
        <img src="${diagram.url}" alt="${diagram.alt || diagram.title || ""}" loading="lazy" onerror="this.parentElement.style.display='none'">
        ${diagram.caption ? `<div class="image-container__caption">${diagram.caption}</div>` : ""}
      </div>`;
    }
    return "";
  }

  renderAlert(alert) {
    const icons = {
      info: "ℹ️",
      warning: "⚠️",
      success: "✅",
      danger: "🚫",
      tip: "💡",
    };
    const roles = {
      warning: "alert",
      danger: "alert",
      info: "note",
      success: "status",
      tip: "note",
    };
    return `<div class="alert alert--${alert.type || "info"}" role="${roles[alert.type] || "note"}">
      <span class="alert__icon" aria-hidden="true">${icons[alert.type] || "ℹ️"}</span>
      <div class="alert__content">
        ${alert.title ? `<div class="alert__title">${alert.title}</div>` : ""}
        <div class="alert__text">${alert.text}</div>
      </div>
    </div>`;
  }

  renderSteps(steps) {
    return `<div class="steps" role="list">${steps
      .map(
        (s, i) => `
      <div class="step" role="listitem">
        <div class="step__number" aria-hidden="true">${i + 1}</div>
        <div class="step__content">
          <div class="step__title">${s.title}</div>
          <div class="step__desc">${s.desc || ""}</div>
          ${s.code ? this.renderCodeBlock(s.code) : ""}
        </div>
      </div>
    `,
      )
      .join("")}</div>`;
  }

  renderCardGrid(page) {
    const cardClass = page.cardClass || "";
    return `<div class="card-grid" role="list">${page.cards
      .map(
        (c) => `
      <div class="quick-note-card ${cardClass} ${c.colorClass || ""}" role="listitem">
        <div class="quick-note-card__title">${c.icon || ""} ${c.title}</div>
        <div class="quick-note-card__content">${c.content || ""}
          ${c.items ? `<ul>${c.items.map((i) => `<li>${i}</li>`).join("")}</ul>` : ""}
        </div>
      </div>
    `,
      )
      .join("")}</div>`;
  }

  renderItems(page) {
    if (page.itemType === "glossary") {
      return `<dl class="glossary-list">${page.items
        .map(
          (i) => `
        <div class="glossary-item">
          <dt class="glossary-item__term">${i.term}</dt>
          <dd class="glossary-item__def">${i.definition}</dd>
        </div>
      `,
        )
        .join("")}</dl>`;
    }
    // Resource items
    return page.items
      .map(
        (i) => `
      <div class="card">
        <div class="card__header">
          <div class="card__title">${i.icon || "🔗"} ${i.title}</div>
          ${i.badge ? `<span class="difficulty-badge difficulty-badge--${i.badge}">${i.badge}</span>` : ""}
        </div>
        <div class="card__body">${i.desc || i.content || ""}</div>
        ${i.url ? `<a href="${i.url}" target="_blank" rel="noopener noreferrer" style="font-size:var(--text-sm)">Visit →</a>` : ""}
      </div>
    `,
      )
      .join("");
  }

  renderLevelCards(levels) {
    return levels
      .map(
        (l) => `
      <a class="level-card"
         href="/${l.route}"
         onclick="event.preventDefault(); window.__app?.navigateRoute('${l.route}')"
         aria-label="Go to ${this.escapeAttr(l.title)}">
        <div class="level-card__level level-card__level--${l.level}" aria-hidden="true">${l.level}</div>
        <div class="level-card__info">
          <div class="level-card__title">${l.title}</div>
          <div class="level-card__desc">${l.desc}</div>
          <div class="level-card__progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
            <div class="level-card__progress-fill" style="width:0%;background:${l.color}"></div>
          </div>
        </div>
        <div class="level-card__arrow" aria-hidden="true">→</div>
      </a>
    `,
      )
      .join("");
  }

  renderComparisonTable(table) {
    return `<div class="comparison-table" role="region" aria-label="Comparison table">
      <table>
        <thead><tr>${table.headers.map((h) => `<th scope="col">${h}</th>`).join("")}</tr></thead>
        <tbody>${table.rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>
    </div>`;
  }

  // ── Keyboard Navigation ──

  initKeyboardNav() {
    // Make section-complete checkboxes keyboard accessible
    document.querySelectorAll(".section-complete").forEach((el) => {
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          el.click();
        }
      });
    });

    // Make level cards keyboard accessible
    document.querySelectorAll(".level-card").forEach((el) => {
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          el.click();
        }
      });
    });
  }

  // Utilities
  escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  escapeAttr(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, "&quot;");
  }

  initCodeCopy() {
    // Copy buttons handled via onclick in renderCodeBlock
  }

  initTabs() {
    document.querySelectorAll(".tabs__tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const parent = tab.closest(".tabs");
        parent
          .querySelectorAll(".tabs__tab")
          .forEach((t) => t.classList.remove("active"));
        parent
          .querySelectorAll(".tabs__content")
          .forEach((c) => c.classList.remove("active"));
        tab.classList.add("active");
        const target = parent.querySelector(`#${tab.dataset.tab}`);
        if (target) target.classList.add("active");
      });
    });
  }

  initMermaid() {
    if (window.mermaid) {
      const isDark =
        document.documentElement.getAttribute("data-theme") === "dark";
      window.mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? "dark" : "default",
        themeVariables: isDark
          ? {
              primaryColor: "#1a2035",
              primaryTextColor: "#e2e8f0",
              primaryBorderColor: "#22d3ee",
              lineColor: "#94a3b8",
              secondaryColor: "#212a42",
              tertiaryColor: "#111827",
              noteBkgColor: "#1a2035",
              noteTextColor: "#e2e8f0",
              fontSize: "14px",
            }
          : {
              primaryColor: "#e2e8f0",
              primaryTextColor: "#111827",
              primaryBorderColor: "#0070f3",
              lineColor: "#4b5563",
              secondaryColor: "#f1f5f9",
              tertiaryColor: "#ffffff",
              noteBkgColor: "#f1f5f9",
              noteTextColor: "#111827",
              fontSize: "14px",
            },
      });
      window.mermaid.run();
    }
  }
}

export default Renderer;
