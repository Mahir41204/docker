// ============================================
// MAIN.JS — Entry Point
// ============================================

import './css/base.css';
import './css/layout.css';
import './css/components.css';
import './css/animations.css';
import './css/responsive.css';
import App from './js/app.js';

// Initialize Mermaid
import mermaid from 'mermaid';

mermaid.initialize({
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

window.mermaid = mermaid;

// Boot app when DOM is ready
const app = new App();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}
