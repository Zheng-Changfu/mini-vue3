import { isObject } from "@vue/shared";
import { track, trigger } from "./effect";
export const enum Reactive_FLAGS {
  IS_REACTIVE = "__v_isReactive",
}
const proxyMap = new WeakMap();
export function reactive(value) {
  if (!isObject(value)) {
    return value;
  }
  const exitsingProxy = proxyMap.get(value);
  // 如果已经被代理过，无需重复代理
  if (exitsingProxy) {
    return exitsingProxy;
  }
  // 如果已经是代理对象，无需重复代理
  if (value[Reactive_FLAGS.IS_REACTIVE]) {
    return value;
  }
  const proxy = new Proxy(value, {
    get(target, key, receiver) {
      if (key === Reactive_FLAGS.IS_REACTIVE) {
        return true;
      }
      const res = Reflect.get(target, key, receiver);
      track(target, "get", key);
      if (res && isObject(res)) {
        return reactive(res);
      }
      return res;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const res = Reflect.set(target, key, value, receiver);
      if (!Object.is(oldValue, value)) {
        trigger(target, "set", key, value, oldValue);
      }
      return res;
    },
  });
  proxyMap.set(value, proxy);
  return proxy;
}
