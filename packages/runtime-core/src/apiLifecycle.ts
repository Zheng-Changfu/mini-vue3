import {
  currentInstance,
  LifecycleHooks,
  setCurrentInstance,
} from "./component";

export function injectHook(type, hook, instance) {
  const hooks = instance[type] || (instance[type] = []); // m:[fn,fn,fn]
  const wrappedHook = () => {
    setCurrentInstance(instance);
    const res = hook();
    setCurrentInstance(null);
    return res;
  };
  hooks.push(wrappedHook);
}

export const createHook =
  (type) =>
  (hook, instance = currentInstance) =>
    injectHook(type, hook, instance);

export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT);
export const onMounted = createHook(LifecycleHooks.MOUNTED);
export const onBeforeUpdate = createHook(LifecycleHooks.BEFORE_UPDATE);
export const onUpdated = createHook(LifecycleHooks.UPDATED);
export const onBeforeUnmount = createHook(LifecycleHooks.BEFORE_UNMOUNT);
export const onUnmounted = createHook(LifecycleHooks.UNMOUNTED);
// <template> <div @change="(..args) => fn('1',...args)"></div></template>
// fn 有2个参数,但是我还想加一个
