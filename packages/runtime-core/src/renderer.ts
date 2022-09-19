import { isNumber, isString, ShapeFlags } from "@vue/shared";
import { normalizeVNode, Text } from "./vnode";

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
      const child = (children[i] =
        isString(children[i]) || isNumber(children[i])
          ? normalizeVNode(children[i])
          : children[i]);
      patch(null, child, el);
    }
  };

  const mountElement = (vnode, container) => {
    const { type, children, shapeFlag } = vnode;
    const el = (vnode.el = hostCreateElement(type));

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 文本的孩子
      hostSetElementText(el, children);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 数组的孩子
      mountChildren(children, el);
    }
    hostInsert(el, container);
  };

  const processElement = (n1, n2, container) => {
    if (n1 == null) {
      // 初始化挂载元素
      mountElement(n2, container);
    }
  };

  const processText = (n1, n2, container) => {
    if (n1 == null) {
      const el = (n2.el = hostCreateText(n2.children));
      hostInsert(el, container);
    }
  };

  const patch = (n1, n2, container) => {
    const { type, shapeFlag } = n2;

    switch (type) {
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 是一个元素
          processElement(n1, n2, container);
        }
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
