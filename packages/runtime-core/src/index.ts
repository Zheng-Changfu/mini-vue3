export { createVNode, isVNode, isSameVNodeType, Text, Fragment } from "./vnode";
export { h } from "./h";
export { createRenderer } from "./renderer";
export {
  reactive,
  toRef,
  toRefs,
  ref,
  unref,
  computed,
  customRef,
  effect,
  isRef,
  proxyRefs,
} from "@vue/reactivity";
export { getCurrentInstance } from "./component";
export { getContext, useAttrs, useSlots } from "./apiSetupHelpers";
export {
  onBeforeMount,
  onBeforeUpdate,
  onMounted,
  onUpdated,
} from "./apiLifecycle";
export { provide, inject } from "./apiInject";
