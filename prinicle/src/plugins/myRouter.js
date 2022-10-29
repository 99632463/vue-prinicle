class MyRouterInfo {
  constructor() {
    this.currrentPath = null;
  }
}

class MyRouter {
  constructor(options) {
    this.options = options || {};
    this.mode = options.mode || 'history';
    this.routes = options.routes || [];

    this.routesMap = this.parseRoutes();
    this.routerInfo = new MyRouterInfo();
    this.saveCurrrentPath();
  }

  parseRoutes() {
    return this.routes.reduce((t, v) => (t[v.path] = v.component, t), {});
  }
  saveCurrrentPath() {
    if (this.mode === 'history') {
      if (!location.pathname) {
        location.pathname = '/';
      }
      window.addEventListener('load', () => {
        this.routerInfo.currrentPath = location.pathname;
      })
      window.addEventListener('popstate', () => {
        this.routerInfo.currrentPath = location.pathname;
      })
    } else {
      if (!location.hash) {
        location.hash = '/';
      }
      window.addEventListener('load', () => {
        this.routerInfo.currrentPath = location.hash.slice(1);
      })
      window.addEventListener('hashchange', () => {
        this.routerInfo.currrentPath = location.hash.slice(1);
      })
    }
  }
}

MyRouter.install = (Vue) => {
  Vue.mixin({
    beforeCreate() {
      if (this.$options && this.$options.router) {
        Vue.util.defineReactive(this, '$router', this.$options.router);
        Vue.util.defineReactive(this, '$route', this.$router.routerInfo);
      } else {
        Vue.util.defineReactive(this, '$router', this.$parent.$router);
        Vue.util.defineReactive(this, '$route', this.$parent.$route);
      }
    }
  })

  Vue.component('router-view', {
    render(h) {
      const routesMap = this._self.$router.routesMap;
      const currrentPath = this._self.$route.currrentPath;

      return currrentPath && h(routesMap[currrentPath]);
    }
  })

  Vue.component('router-link', {
    props: {
      to: {
        type: String,
        default: '',
        required: true
      }
    },
    render() {
      const mode = this._self.$router.mode;
      const path = mode === 'hash' ? '#' + this.to : this.to;

      return <a href={path}>{this.$slots.default}</a>
    }
  })
}

export default MyRouter;