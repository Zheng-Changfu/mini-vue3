import { isFunction, isObject } from "@vue/shared";
import { ReactiveEffect } from "./effect";
import { isReactive } from "./reactive";

const initVal = {};
export function watch(source, cb, options) {
  const { immediate } = options ?? {};
  let getter: () => any;

  if (isReactive(source)) {
    // watch(state,() =>{})
    getter = () => traverse(source);
  } else if (isFunction(source)) {
    // watch(() => state.age,() => {})
    getter = source;
  }

  let oldValue = initVal;

  const job = () => {
    console.log("更新");
    if (cb) {
      const newValue = effect.run();
      if (!Object.is(newValue, oldValue)) {
        cb(newValue, oldValue === initVal ? undefined : oldValue);
        oldValue = newValue;
      }
    }
  };

  const effect = new ReactiveEffect(getter, { scheduler: job });
  if (immediate) {
    job();
  } else {
    oldValue = effect.run();
  }
}

/**
 *
 *
 * const o = {
 *  a:1
 * }
 * o.b = o
 */

function traverse(target, set = new Set()) {
  if (!isObject(target)) return target;
  if (set.has(target)) return target;
  set.add(target);

  for (const key in target) {
    traverse(target[key], set);
  }

  return target;
}
