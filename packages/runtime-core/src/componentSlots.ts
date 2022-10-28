import { ShapeFlags } from "@vue/shared";

export function initSlots(instance, slots) {
  if (instance.vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    instance.slots = slots;
  }
}

export function updateSlots(instance, vnode) {
  if (instance.vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    Object.assign(instance.slots, vnode.children);
  }
}
