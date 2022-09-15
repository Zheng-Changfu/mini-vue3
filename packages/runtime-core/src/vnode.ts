import { isString, ShapeFlags } from "@vue/shared";

export const isVNode = (val) => !!(val && val.__v_isVNode);

export const normalizeVNode = (child) => {};

export const createVNode = (type, props, children) => {
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0;
  const vnode = {
    __v_isVNode: true,
    el: null, // 标记这个虚拟节点对应的真实dom
    key: null, // 标记这个虚拟节点的唯一性，后续diff会用
    type,
    props,
    children,
    shapeFlag, // 标记自己的孩子是一个什么类型，后续会针对不同的孩子类型做不同的处理
  };

  if (children) {
    vnode.shapeFlag |= isString(children)
      ? ShapeFlags.TEXT_CHILDREN
      : ShapeFlags.ARRAY_CHILDREN;
  }
  return vnode;
};
