import {
  currentInstance,
  LifecycleHooks,
  setCurrentInstance,
} from "./component";

export const injectHook = (lifecycle, hook, target) => {
  const hooks = target[lifecycle] || (target[lifecycle] = []);
  const wrappedHook = () => {
    setCurrentInstance(target);
    hook();
    setCurrentInstance(null);
  };
  hooks.push(wrappedHook);
};

export const createHook =
  (lifecycle) =>
  (hook, target = currentInstance) =>
    injectHook(lifecycle, hook, target);

export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT);
export const onMounted = createHook(LifecycleHooks.MOUNTED);
export const onBeforeUpdate = createHook(LifecycleHooks.BEFORE_UPDATE);
export const onUpdated = createHook(LifecycleHooks.UPDATED);
export const onBeforeUnmount = createHook(LifecycleHooks.BEFORE_UNMOUNT);
export const onUnmounted = createHook(LifecycleHooks.UNMOUNTED);
