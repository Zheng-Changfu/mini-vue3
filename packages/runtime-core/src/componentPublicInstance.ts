import { hasOwn } from "@vue/shared";
import { nextTick } from "./scheduler";

const publicPropertiesMap = {
  $attrs: (i) => i.attrs,
  $props: (i) => i.props,
  $slots: (i) => i.slots,
  $el: (i) => i.vnode.el,
  $nextTick: (fn) => nextTick.bind(fn),
};

export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { data, props, setupState } = instance;
    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(data, key)) {
      return data[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    }
    const publicGetter = publicPropertiesMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
  },
  set({ _: instance }, key, value) {
    const { data, props, setupState } = instance;
    if (hasOwn(setupState, key)) {
      setupState[key] = value;
    } else if (hasOwn(data, key)) {
      data[key] = value;
      return true;
    } else if (hasOwn(props, key)) {
      console.warn("prop is readonly");
      return false;
    }
  },
};
