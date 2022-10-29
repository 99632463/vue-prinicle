import Vue from 'vue';

const install = (Vue, options) => {
  Vue.mixin({
    beforeCreate() {
      if (this.$options && this.$options.store) {
        this.$store = this.$options.store;
      } else {
        this.$store = this.$parent.$store;
      }
    }
  })
}

class Store {
  constructor(options) {
    this.options = options;
    this.state = this.options.state;
    Vue.util.defineReactive(this, 'state', this.options.state);

    this.handleGetters(this.options);
    this.handleMutations(this.options);
    this.handleActions(this.options);
  }

  handleGetters(options) {
    const getters = options.getters || {};
    this.getters = {};

    for (let key in getters) {
      Object.defineProperty(this.getters, key, {
        get: () => {
          return getters[key](this.state);
        }
      })
    }
  }

  commit = (fnName, param) => {
    this.mutations[fnName](param);
  }

  handleMutations(options) {
    const mutations = options.mutations || {};
    this.mutations = {};

    for (let key in mutations) {
      this.mutations[key] = (param) => {
        mutations[key](this.state, param);
      }
    }
  }

  dispatch(actionFn, param) {
    this.actions[actionFn](param);
  }

  handleActions(options){
    const actions = options.actions || {};
    this.actions = {};

    for(let key in actions){
      this.actions[key] = (param) => {
        actions[key](this, param);
      }
    }
  }
}

export default {
  install,
  Store
}