export let activeEffect;
export function effect(fn, options) {
  const effect = new ReactiveEffect(fn, options);
  effect.run();
  const runner = effect.run.bind(effect);
  runner.effect = effect;
  return runner;
}

function cleanUpEffect(effect) {
  const deps = effect.deps;
  if (deps.length > 0) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect);
    }
    deps.length = 0;
  }
}

export class ReactiveEffect {
  public parent; // 记录当前的父亲是谁
  public acitve = true; // 当前是否是激活状态
  public deps = []; // 用来清理依赖的
  // fn = componentUpdateFn
  constructor(public fn, public options?) { }
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
        this.parent = undefined;
      }
    }
  }
}

const proxyMap = new WeakMap();
export function track(target, key) {
  // fn
  if (activeEffect) {
    // f {ComputedRefImpl:{value:Set[f]} }
    let depsMap = proxyMap.get(target); // ComputedRefImpl
    if (!depsMap) {
      proxyMap.set(target, (depsMap = new Map()));
    }
    let deps = depsMap.get(key); // value
    if (!deps) {
      depsMap.set(key, (deps = new Set()));
    }
    trackEffect(deps);
  }
}

export function trackEffect(deps) {
  if (activeEffect) {
    deps.add(activeEffect);
    activeEffect.deps.push(deps);
  }
}

export function trigger(target, key, value, oldValue) {
  const depsMap = proxyMap.get(target); // {value:Set[f]}
  if (!depsMap) return;
  let effects = depsMap.get(key);
  triggerEffect(effects);
}

export function triggerEffect(effects) {
  if (effects) {
    effects = [...new Set(effects)];
    effects.forEach((effect) => {
      if (effect !== activeEffect) {
        if (effect.options?.scheduler) {
          effect.options.scheduler();
        } else {
          effect.run();
        }
      }
    });
  }
}
