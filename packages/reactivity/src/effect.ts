export let activeEffect;
export function effect(fn) {
  const effect = new ReactiveEffect(fn);
  effect.run();
}

class ReactiveEffect {
  public parent; // 记录当前的父亲是谁
  public acitve = true; // 当前是否是激活状态
  public deps = []; // 用来清理依赖的
  constructor(public fn) {}
  run() {
    if (!this.acitve) {
      return this.fn();
    } else {
      try {
        this.parent = activeEffect;
        activeEffect = this;
        return this.fn();
      } finally {
        activeEffect = this.parent;
        this.parent = undefined;
      }
    }
  }
}

// WeakMap:{object : Map{age:Set[f1,f2]}}
const proxyMap = new WeakMap();
export function track(target, key) {
  // fn
  if (activeEffect) {
    let depsMap = proxyMap.get(target);
    if (!depsMap) {
      proxyMap.set(target, (depsMap = new Map()));
    }
    let deps = depsMap.get(key);
    if (!deps) {
      depsMap.set(key, (deps = new Set()));
    }
    deps.add(activeEffect);
    activeEffect.deps.push(deps);
    console.log(proxyMap, "proxyMap");
  }
}

export function trigger(target, key, value, oldValue) {
  const depsMap = proxyMap.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(key);
  effects.forEach((effect) => effect.run());
}
