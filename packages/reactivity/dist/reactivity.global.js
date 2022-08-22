var VueReactivity = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
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

  // packages/reactivity/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    effect: () => effect,
    reactive: () => reactive
  });

  // packages/shared/src/index.ts
  var isObject = (val) => typeof val === "object" && val !== null;

  // packages/reactivity/src/effect.ts
  function effect(fn) {
    const effect2 = new ReactiveEffect(fn);
    effect2.run();
  }
  var activeEffect;
  var ReactiveEffect = class {
    constructor(fn) {
      this.fn = fn;
      this.active = true;
      this.deps = [];
    }
    run() {
      if (!this.active) {
        return this.fn();
      } else {
        try {
          this.parent = activeEffect;
          activeEffect = this;
          cleanUpEffects(this);
          return this.fn();
        } finally {
          activeEffect = this.parent;
          this.parent = void 0;
        }
      }
    }
  };
  function cleanUpEffects(effect2) {
    const deps = effect2.deps;
    if (deps.length > 0) {
      deps.forEach((dep) => {
        dep.delete(effect2);
      });
    }
  }
  var targetMap = /* @__PURE__ */ new WeakMap();
  function track(target, opertion, key) {
    if (activeEffect) {
      let depsMap = targetMap.get(target);
      if (!depsMap) {
        targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
      }
      let deps = depsMap.get(key);
      if (!deps) {
        depsMap.set(key, deps = /* @__PURE__ */ new Set());
      }
      deps.add(activeEffect);
      activeEffect.deps.push(deps);
    }
  }
  function trigger(target, opertion, key, value, oldValue) {
    const depsMap = targetMap.get(target);
    if (!depsMap)
      return;
    let effects = depsMap.get(key);
    if (effects) {
      effects = new Set(effects);
      effects.forEach((effect2) => {
        if (effect2 !== activeEffect) {
          effect2.run();
        }
      });
    }
  }

  // packages/reactivity/src/reactive.ts
  var proxyMap = /* @__PURE__ */ new WeakMap();
  function reactive(value) {
    if (!isObject(value)) {
      return value;
    }
    const exitsingProxy = proxyMap.get(value);
    if (exitsingProxy) {
      return exitsingProxy;
    }
    if (value["__v_isReactive" /* IS_REACTIVE */]) {
      return value;
    }
    const proxy = new Proxy(value, {
      get(target, key, receiver) {
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
          return true;
        }
        const res = Reflect.get(target, key, receiver);
        track(target, "get", key);
        if (res && isObject(res)) {
          return reactive(res);
        }
        return res;
      },
      set(target, key, value2, receiver) {
        const oldValue = target[key];
        const res = Reflect.set(target, key, value2, receiver);
        if (!Object.is(oldValue, value2)) {
          trigger(target, "set", key, value2, oldValue);
        }
        return res;
      }
    });
    proxyMap.set(value, proxy);
    return proxy;
  }
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=reactivity.global.js.map
