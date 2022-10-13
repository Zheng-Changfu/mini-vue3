import { isArray, isNumber, isObject, isString, ShapeFlags } from "@vue/shared";

export const isVNode = (val) => !!(val && val.__v_isVNode);

export const Text = Symbol("text");
export const Fragment = Symbol("fragment");

export const isSameVNodeType = (n1, n2) => {
  return n1.type === n2.type && n1.key === n2.key;
};

export const normalizeVNode = (child) => {
  if (isString(child) || isNumber(child)) {
    return createVNode(Text, null, String(child));
  }
  return child;
};

export const createVNode = (type, props, children) => {
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONENT
    : 0;
  const vnode = {
    __v_isVNode: true,
    el: null, // 标记这个虚拟节点对应的真实dom
    key: props?.key ?? null, // 标记这个虚拟节点的唯一性，后续diff会用
    type,
    props,
    children,
    shapeFlag, // 标记自己的孩子是一个什么类型，后续会针对不同的孩子类型做不同的处理
  };

  if (children) {
    let type;
    if (isArray(children)) {
      type = ShapeFlags.ARRAY_CHILDREN;
    } else if (isObject(children)) {
      type = ShapeFlags.SLOTS_CHILDREN;
    } else {
      type = ShapeFlags.TEXT_CHILDREN;
      children = String(children);
    }
    vnode.shapeFlag |= type;
  }
  return vnode;
};
