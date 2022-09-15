var VueRuntimeDOM = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // packages/runtime-dom/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    computed: () => computed,
    createRenderer: () => createRenderer,
    createVNode: () => createVNode,
    customRef: () => customRef,
    effect: () => effect,
    h: () => h,
    isRef: () => isRef,
    reactive: () => reactive,
    ref: () => ref,
    render: () => render,
    toRef: () => toRef,
    toRefs: () => toRefs,
    unref: () => unref
  });

  // packages/shared/src/index.ts
  var isObject = (val) => typeof val === "object" && val !== null;
  var isString = (val) => typeof val === "string";
  var isFunction = (val) => typeof val === "function";
  var isArray = (val) => Array.isArray(val);
  var isOn = (key) => /^on[^a-z]/.test(key);

  // packages/runtime-core/src/vnode.ts
  var isVNode = (val) => !!(val && val.__v_isVNode);
  var createVNode = (type, props, children) => {
    const shapeFlag = isString(type) ? 1 /* ELEMENT */ : 0;
    const vnode = {
      __v_isVNode: true,
      el: null,
      key: null,
      type,
      props,
      children,
      shapeFlag
    };
    if (children) {
      vnode.shapeFlag |= isString(children) ? 8 /* TEXT_CHILDREN */ : 16 /* ARRAY_CHILDREN */;
    }
    return vnode;
  };

  // packages/runtime-core/src/h.ts
  function h(type, propsOrChildren, children) {
    const l = arguments.length;
    if (l === 2) {
      if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
        if (isVNode(propsOrChildren)) {
          return createVNode(type, null, [propsOrChildren]);
        }
        return createVNode(type, propsOrChildren, null);
      } else {
        return createVNode(type, null, propsOrChildren);
      }
    } else {
      if (l > 3) {
        children = Array.prototype.slice.call(arguments, 2);
      } else if (l === 3 && isVNode(children)) {
        children = [children];
      }
      return createVNode(type, propsOrChildren, children);
    }
  }

  // packages/runtime-core/src/renderer.ts
  function createRenderer(options) {
    const {
      insert: hostInsert,
      remove: hostRemove,
      patchProp: hostPatchProp,
      createElement: hostCreateElement,
      createText: hostCreateText,
      setText: hostSetText,
      setElementText: hostSetElementText,
      parentNode: hostParentNode,
      nextSibling: hostNextSibling
    } = options;
    const mountChildren = (children, el) => {
      for (let i = 0; i < children.length; i++) {
        const child = children[i] = normalizeVNode(children[i]);
        patch(null, child, el);
      }
    };
    const mountElement = (vnode, container) => {
      const { type, shapeFlag, children } = vnode;
      const el = vnode.el = hostCreateElement(type);
      if (shapeFlag & 8 /* TEXT_CHILDREN */) {
        hostSetElementText(el, children);
      } else if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
        mountChildren(children, el);
      }
    };
    const processElement = (n1, n2, container) => {
      if (n1 == null) {
        mountElement(n2, container);
      }
    };
    const patch = (n1, n2, container) => {
      const { type, shapeFlag } = n2;
      switch (type) {
        default:
          if (shapeFlag & 1 /* ELEMENT */) {
            processElement(n1, n2, container);
          }
          break;
      }
    };
    const render2 = (vnode, container) => {
      if (vnode == null) {
      } else {
        patch(container._vnode || null, vnode, container);
      }
      container._vnode = vnode;
    };
    return {
      render: render2
    };
  }

  // packages/reactivity/src/effect.ts
  var activeEffect;
  function effect(fn, options) {
    const effect2 = new ReactiveEffect(fn, options);
    effect2.run();
    const runner = effect2.run.bind(effect2);
    runner.effect = effect2;
    return runner;
  }
  function cleanUpEffect(effect2) {
    const deps = effect2.deps;
    if (deps.length > 0) {
      for (let i = 0; i < deps.length; i++) {
        deps[i].delete(effect2);
      }
      deps.length = 0;
    }
  }
  var ReactiveEffect = class {
    constructor(fn, options) {
      this.fn = fn;
      this.options = options;
      this.acitve = true;
      this.deps = [];
    }
    run() {
      if (!this.acitve) {
        return this.fn();
      } else {
        try {
          this.parent = activeEffect;
          activeEffect = this;
          cleanUpEffect(this);
          return this.fn();
        } finally {
          activeEffect = this.parent;
          this.parent = void 0;
        }
      }
    }
  };
  var proxyMap = /* @__PURE__ */ new WeakMap();
  function track(target, key) {
    if (activeEffect) {
      let depsMap = proxyMap.get(target);
      if (!depsMap) {
        proxyMap.set(target, depsMap = /* @__PURE__ */ new Map());
      }
      let deps = depsMap.get(key);
      if (!deps) {
        depsMap.set(key, deps = /* @__PURE__ */ new Set());
      }
      trackEffect(deps);
    }
  }
  function trackEffect(deps) {
    if (activeEffect) {
      deps.add(activeEffect);
      activeEffect.deps.push(deps);
    }
  }
  function trigger(target, key, value, oldValue) {
    const depsMap = proxyMap.get(target);
    if (!depsMap)
      return;
    let effects = depsMap.get(key);
    triggerEffect(effects);
  }
  function triggerEffect(effects) {
    if (effects) {
      effects = [...new Set(effects)];
      effects.forEach((effect2) => {
        var _a;
        if (effect2 !== activeEffect) {
          if ((_a = effect2.options) == null ? void 0 : _a.scheduler) {
            effect2.options.scheduler();
          } else {
            effect2.run();
          }
        }
      });
    }
  }

  // packages/reactivity/src/baseHandlers.ts
  var baseHandler = {
    get(target, key, receiver) {
      if (key === "__v_isReactive" /* IS_REACTIVE */) {
        return true;
      }
      const res = Reflect.get(target, key, receiver);
      track(target, key);
      if (res && isObject(res)) {
        return reactive(res);
      }
      return res;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const res = Reflect.set(target, key, value, receiver);
      if (!Object.is(oldValue, value)) {
        trigger(target, key, value, oldValue);
      }
      return res;
    }
  };

  // packages/reactivity/src/reactive.ts
  var proxyMap2 = /* @__PURE__ */ new WeakMap();
  function toReactive(val) {
    return isObject(val) ? reactive(val) : val;
  }
  var isReactive = (val) => val && val["__v_isReactive" /* IS_REACTIVE */];
  function reactive(value) {
    if (!isObject(value)) {
      return value;
    }
    if (value["__v_isReactive" /* IS_REACTIVE */]) {
      return value;
    }
    const exitsingProxy = proxyMap2.get(value);
    if (exitsingProxy) {
      return exitsingProxy;
    }
    const proxy = new Proxy(value, baseHandler);
    proxyMap2.set(value, proxy);
    return proxy;
  }

  // packages/reactivity/src/computed.ts
  function computed(getterOrOptions) {
    const isOnlyGetter = isFunction(getterOrOptions);
    let getter;
    let setter;
    if (isOnlyGetter) {
      getter = getterOrOptions;
      setter = () => {
      };
    } else {
      getter = getterOrOptions.get;
      setter = getterOrOptions.set;
    }
    return new ComputedImpl(getter, setter);
  }
  var ComputedImpl = class {
    constructor(getter, setter) {
      this.getter = getter;
      this.setter = setter;
      this.__v_isRef = true;
      this._dirty = true;
      this._effect = new ReactiveEffect(getter, {
        scheduler: () => {
          if (!this._dirty) {
            this._dirty = true;
            triggerEffect(this.deps);
          }
        }
      });
    }
    get value() {
      trackEffect(this.deps || (this.deps = /* @__PURE__ */ new Set()));
      if (this._dirty) {
        this._dirty = false;
        this._value = this._effect.run();
      }
      return this._value;
    }
    set value(val) {
      this.setter(val);
    }
  };

  // packages/reactivity/src/ref.ts
  function ref(val) {
    if (isRef(val)) {
      return val;
    }
    return new RefImpl(val);
  }
  var RefImpl = class {
    constructor(_rawValue) {
      this._rawValue = _rawValue;
      this.__v_isRef = true;
      this._rawValue = _rawValue;
      this._value = toReactive(_rawValue);
    }
    get value() {
      trackEffect(this._deps || (this._deps = /* @__PURE__ */ new Set()));
      return this._value;
    }
    set value(val) {
      console.log(val, "val");
      if (!Object.is(val, this._rawValue)) {
        this._rawValue = val;
        this._value = toReactive(this._rawValue);
        triggerEffect(this._deps);
      }
    }
  };
  function isRef(val) {
    return val && val.__v_isRef;
  }
  function toRef(target, key, defaultValue) {
    if (!isReactive(target))
      return target;
    return new ObjectRefImpl(target, key, defaultValue);
  }
  var ObjectRefImpl = class {
    constructor(source, key, defaultValue) {
      this.source = source;
      this.key = key;
      this.defaultValue = defaultValue;
      this.__v_isRef = true;
    }
    get value() {
      const res = this.source[this.key];
      return res === void 0 ? this.defaultValue : res;
    }
    set value(newVal) {
      this.source[this.key] = newVal;
    }
  };
  function toRefs(object) {
    let res = {};
    for (const key in object) {
      res[key] = toRef(object, key);
    }
    return res;
  }
  function unref(val) {
    return isRef(val) ? val.value : val;
  }
  function customRef(factory) {
    return new CustomRefImpl(factory);
  }
  var CustomRefImpl = class {
    constructor(factory) {
      this.factory = factory;
      this.__v_isRef = true;
      const { get, set } = factory(
        () => trackEffect(this._deps || (this._deps = /* @__PURE__ */ new Set())),
        () => triggerEffect(this._deps)
      );
      this.get = get;
      this.set = set;
    }
    get value() {
      return this.get();
    }
    set value(newVal) {
      this.set(newVal);
    }
  };

  // packages/runtime-dom/src/nodeOps.ts
  var nodeOps = {
    insert(element, parent, anchor) {
      parent.insertBefore(element, anchor);
    },
    remove(element) {
      const parent = element.parentNode;
      if (parent) {
        parent.removeChild(element);
      }
    },
    createElement(tagName) {
      return document.createElement(tagName);
    },
    createText(text) {
      return document.createTextNode(text);
    },
    setText(el, text) {
      el.nodeValue = text;
    },
    setElementText(el, text) {
      el.textContent = text;
    },
    parentNode(el) {
      return el.parentNode;
    },
    nextSibling(el) {
      return el.nextSibling;
    },
    querySelector(selectors) {
      return document.querySelector(selectors);
    }
  };

  // packages/runtime-dom/src/modules/attr.ts
  var patchAttr = (el, key, value) => {
    if (value == null) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, value);
    }
  };

  // packages/runtime-dom/src/modules/class.ts
  var patchClass = (el, nextValue) => {
    if (!nextValue) {
      el.removeAttribute("class");
    } else {
      el.className = nextValue;
    }
  };

  // packages/runtime-dom/src/modules/event.ts
  var patchEvent = (el, key, preValue, nextValue) => {
    const invokers = el._vei || (el._vei = {});
    const exitstingInvoker = invokers[key];
    if (exitstingInvoker && nextValue) {
      invokers.value = nextValue;
    } else {
      if (nextValue) {
        const invoker = invokers[key] = createInvoker(nextValue);
        el.addEventListener(key.slice(2).toLowerCase(), invoker);
      } else if (exitstingInvoker) {
        el.removeEventListener(key.slice(2).toLowerCase(), exitstingInvoker);
        invokers[key] = void 0;
      }
    }
  };
  function createInvoker(fn) {
    const invoker = (e) => {
      invoker.value(e);
    };
    invoker.value = fn;
    return invoker;
  }

  // packages/runtime-dom/src/modules/style.ts
  var patchStyle = (el, oldStyle, newStyle = {}) => {
    const style = el.style;
    for (const key in newStyle) {
      style[key] = newStyle[key];
    }
    if (oldStyle) {
      for (const key in oldStyle) {
        if (!Reflect.has(newStyle, key)) {
          style[key] = "";
        }
      }
    }
  };

  // packages/runtime-dom/src/patchProp.ts
  var patchProp = (el, key, preValue, nextValue) => {
    if (key === "class") {
      patchClass(el, nextValue);
    } else if (key === "style") {
      patchStyle(el, preValue, nextValue);
    } else if (isOn(key)) {
      patchEvent(el, key, preValue, nextValue);
    } else {
      patchAttr(el, key, nextValue);
    }
  };

  // packages/runtime-dom/src/index.ts
  var rendererOps = __spreadValues({
    patchProp
  }, nodeOps);
  var render = (vnode, container) => {
    const { render: _render } = createRenderer(rendererOps);
    return _render(vnode, container);
  };
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=runtime-dom.global.js.map
