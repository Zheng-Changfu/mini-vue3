import { isObject } from "@vue/shared";
import { baseHandler } from "./baseHandlers";

const proxyMap = new WeakMap(); // 只能用对象作为key,弱引用
export const enum Reactive_FLAGS {
  IS_REACTIVE = "__v_isReactive",
}
export function reactive(value) {
  // 只能定义对象类型的数据

  if (!isObject(value)) {
    return value;
  }
  // value:proxy
  // const obj = {a:1}
  // const proxy1 = reactive(obj)
  // const proxy2 = reactive(proxy1)
  // proxy1 === proxy2
  if (value[Reactive_FLAGS.IS_REACTIVE]) {
    return value;
  }
  // reactive 会将 proxy 对象标记一下,如果下次代理的是一个 proxy 对象,会判断是否有该标记,如果有该标记,就说明本身就是一个 proxy 对象,无需重复代理
  const exitsingProxy = proxyMap.get(value);
  //  const obj = {a:1}
  // const proxy1 = reactive(obj)
  // const proxy2 = reactive(obj)
  // proxy1 === proxy2
  if (exitsingProxy) {
    // 会将代理过的对象缓存到一个对象中,如果重复代理,会将此对象从缓存中取出返回
    return exitsingProxy;
  }
  
  const proxy = new Proxy(value, baseHandler);
  proxyMap.set(value, proxy);

  return proxy;
}
