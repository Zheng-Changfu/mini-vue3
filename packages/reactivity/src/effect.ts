export function effect(fn) {
  const effect = new ReactiveEffect(fn);
  effect.run();
}
export let activeEffect;
class ReactiveEffect {
  public parent; // 记录当前 effect 的父亲
  public active = true; // 默认是激活状态
  public deps = []; // 收集的依赖，后续会用于清理工作
  constructor(public fn) {}
  run() {
    if (!this.active) {
      return this.fn();
    } else {
      try {
        this.parent = activeEffect; // 第一次是 undefined
        activeEffect = this;
        // 每次执行函数前都清除之前的依赖
        cleanUpEffects(this);
        return this.fn();
      } finally {
        activeEffect = this.parent;
        this.parent = undefined;
      }
    }
  }
}

function cleanUpEffects(effect) {
  const deps = effect.deps;
  if (deps.length > 0) {
    deps.forEach((dep) => {
      dep.delete(effect);
    });
  }
}

const targetMap = new WeakMap();
export function track(target, opertion, key) {
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()));
    }
    let deps = depsMap.get(key);
    if (!deps) {
      depsMap.set(key, (deps = new Set()));
    }
    deps.add(activeEffect);
    activeEffect.deps.push(deps);
  }
}

export function trigger(target, opertion, key, value, oldValue) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  let effects = depsMap.get(key);
  if (effects) {
    effects = new Set(effects);
    effects.forEach((effect) => {
      if (effect !== activeEffect) {
        effect.run();
      }
    });
  }
}
