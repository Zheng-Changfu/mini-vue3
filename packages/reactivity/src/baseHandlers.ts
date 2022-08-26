import { isObject } from "@vue/shared";
import { track, trigger } from "./effect";
import { reactive, Reactive_FLAGS } from "./reactive";

export const baseHandler = {
  get(target, key, receiver) {
    if (key === Reactive_FLAGS.IS_REACTIVE) {
      return true;
    }
    // receiver就是代理对象
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
  },
};
