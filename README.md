# 1. 搭建开发环境

- 初始化
  pnpm init 创建 package.json -创建 packages/reactivity 和 packages/shared 目录
  初始化 reactivity,shared 目录下的 package.json
  初始化 tsconfig
  创建 pnpm-workspace.yaml 文件(声明工作空间目录)
  pnpm install vue -w (-w 是让所有工作目录都可以使用)
  pnpm install typescript minimist esbuild -D -w
  创建 .npmrc ,填写 shamefully-hoist 为 true,是为了提升依赖

- 修改开发脚本,package.json 下添加 scripts 命令
  ```json
  "scripts": {
    "dev": "node ./scripts/dev.js"
  }
  ```
- 创建 scripts/dev.js 文件

  ```javascript
  const args = require("minimist")(process.argv.slice(2));
  const { resolve } = require("path");
  const { build } = require("esbuild");
  const target = args.\_[0] || "reactivity";
  const format = args.format || "global";
  const pkg = require(resolve(\_\_dirname, `../packages/${target}/package.json`));
  const outoutFormat =
  format === "global" ? "iife" : format === "cjs" ? "cjs" : "esm";
  const outfile = resolve(
  __dirname,
  `../packages/${target}/dist/${target}.${format}.js`
  );
  // reactivity/dist/reactivity.global.js
  // index.html 中 window.Vue window.VueReactivity

  build({
  entryPoints: [resolve(**dirname, `../packages/${target}/src/index.ts`)],
  outfile,
  format: outoutFormat,
  sourcemap: true,
  globalName: pkg?.buildOptions?.name,
  bundle: true, // 把你依赖的包打包进来
  watch: {
  onRebuild(err) {
  if (!err) console.log("~~~");
  },
  },
  }).then(() => {
  console.log("启动成功");
  });
  ```

# 2. 实现 reactive

1.  reactive 是用来定义响应式数据的,就类似与 vue2 中的 data
2.  reactive 只能定义对象类型的数据
3.  reactive 是懒代理,默认不会进行深度递归,只有当取值的时候才会进行代理
4.  reactive 会将代理过的对象缓存到一个对象中,如果重复代理,会将此对象从缓存中取出返回
5.  reactive 会将 proxy 对象标记一下,如果下次代理的是一个 proxy 对象,会判断是否有该标记,如果有该标记,就说明本身就是一个 proxy 对象,无需重复代理

```typescript
const proxyMap = new WeakMap(); // 只能用对象作为key,弱引用
const enum Reactive_FLAGS {
  IS_REACTIVE = "__v_isReactive",
}
function reactive(value) {
  // 只能定义对象类型的数据

  if (!isObject(value)) {
    return value;
  }

  if (value[Reactive_FLAGS.IS_REACTIVE]) {
    return value;
  }
  // reactive 会将 proxy 对象标记一下,如果下次代理的是一个 proxy 对象,会判断是否有该标记,如果有该标记,就说明本身就是一个 proxy 对象,无需重复代理
  const exitsingProxy = proxyMap.get(value);
  if (exitsingProxy) {
    // 会将代理过的对象缓存到一个对象中,如果重复代理,会将此对象从缓存中取出返回
    return exitsingProxy;
  }

  const proxy = new Proxy(value, {
    get(target, key, receiver) {
      if (key === Reactive_FLAGS.IS_REACTIVE) {
        return true;
      }
      // receiver就是代理对象
      const res = Reflect.get(target, key, receiver);
      if (res && isObject(res)) {
        return reactive(res);
      }
      return res;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      target[key] = value;
      const res = Reflect.set(target, key, value, receiver);
      return res;
    },
  });
  proxyMap.set(value, proxy);

  return proxy;
}
```

# 3. 实现 effect

1. 默认会先执行一次函数
2. 函数内部如果读取了响应式数据,会触发 get
3. 在 get 会将当前 effect 关联起来( `track` 函数)
   ```javascript
    WeakMap{
      object:Map{
        key:Set[effect1,effect2]
      }
    }
   ```
4. 当响应式数据发生变化,会找到对应的 effect 函数重新执行(`trigger`函数)

```typescript
let activeEffect;
function effect(fn) {
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
```

# 4. track

> 依赖收集,实现 `3-3的数据结构`

```typescript
const proxyMap = new WeakMap();
function track(target, key) {
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

// get函数
const baseHandler = {
  get(target, key, receiver) {
    ...
    const res = Reflect.get(target, key, receiver);
    track(target, key);
    ...
    return res;
  },

};
```

# 5. trigger

> 让收集的对应依赖执行

```typescript
function trigger(target, key, value, oldValue) {
  const depsMap = proxyMap.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(key);
  effects.forEach((effect) => effect.run());
}

// set函数中
const baseHandler = {
  get(target, key, receiver) {...},
  set(target, key, value, receiver) {
    ...
    const res = Reflect.set(target, key, value, receiver);
    // oldValue !== value
    if (!Object.is(oldValue, value)) {
      trigger(target, key, value, oldValue);
    }
    return res;
  },
};
```
