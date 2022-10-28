import { ShapeFlags } from "@vue/shared";

export function initSlots(slots, instance) {
  if (instance.vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    instance.slots = slots;
  }
}

export function updateSlots(instance, next) {
  if (instance.vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    Object.assign(instance.slots, next.children);
  }
}
