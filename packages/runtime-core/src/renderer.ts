import { isNumber, isString, ShapeFlags } from "@vue/shared";
import { isSameVNodeType, normalizeVNode, Text } from "./vnode";

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
    const { type, children, shapeFlag, props } = vnode;
    const el = (vnode.el = hostCreateElement(type));

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 文本的孩子
      hostSetElementText(el, children);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 数组的孩子
      mountChildren(children, el);
    }

    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }

    hostInsert(el, container);
  };

  const patchProps = (oldProps, newProps, el) => {
    for (const key in newProps) {
      hostPatchProp(el, key, oldProps[key], newProps[key]);
    }
    for (const key in oldProps) {
      if (newProps[key] == null) {
        hostPatchProp(el, key, oldProps[key], null);
      }
    }
  };

  const unmountChildren = (vnodes) => {
    for (let i = 0; i < vnodes.length; i++) {
      unmount(vnodes[i]);
    }
  };

  const patchChildren = (n1, n2, el, container) => {
    const c1 = n1.children;
    const c2 = n2.children;
    const prevShapeFlag = n1.shapeFlag;
    const shapeFlag = n2.shapeFlag;
    debugger;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 现在是文本，之前是数组
        unmountChildren(c1);
      }
      hostSetElementText(el, c2);
    }
  };

  const patchElement = (n1, n2, container) => {
    const el = (n2.el = n1.el);
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    patchProps(oldProps, newProps, el);
    patchChildren(n1, n2, el, container);
  };

  const processElement = (n1, n2, container) => {
    if (n1 == null) {
      // 初始化挂载元素
      mountElement(n2, container);
    } else {
      patchElement(n1, n2, container);
    }
  };

  const processText = (n1, n2, container) => {
    if (n1 == null) {
      const el = (n2.el = hostCreateText(n2.children));
      hostInsert(el, container);
    }
  };

  const patch = (n1, n2, container) => {
    if (n1 && !isSameVNodeType(n1, n2)) {
      unmount(n1);
      n1 = null;
    }
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

  const unmount = (vnode) => {
    const { el } = vnode;
    hostRemove(el);
  };

  const render = (vnode, container) => {
    if (vnode == null) {
      // 卸载
      if (container._vnode) {
        unmount(container._vnode);
      }
    } else {
      patch(container._vnode || null, vnode, container);
    }
    container._vnode = vnode;
  };

  return {
    render,
  };
}
