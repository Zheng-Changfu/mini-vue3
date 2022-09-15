import { ShapeFlags } from "@vue/shared";

export function createRenderer(options) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
  } = options;

  const mountChildren = (children, el) => {
    for (let i = 0; i < children.length; i++) {
      const child = (children[i] = normalizeVNode(children[i]));
      // 递归挂载
      patch(null, child, el);
    }
  };

  const mountElement = (vnode, container) => {
    const { type, shapeFlag, children } = vnode;
    const el = (vnode.el = hostCreateElement(type));
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 是一个元素文本数组
      hostSetElementText(el, children);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 是一个虚拟节点数组
      mountChildren(children, el);
    }
  };

  const processElement = (n1, n2, container) => {
    if (n1 == null) {
      // 第一次挂载
      mountElement(n2, container);
    }
  };

  const patch = (n1, n2, container) => {
    const { type, shapeFlag } = n2;

    switch (type) {
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 是一个元素
          processElement(n1, n2, container);
        }
        break;
    }
  };

  const render = (vnode, container) => {
    if (vnode == null) {
      // 卸载
    } else {
      patch(container._vnode || null, vnode, container);
    }
    container._vnode = vnode;
  };

  return {
    render,
  };
}
