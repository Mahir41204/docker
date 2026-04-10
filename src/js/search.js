// ============================================
// SEARCH.JS — Full-text Search
// ============================================

class SearchEngine {
  constructor() {
    this.index = [];
  }

  buildIndex(pages) {
    this.index = [];
    for (const [route, page] of Object.entries(pages)) {
      const text = this.extractText(page);
      this.index.push({
        route,
        title: page.title || route,
        icon: page.icon || '📄',
        text: text.toLowerCase(),
        rawText: text
      });
    }
  }

  extractText(page) {
    let text = page.title || '';
    if (page.subtitle) text += ' ' + page.subtitle;
    if (page.sections) {
      page.sections.forEach(s => {
        text += ' ' + (s.title || '');
        text += ' ' + (s.content || '');
        if (s.codeExamples) {
          s.codeExamples.forEach(c => {
            text += ' ' + (c.title || '') + ' ' + (c.code || '');
          });
        }
        if (s.keyTakeaways) text += ' ' + s.keyTakeaways.join(' ');
      });
    }
    if (page.items) {
      page.items.forEach(item => {
        text += ' ' + (item.term || item.title || '') + ' ' + (item.definition || item.content || item.desc || '');
      });
    }
    if (page.cards) {
      page.cards.forEach(c => {
        text += ' ' + (c.title || '') + ' ' + (c.content || '');
        if (c.items) c.items.forEach(i => text += ' ' + i);
      });
    }
    // strip HTML tags
    return text.replace(/<[^>]+>/g, '');
  }

  search(query) {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase().trim();
    const terms = q.split(/\s+/);

    return this.index
      .map(entry => {
        let score = 0;
        const titleLower = entry.title.toLowerCase();

        // Title match scores higher
        terms.forEach(term => {
          if (titleLower.includes(term)) score += 10;
          const count = (entry.text.match(new RegExp(term, 'g')) || []).length;
          score += count;
        });

        // Exact phrase match
        if (entry.text.includes(q)) score += 20;
        if (titleLower.includes(q)) score += 50;

        // Get snippet
        let snippet = '';
        if (score > 0) {
          const idx = entry.text.indexOf(terms[0]);
          if (idx >= 0) {
            const start = Math.max(0, idx - 40);
            const end = Math.min(entry.rawText.length, idx + 80);
            snippet = (start > 0 ? '...' : '') + entry.rawText.slice(start, end).trim() + (end < entry.rawText.length ? '...' : '');
          }
        }

        return { ...entry, score, snippet };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }
}

export default SearchEngine;
