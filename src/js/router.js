// ============================================
// ROUTER.JS — Hash-based SPA Routing
// ============================================

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.onRouteChange = null;
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  register(path, handler) {
    this.routes[path] = handler;
  }

  navigate(path) {
    window.location.hash = path;
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || 'overview';
    const parts = hash.split('/');
    const route = parts[0];
    const sub = parts.slice(1).join('/');

    this.currentRoute = hash;

    if (this.routes[route]) {
      this.routes[route](sub);
    } else if (this.routes['overview']) {
      this.routes['overview']();
    }

    if (this.onRouteChange) {
      this.onRouteChange(hash, route, sub);
    }
  }

  getCurrentRoute() {
    return window.location.hash.slice(1) || 'overview';
  }

  init() {
    this.handleRoute();
  }
}

export default Router;
