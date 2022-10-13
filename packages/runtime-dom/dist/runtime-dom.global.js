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
    Fragment: () => Fragment,
    Text: () => Text,
    computed: () => computed,
    createRenderer: () => createRenderer,
    createVNode: () => createVNode,
    customRef: () => customRef,
    effect: () => effect,
    getContext: () => getContext,
    getCurrentInstance: () => getCurrentInstance,
    h: () => h,
    isRef: () => isRef,
    isSameVNodeType: () => isSameVNodeType,
    isVNode: () => isVNode,
    onBeforeMount: () => onBeforeMount,
    onBeforeUpdate: () => onBeforeUpdate,
    onMounted: () => onMounted,
    onUpdated: () => onUpdated,
    proxyRefs: () => proxyRefs,
    reactive: () => reactive,
    ref: () => ref,
    render: () => render,
    toRef: () => toRef,
    toRefs: () => toRefs,
    unref: () => unref,
    useAttrs: () => useAttrs,
    useSlots: () => useSlots
  });

  // packages/shared/src/index.ts
  var isObject = (val) => typeof val === "object" && val !== null;
  var isString = (val) => typeof val === "string";
  var isFunction = (val) => typeof val === "function";
  var isArray = (val) => Array.isArray(val);
  var isNumber = (val) => typeof val === "number";
  var isOn = (key) => /^on[^a-z]/.test(key);
  var invokerArrayFns = (fns) => {
    for (let i = 0; i < fns.length; i++) {
      fns[i]();
    }
  };
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var hasOwn = (obj, key) => hasOwnProperty.call(obj, key);

  // packages/runtime-core/src/vnode.ts
  var isVNode = (val) => !!(val && val.__v_isVNode);
  var Text = Symbol("text");
  var Fragment = Symbol("fragment");
  var isSameVNodeType = (n1, n2) => {
    return n1.type === n2.type && n1.key === n2.key;
  };
  var normalizeVNode = (child) => {
    if (isString(child) || isNumber(child)) {
      return createVNode(Text, null, String(child));
    }
    return child;
  };
  var createVNode = (type, props, children) => {
    var _a;
    const shapeFlag = isString(type) ? 1 /* ELEMENT */ : isObject(type) ? 4 /* STATEFUL_COMPONENT */ : 0;
    const vnode = {
      __v_isVNode: true,
      el: null,
      key: (_a = props == null ? void 0 : props.key) != null ? _a : null,
      type,
      props,
      children,
      shapeFlag
    };
    if (children != void 0) {
      let type2;
      if (isArray(children)) {
        type2 = 16 /* ARRAY_CHILDREN */;
      } else if (isObject(children)) {
        type2 = 32 /* SLOTS_CHILDREN */;
      } else {
        children = String(children);
        type2 = 8 /* TEXT_CHILDREN */;
      }
      vnode.shapeFlag |= type2;
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
  function proxyRefs(objectWithRefs) {
    return isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, {
      get(target, key, receiver) {
        return unref(Reflect.get(target, key, receiver));
      },
      set(target, key, value, receiver) {
        const oldValue = target[key];
        if (isRef(oldValue) && !isRef(value)) {
          oldValue.value = value;
          return true;
        } else {
          return Reflect.set(target, key, value, receiver);
        }
      }
    });
  }

  // packages/runtime-core/src/componentProps.ts
  function initProps(instance, rawProps) {
    const props = {};
    const attrs = {};
    if (rawProps) {
      for (let key in rawProps) {
        const value = rawProps[key];
        if (instance.type.props && hasOwn(instance.type.props, key)) {
          props[key] = value;
        } else {
          attrs[key] = value;
        }
      }
    }
    instance.props = reactive(props);
    instance.attrs = attrs;
  }
  function updateProps(prevProps, nextProps) {
    for (let key in prevProps) {
      if (hasOwn(nextProps, key)) {
        prevProps[key] = nextProps[key];
      } else {
        delete prevProps[key];
      }
    }
  }

  // packages/runtime-core/src/scheduler.ts
  var queue = [];
  var isFlushing = false;
  var resolvedPromise = Promise.resolve();
  function queueJob(job) {
    if (!queue.length || !queue.includes(job)) {
      queue.push(job);
      queueFlash();
    }
  }
  function queueFlash() {
    if (!isFlushing) {
      isFlushing = true;
      resolvedPromise.then(flushJobs);
    }
  }
  function flushJobs() {
    for (let i = 0; i < queue.length; i++) {
      const job = queue[i];
      job();
    }
    queue.length = 0;
    isFlushing = false;
  }
  function nextTick(fn) {
    console.log(1111);
    return fn ? resolvedPromise.then(fn) : resolvedPromise;
  }

  // packages/runtime-core/src/componentPublicInstance.ts
  var publicPropertiesMap = {
    $attrs: (i) => i.attrs,
    $props: (i) => i.props,
    $slots: (i) => i.slots,
    $el: (i) => i.vnode.el,
    $nextTick: (fn) => nextTick.bind(fn)
  };
  var PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
      const { data, props, setupState } = instance;
      if (hasOwn(setupState, key)) {
        return setupState[key];
      } else if (hasOwn(data, key)) {
        return data[key];
      } else if (hasOwn(props, key)) {
        return props[key];
      }
      const publicGetter = publicPropertiesMap[key];
      if (publicGetter) {
        return publicGetter(instance);
      }
    },
    set({ _: instance }, key, value) {
      const { data, props, setupState } = instance;
      if (hasOwn(setupState, key)) {
        setupState[key] = value;
      } else if (hasOwn(data, key)) {
        data[key] = value;
        return true;
      } else if (hasOwn(props, key)) {
        console.warn("prop is readonly");
        return false;
      }
    }
  };

  // packages/runtime-core/src/componentEmits.ts
  function emit(instance, eventName, ...args) {
    const props = instance.vnode.props;
    const handleName = `on${eventName[0].toUpperCase()}${eventName.slice(1)}`;
    const handler = props[handleName];
    if (handler && isFunction(handler)) {
      handler.call(instance, ...args);
    }
  }

  // packages/runtime-core/src/componentSlots.ts
  function initSlots(instance, slots) {
    if (instance.vnode.shapeFlag & 32 /* SLOTS_CHILDREN */) {
      instance.slots = slots;
    }
  }

  // packages/runtime-core/src/component.ts
  var uid = 0;
  function createComponentInstance(vnode) {
    const type = vnode.type;
    const instance = {
      uid: uid++,
      vnode,
      type,
      setupContext: null,
      subTree: null,
      effect: null,
      update: null,
      isMounted: false,
      proxy: null,
      ctx: {},
      data: {},
      props: {},
      attrs: {},
      slots: {},
      exposed: {},
      setupState: null,
      emit: null
    };
    instance.ctx = { _: instance };
    instance.emit = emit.bind(null, instance);
    return instance;
  }
  var currentInstance;
  var getCurrentInstance = () => currentInstance;
  var setCurrentInstance = (i) => currentInstance = i;
  function setupComponent(instance) {
    const { props, children } = instance.vnode;
    const Component = instance.type;
    initProps(instance, props);
    initSlots(instance, children);
    instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);
    const { setup, render: render2, template } = Component;
    if (setup) {
      const setupContext = instance.setupContext = createSetupContext(instance);
      setCurrentInstance(instance);
      const setupResult = setup(instance.props, setupContext);
      setCurrentInstance(null);
      if (isFunction(setupResult)) {
        instance.render = setupResult;
      } else if (isObject(setupResult)) {
        instance.setupState = proxyRefs(setupResult);
      }
    }
    if (!instance.render && render2) {
      instance.render = render2;
    } else {
      if (template) {
      }
    }
    if (!instance.render) {
      instance.render = () => {
      };
    }
  }
  function createSetupContext(instance) {
    const expose = (exposed) => {
      instance.exposed = exposed || {};
    };
    return {
      attrs: instance.attrs,
      emit: instance.emit,
      slots: instance.slots,
      expose
    };
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
        const child = children[i] = isString(children[i]) || isNumber(children[i]) ? normalizeVNode(children[i]) : children[i];
        patch(null, child, el);
      }
    };
    const mountElement = (vnode, container, anchor) => {
      const { type, children, shapeFlag, props } = vnode;
      const el = vnode.el = hostCreateElement(type);
      if (shapeFlag & 8 /* TEXT_CHILDREN */) {
        hostSetElementText(el, children);
      } else if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
        mountChildren(children, el);
      }
      if (props) {
        for (const key in props) {
          hostPatchProp(el, key, null, props[key]);
        }
      }
      hostInsert(el, container, anchor);
    };
    const mountComponent = (vnode, container, anchor) => {
      const instance = vnode.component = createComponentInstance(vnode);
      setupComponent(instance);
      setupRenderEffect(instance, vnode, container, anchor);
    };
    const updateComponent = (n1, n2) => {
      const instance = n2.component = n1.component;
      instance.next = n2;
      instance.update();
    };
    const setupRenderEffect = (instance, vnode, container, anchor) => {
      const { render: render3 } = instance;
      const { data } = instance.type;
      let state;
      if (data) {
        state = instance.data = reactive(data());
      }
      const componentUpdateFn = () => {
        if (!instance.isMounted) {
          const { bm, m } = instance;
          if (bm) {
            invokerArrayFns(bm);
          }
          const subtree = instance.subTree = render3.call(instance.proxy, state);
          patch(null, subtree, container, anchor);
          instance.isMounted = true;
          vnode.el = subtree.el;
          if (m) {
            invokerArrayFns(m);
          }
        } else {
          let { next, vnode: vnode2, bu, u } = instance;
          if (next) {
            updateComponentPreRender(instance, next);
          } else {
            next = vnode2;
          }
          if (bu) {
            invokerArrayFns(bu);
          }
          const nextTree = render3.call(instance.proxy, state);
          const preTree = instance.subTree;
          patch(preTree, nextTree, container, anchor);
          instance.subTree = nextTree;
          next.el = nextTree.el;
          if (u) {
            invokerArrayFns(u);
          }
        }
      };
      const effect2 = instance.effect = new ReactiveEffect(componentUpdateFn, {
        scheduler: () => queueJob(update)
      });
      const update = instance.update = effect2.run.bind(effect2);
      update();
    };
    const updateComponentPreRender = (instance, nextVNode) => {
      const prevProps = instance.props;
      const nextProps = nextVNode.props;
      updateProps(prevProps, nextProps);
      instance.next = null;
      instance.vnode = nextVNode;
    };
    const patchProps = (oldProps, newProps, el) => {
      for (const key in newProps) {
        hostPatchProp(el, key, oldProps[key], newProps[key]);
      }
      for (const key in oldProps) {
        if (newProps[key] == null) {
          hostPatchProp(el, key, oldProps[key], null);
        }
      }
    };
    const unmountChildren = (vnodes) => {
      for (let i = 0; i < vnodes.length; i++) {
        unmount(vnodes[i]);
      }
    };
    const patchedKeyChildren = (c1, c2, container) => {
      let i = 0;
      let e1 = c1.length - 1;
      let e2 = c2.length - 1;
      while (i <= e1 && i <= e2) {
        const n1 = c1[i];
        const n2 = normalizeVNode(c2[i]);
        if (isSameVNodeType(n1, n2)) {
          patch(n1, n2, container);
        } else {
          break;
        }
        i++;
      }
      while (i <= e1 && i <= e2) {
        const n1 = c1[e1];
        const n2 = normalizeVNode(c2[e2]);
        if (isSameVNodeType(n1, n2)) {
          patch(n1, n2, container);
        } else {
          break;
        }
        e1--;
        e2--;
      }
      if (i > e1) {
        if (i <= e2) {
          while (i <= e2) {
            const nextPos = e2 + 1;
            const anchor = nextPos < c2.length ? c2[nextPos].el : null;
            patch(null, normalizeVNode(c2[i]), container, anchor);
            i++;
          }
        }
      } else if (i > e2) {
        while (i <= e1) {
          unmount(c1[i]);
          i++;
        }
      } else {
        let s1 = i;
        let s2 = i;
        let j;
        const toBePatched = e2 - s2 + 1;
        const keyToNewIndexMap = /* @__PURE__ */ new Map();
        const newIndexToOldIndexMap = Array(toBePatched).fill(0);
        for (let i2 = s2; i2 <= e2; i2++) {
          keyToNewIndexMap.set(c2[i2].key, i2);
        }
        for (let i2 = s1; i2 <= e1; i2++) {
          const prevChild = c1[i2];
          const newIndex = keyToNewIndexMap.get(prevChild.key);
          if (newIndex == void 0) {
            unmount(prevChild);
          } else {
            newIndexToOldIndexMap[newIndex - s2] = i2 + 1;
            patch(prevChild, c2[newIndex], container);
          }
        }
        const increasingNewIndexSequence = getSequence(newIndexToOldIndexMap);
        j = increasingNewIndexSequence.length - 1;
        for (let i2 = toBePatched - 1; i2 >= 0; i2--) {
          const nextIndex = s2 + i2;
          const nextChild = c2[nextIndex];
          const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null;
          if (!nextChild.el) {
            patch(null, nextChild, container, anchor);
          } else {
            if (i2 !== increasingNewIndexSequence[j]) {
              hostInsert(nextChild.el, container, anchor);
            } else {
              j--;
            }
          }
        }
      }
    };
    const patchChildren = (n1, n2, el, container) => {
      const c1 = n1.children;
      const c2 = n2.children;
      const prevShapeFlag = n1.shapeFlag;
      const shapeFlag = n2.shapeFlag;
      if (shapeFlag & 8 /* TEXT_CHILDREN */) {
        if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
          unmountChildren(c1);
        }
        if (c1 !== c2) {
          hostSetElementText(el, c2);
        }
      } else {
        if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
          if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
            patchedKeyChildren(c1, c2, el);
          } else {
            unmountChildren(c1);
          }
        } else {
          if (prevShapeFlag & 8 /* TEXT_CHILDREN */) {
            hostSetElementText(el, "");
          }
          if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
            mountChildren(c2, el);
          }
        }
      }
    };
    const patchElement = (n1, n2, container) => {
      const el = n2.el = n1.el;
      const oldProps = n1.props || {};
      const newProps = n2.props || {};
      patchProps(oldProps, newProps, el);
      patchChildren(n1, n2, el, container);
    };
    const processElement = (n1, n2, container, anchor) => {
      if (n1 == null) {
        mountElement(n2, container, anchor);
      } else {
        patchElement(n1, n2, container);
      }
    };
    const processText = (n1, n2, container) => {
      if (n1 == null) {
        const el = n2.el = hostCreateText(n2.children);
        hostInsert(el, container);
      } else {
        const el = n2.el = n1.el;
        if (n2.children !== n1.children) {
          hostSetText(el, n2.children);
        }
      }
    };
    const processFragment = (n1, n2, container, anchor) => {
      if (n1 == null) {
        mountChildren(n2.children, container);
      } else {
        patchChildren(n1, n2, container, anchor);
      }
    };
    const processComponent = (n1, n2, container, anchor) => {
      if (n1 == null) {
        mountComponent(n2, container, anchor);
      } else {
        updateComponent(n1, n2);
      }
    };
    const patch = (n1, n2, container, anchor = null) => {
      if (n1 && !isSameVNodeType(n1, n2)) {
        unmount(n1);
        n1 = null;
      }
      const { type, shapeFlag } = n2;
      switch (type) {
        case Text:
          processText(n1, n2, container);
          break;
        case Fragment:
          processFragment(n1, n2, container, anchor);
          break;
        default:
          if (shapeFlag & 1 /* ELEMENT */) {
            processElement(n1, n2, container, anchor);
          } else if (shapeFlag & 4 /* STATEFUL_COMPONENT */) {
            processComponent(n1, n2, container, anchor);
          }
      }
    };
    const unmount = (vnode) => {
      const { el, type } = vnode;
      if (type === Fragment) {
        unmountChildren(vnode.children);
      } else {
        hostRemove(el);
      }
    };
    const render2 = (vnode, container) => {
      if (vnode == null) {
        if (container._vnode) {
          unmount(container._vnode);
        }
      } else {
        patch(container._vnode || null, vnode, container);
      }
      container._vnode = vnode;
    };
    return {
      render: render2
    };
  }
  function getSequence(arr) {
    let len = arr.length;
    let result = [0];
    let start, end, mid;
    let p = arr.slice();
    for (let i2 = 0; i2 < len; i2++) {
      const arrI = arr[i2];
      const j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i2] = j;
        result.push(i2);
        continue;
      }
      start = 0;
      end = result.length - 1;
      while (start < end) {
        mid = start + end >> 1;
        if (arr[result[mid]] < arrI) {
          start = mid + 1;
        } else {
          end = mid;
        }
      }
      if (arrI < arr[result[start]]) {
        if (start > 0) {
          p[i2] = result[start - 1];
        }
        result[start] = i2;
      }
    }
    let i = result.length;
    let lastIndex = result[i - 1];
    while (i-- > 0) {
      result[i] = lastIndex;
      lastIndex = p[lastIndex];
    }
    return result;
  }

  // packages/runtime-core/src/apiSetupHelpers.ts
  var getContext = () => {
    const i = getCurrentInstance();
    return i.setupContext;
  };
  var useAttrs = () => {
    return getContext().attrs;
  };
  var useSlots = () => {
    return getContext().slots;
  };

  // packages/runtime-core/src/apiLifecycle.ts
  var injectHook = (lifecycle, hook, target) => {
    const hooks = target[lifecycle] || (target[lifecycle] = []);
    const wrappedHook = () => {
      setCurrentInstance(target);
      hook();
      setCurrentInstance(null);
    };
    hooks.push(wrappedHook);
  };
  var createHook = (lifecycle) => (hook, target = currentInstance) => injectHook(lifecycle, hook, target);
  var onBeforeMount = createHook("bm" /* BEFORE_MOUNT */);
  var onMounted = createHook("m" /* MOUNTED */);
  var onBeforeUpdate = createHook("bu" /* BEFORE_UPDATE */);
  var onUpdated = createHook("u" /* UPDATED */);

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
  var patchStyle = (el, oldStyle, newStyle) => {
    if (!newStyle)
      newStyle = {};
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
