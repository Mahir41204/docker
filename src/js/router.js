// ============================================
// ROUTER.JS — History-based SPA Routing
// ============================================

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.onRouteChange = null;
    window.addEventListener("popstate", () => this.handleRoute());
  }

  register(path, handler) {
    this.routes[path] = handler;
  }

  navigate(path) {
    const targetPath = this._toPath(path);
    const currentPath = this._getPathname();
    if (currentPath !== targetPath) {
      window.history.pushState({}, "", targetPath);
    }
    this.handleRoute();
  }

  handleRoute() {
    const pathname = this._getPathname();
    const parts = pathname.split("/").filter(Boolean);
    const route = parts[0] || "overview";
    const sub = parts.slice(1).join("/");

    this.currentRoute = route;

    if (this.routes[route]) {
      this.routes[route](sub);
    } else if (this.routes["overview"]) {
      this.routes["overview"]();
    }

    if (this.onRouteChange) {
      this.onRouteChange(pathname, route, sub);
    }
  }

  getCurrentRoute() {
    return this.currentRoute || this._getRouteFromLocation();
  }

  init() {
    this.handleRoute();
  }

  _getPathname() {
    const pathname = window.location.pathname
      .replace(/\/index\.html?$/i, "")
      .replace(/\/+$/, "");
    return pathname || "/";
  }

  _getRouteFromLocation() {
    const pathname = this._getPathname();
    if (pathname === "/") return "overview";
    return pathname.split("/").filter(Boolean)[0] || "overview";
  }

  _toPath(path) {
    if (!path || path === "overview" || path === "/") return "/";
    if (path.startsWith("/"))
      return path.replace(/\/index\.html?$/i, "").replace(/\/+$/, "") || "/";
    return `/${path.replace(/\/index\.html?$/i, "").replace(/\/+$/, "")}`;
  }
}

export default Router;
