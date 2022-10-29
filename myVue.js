class MyVue {
  constructor(options) {
    if (this.isElement(options.el)) {
      this.$el = options.el;
    }
    else {
      this.$el = document.querySelector(options.el)
    }
    this.$data = options.data;
    this.$methods = options.methods;
    this.$computed = options.computed;

    this.proxyData();
    this.computed2data();

    if (this.$el) {
      new Observer(this.$data);
      new Compiler(this)
    }
  }
  proxyData() {
    for (let key in this.$data) {
      Object.defineProperty(this, key, {
        get() {
          return this.$data[key];
        }
      })
    }
  }
  computed2data() {
    for (let key in this.$computed) {
      Object.defineProperty(this.$data, key, {
        get: () => {
          return this.$computed[key].call(this);
        }
      })
    }
  }
  isElement(node) {
    return node.nodeType === 1;
  }
}

const directive_utils = {
  getValue(val, vm) {
    return val.trim().split('.').reduce((t, v) => t[v], vm.$data);
  },
  setValue(vm, val, newValue) {
    val.trim().split('.').reduce((t, v, i, arr) => {
      if (i === arr.length - 1) {
        t[v] = newValue;
      }
      return t[v];
    }, vm.$data);
  },
  getContent(val, vm) {
    const reg = /\{\{(.+?)\}\}/gi;
    const result = val.replace(reg, (...args) => this.getValue(args[1], vm))

    return result;
  },
  model(node, value, vm) {
    new Watcher(vm, value, function (newVal, oldVal) {
      node.value = newVal;
    });
    node.value = this.getValue(value, vm);

    node.addEventListener('input', e => {
      const newValue = e.target.value;
      this.setValue(vm, value, newValue);
    });
  },
  html(node, value, vm) {
    new Watcher(vm, value, function (newVal, oldVal) {
      node.innerHTML = newVal;
    });
    node.innerHTML = this.getValue(value, vm);
  },
  text(node, value, vm) {
    new Watcher(vm, value, function (newVal, oldVal) {
      node.innerText = newVal;
    });
    node.innerText = this.getValue(value, vm);
  },
  content(node, value, vm) {
    const reg = /\{\{(.+?)\}\}/gi;

    const result = value.replace(reg, (...args) => {
      new Watcher(vm, args[1], (newVal, oldVal) => {
        node.textContent = this.getContent(value, vm);
      });
      return this.getValue(args[1], vm);
    })

    node.textContent = result;
  },
  on(node, fn, vm, type) {
    node.addEventListener(type, e => vm.$methods[fn].call(vm, e));
  }
}

class Compiler {
  constructor(vm) {
    this.vm = vm;

    const fragment = this.node2fragment(this.vm.$el);
    this.buildTemplate(fragment);

    this.vm.$el.append(fragment);
  }

  node2fragment(ele) {
    const fragment = document.createDocumentFragment();
    let node = ele.firstChild;
    while (node) {
      fragment.append(node)
      node = ele.firstChild;
    }

    return fragment;
  }

  buildTemplate(fragment) {
    const nodes = [...fragment.childNodes];
    nodes.forEach(node => {
      if (this.vm.isElement(node)) {
        this.buildElement(node);
        this.buildTemplate(node);
      } else {
        this.buildText(node);
      }
    })
  }

  buildElement(node) {
    const attrs = [...node.attributes];
    attrs.forEach(attr => {
      const { name, value } = attr;

      if (name.startsWith('v-')) {
        const [directiveName, directiveType] = name.split(':');

        const splitDirective = directiveName.split('-');
        const [, directive] = splitDirective;

        directive_utils[directive](node, value, this.vm, directiveType);
      }
    })
  }

  buildText(node) {
    const reg = /\{\{.+?\}\}/gi;
    if (reg.test(node.textContent)) {
      directive_utils['content'](node, node.textContent, this.vm);
    }
  }
}

class Dep {
  constructor() {
    this.subs = [];
  }

  addSubs(watcher) {
    this.subs.push(watcher);
  }

  notify() {
    this.subs.forEach(sub => sub.update());
  }
}

class Watcher {
  constructor(vm, attr, fn) {
    this.vm = vm;
    this.attr = attr;
    this.fn = fn;

    this.oldValue = this.oldValue();
  }

  oldValue() {
    Dep.target = this;
    const oldValue = directive_utils.getValue(this.attr, this.vm);
    Dep.target = null;
    this.oldValue = oldValue;
  }

  update() {
    const newValue = directive_utils.getValue(this.attr, this.vm);
    if (newValue !== this.oldValue) {
      this.fn(newValue, this.oldValue);
    }
  }
}

class Observer {
  constructor(obj) {
    this.obj = obj;
    this.observe(this.obj)
  }

  observe(obj) {
    if (obj && typeof obj === 'object') {
      for (var key in obj) {
        this.defineReactive(obj, key, obj[key]);
      }
    }
  }

  defineReactive(obj, attr, value) {
    let self = this;
    const dep = new Dep();
    if (typeof value === 'object') {
      this.observe(value);
    } else {
      Object.defineProperty(obj, attr, {
        get() {
          Dep.target && dep.addSubs(Dep.target);
          return value;
        },
        set(newVal) {
          value = newVal;
          self.observe(newVal);
          dep.notify();
        }
      })
    }
  }
}