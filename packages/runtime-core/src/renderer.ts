import { invokerArrayFns, isNumber, isString, ShapeFlags } from "@vue/shared";
import { reactive, ReactiveEffect } from "@vue/reactivity";
import { createComponentInstance, setupComponent } from "./component";
import { Fragment, isSameVNodeType, normalizeVNode, Text } from "./vnode";
import { updateProps } from "./componentProps";
import { queueJob } from "./scheduler";
import { updateSlots } from "./componentSlots";
import { isKeepAlive } from "./components/KeepAlive";

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

  const mountChildren = (children, el, anchor, parentComponent) => {
    for (let i = 0; i < children.length; i++) {
      const child = (children[i] =
        isString(children[i]) || isNumber(children[i])
          ? normalizeVNode(children[i])
          : children[i]);
      patch(null, child, el, anchor, parentComponent);
    }
  };

  const mountElement = (vnode, container, anchor, parentComponent) => {
    const { type, children, shapeFlag, props } = vnode;
    const el = (vnode.el = hostCreateElement(type));

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 文本的孩子
      hostSetElementText(el, children);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 数组的孩子
      mountChildren(children, el, anchor, parentComponent);
    }

    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }

    hostInsert(el, container, anchor);
  };

  const mountComponent = (vnode, container, anchor, parentComponent) => {
    // 1. 创建组件实例
    const instance = (vnode.component = createComponentInstance(
      vnode,
      parentComponent
    ));
    if (isKeepAlive(vnode.type)) {
      (instance.ctx as any).renderer = internals;
    }
    setupComponent(instance);
    setupRenderEffect(instance, vnode, container, anchor);
  };

  const updateComponent = (n1, n2) => {
    // 复用组件实例
    const instance = (n2.component = n1.component);
    // 将新的组件虚拟节点挂载到next属性上
    instance.next = n2;
    // 通知子组件的effect重新执行
    instance.update();
  };

  const setupRenderEffect = (instance, vnode, container, anchor) => {
    const { render } = instance;
    const { data } = instance.type;
    let state;
    if (data) {
      state = instance.data = reactive(data());
    }
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        // 初始化
        const { bm, m } = instance;

        if (bm) {
          invokerArrayFns(bm);
        }

        const subtree = (instance.subTree = render.call(instance.proxy, state));
        patch(null, subtree, container, anchor, instance);
        instance.isMounted = true;
        vnode.el = subtree.el;

        if (m) {
          invokerArrayFns(m);
        }
      } else {
        // 更新
        let { next, vnode, bu, u } = instance;
        if (next) {
          updateComponentPreRender(instance, next);
        } else {
          next = vnode;
        }

        if (bu) {
          invokerArrayFns(bu);
        }

        const nextTree = render.call(instance.proxy, state);
        const preTree = instance.subTree;
        patch(preTree, nextTree, container, anchor, instance);
        instance.subTree = nextTree;
        next.el = nextTree.el;

        if (u) {
          invokerArrayFns(u);
        }
      }
    };
    const effect = (instance.effect = new ReactiveEffect(componentUpdateFn, {
      scheduler: () => queueJob(update),
    }));
    const update = (instance.update = effect.run.bind(effect));
    update();
  };

  const updateComponentPreRender = (instance, nextVNode) => {
    const prevProps = instance.props; // 实例上的props,具备响应式的
    const nextProps = nextVNode.props; // 组件上的props,包含了attrs的
    updateProps(prevProps, nextProps);
    updateSlots(instance, nextVNode);
    instance.next = null;
    instance.vnode = nextVNode;
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

  const unmountChildren = (vnodes, parentComponent) => {
    for (let i = 0; i < vnodes.length; i++) {
      unmount(vnodes[i], parentComponent);
    }
  };

  const patchedKeyChildren = (c1, c2, container, parentComponent) => {
    let i = 0;
    let e1 = c1.length - 1; // 旧数组最后一个下标
    let e2 = c2.length - 1; // 新数组最后一个下标
    // 优化1
    // (a b)
    // (a b) c
    // i = 0,e1 = 1,e2 = 2
    // i = 2,e1 = 1,e2 = 2
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = normalizeVNode(c2[i]);
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container);
      } else {
        break;
      }
      i++;
    }

    // 优化2
    //   (a b)
    // c (a b)
    // i = 0,e1 = 1,e2 = 2
    // i = 0,e1 = -1,e2 = 0
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = normalizeVNode(c2[e2]);
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container);
      } else {
        break;
      }
      e1--;
      e2--;
    }

    if (i > e1) {
      if (i <= e2) {
        // 添加节点
        while (i <= e2) {
          const nextPos = e2 + 1;
          const anchor = nextPos < c2.length ? c2[nextPos].el : null;
          patch(null, normalizeVNode(c2[i]), container, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        // 优化3
        // (a b) c
        // (a b)
        // i = 0,e1 = 2,e2 = 1
        // i = 2,e1 = 2,e2 = 1

        // 优化4
        // c (a b)
        //   (a b)
        // i = 0,e1 = 2,e2 = 1
        // i = 0,e1 = 0,e2 = -1
        unmount(c1[i], parentComponent);
        i++;
      }
    } else {
      // a b [c d e] f g
      // a b [d e h] f g
      // i = 0,e1 = 6,e2 = 6
      // 经过优化1的代码后
      // i = 2,e1 = 6,e2 = 6
      // 经过优化2的代码后
      // i = 2,e1 = 4,e2 = 4,

      // 根据新节点创建映射表
      let s1 = i;
      let s2 = i;
      let j;
      const toBePatched = e2 - s2 + 1; // 要操作的次数
      const keyToNewIndexMap = new Map();
      const newIndexToOldIndexMap = Array(toBePatched).fill(0); // [0,0,0] [d,e,h]

      for (let i = s2; i <= e2; i++) {
        keyToNewIndexMap.set(c2[i].key, i);
      }

      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        const newIndex = keyToNewIndexMap.get(prevChild.key);
        if (newIndex == undefined) {
          // 新的存在，老的不存在
          unmount(prevChild, parentComponent);
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          patch(prevChild, c2[newIndex], container);
        }
      }

      const increasingNewIndexSequence = getSequence(newIndexToOldIndexMap); // [0,1]

      j = increasingNewIndexSequence.length - 1;

      // 【移动】 和【新增】的情况
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i; // 找到要操作的节点数组中的最后一项索引(h 的索引)
        const nextChild = c2[nextIndex]; // 找到要操作的节点数组中的最后一项索引(h 这个虚拟节点)
        const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null;
        if (!nextChild.el) {
          // 新增
          patch(null, nextChild, container, anchor);
        } else {
          // 移动
          if (i !== increasingNewIndexSequence[j]) {
            hostInsert(nextChild.el, container, anchor);
          } else {
            j--;
          }
        }
      }
    }
  };

  const patchChildren = (n1, n2, el, container, parentComponent) => {
    const c1 = n1.children;
    const c2 = n2.children;
    const prevShapeFlag = n1.shapeFlag;
    const shapeFlag = n2.shapeFlag;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 1. 新文本，旧数组
        unmountChildren(c1, parentComponent);
      }
      if (c1 !== c2) {
        // 2. 新文本，旧文本
        // 3. 新文本，旧空
        hostSetElementText(el, c2);
      }
    } else {
      // 当前的要么是数组，要么是空
      // 之前的要么是数组，要么是文本，要么是空
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 4. 新数组，旧数组，全量diff
          patchedKeyChildren(c1, c2, el, parentComponent);
        } else {
          // 5. 旧数组，新空
          unmountChildren(c1, parentComponent);
        }
      } else {
        // 当前的要么是数组，要么是空
        // 之前的要么是文本，要么是空
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          // 6. 新数组，旧文本
          // 7. 新空，旧文本
          hostSetElementText(el, "");
        }

        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 8. 新数组,旧空  新数组，旧文本
          mountChildren(c2, el, container, parentComponent);
        }
      }
    }
  };

  const patchElement = (n1, n2, container, parentComponent) => {
    const el = (n2.el = n1.el);
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    patchProps(oldProps, newProps, el);
    patchChildren(n1, n2, el, container, parentComponent);
  };

  const processElement = (n1, n2, container, anchor, parentComponent) => {
    if (n1 == null) {
      // 初始化挂载元素
      mountElement(n2, container, anchor, parentComponent);
    } else {
      patchElement(n1, n2, container, parentComponent);
    }
  };

  const processText = (n1, n2, container) => {
    if (n1 == null) {
      const el = (n2.el = hostCreateText(n2.children));
      hostInsert(el, container);
    } else {
      const el = (n2.el = n1.el);
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children);
      }
    }
  };

  const processFragment = (
    n1,
    n2,
    container,
    anchor,
    parentComponent = null
  ) => {
    if (n1 == null) {
      mountChildren(n2.children, container, anchor, parentComponent);
    } else {
      patchChildren(n1, n2, container, anchor, parentComponent);
    }
  };

  const processComponent = (n1, n2, container, anchor, parentComponent) => {
    if (n1 == null) {
      if (n2.shapeFlag & ShapeFlags.COMPONENT_KEPT_ALIVE) {
        parentComponent.ctx.activate(n2, container, anchor, parentComponent);
      } else {
        mountComponent(n2, container, anchor, parentComponent);
      }
    } else {
      // 组件更新
      updateComponent(n1, n2);
    }
  };

  const patch = (n1, n2, container, anchor = null, parentComponent = null) => {
    if (n1 && !isSameVNodeType(n1, n2)) {
      unmount(n1, parentComponent);
      n1 = null;
    }
    const { type, shapeFlag } = n2;

    switch (type) {
      case Text:
        processText(n1, n2, container);
        break;
      case Fragment:
        processFragment(n1, n2, container, anchor, parentComponent);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // 是一个元素
          processElement(n1, n2, container, anchor, parentComponent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, anchor, parentComponent);
        } else if (shapeFlag & ShapeFlags.TELEPORT) {
          type.process(n1, n2, container, anchor, parentComponent, internals);
        }
    }
  };

  const unmountComponent = (instance, parentComponent) => {
    const { subTree, bum, um } = instance;
    if (bum) {
      invokerArrayFns(bum); // beforeUnmount
    }

    // 停止当前组件的依赖收集,我们没做

    unmount(subTree, parentComponent); // 卸载这个组件对应的真实元素

    if (um) {
      invokerArrayFns(um);
    }
  };

  const unmount = (vnode, parentComponent) => {
    const { el, type, shapeFlag } = vnode;
    if (type === Fragment) {
      unmountChildren(vnode.children, parentComponent);
    } else if (shapeFlag & ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE) {
      parentComponent.ctx.deactivate(vnode);
    } else if (shapeFlag & ShapeFlags.COMPONENT) {
      unmountComponent(vnode.component, parentComponent);
    } else {
      hostRemove(el);
    }
  };

  const render = (vnode, container) => {
    if (vnode == null) {
      // 卸载
      if (container._vnode) {
        unmount(container._vnode, null);
      }
    } else {
      patch(container._vnode || null, vnode, container);
    }
    container._vnode = vnode;
  };

  const internals = {
    mc: mountChildren,
    pc: patchChildren,
    um: unmount,
    o: options,
  };

  return {
    render,
  };
}

function getSequence(arr) {
  let len = arr.length;
  let result = [0];
  let start, end, mid;
  let p = arr.slice();
  for (let i = 0; i < len; i++) {
    const arrI = arr[i];
    const j = result[result.length - 1];
    if (arr[j] < arrI) {
      p[i] = j;
      result.push(i);
      continue;
    }
    start = 0;
    end = result.length - 1;
    while (start < end) {
      mid = (start + end) >> 1;
      if (arr[result[mid]] < arrI) {
        start = mid + 1;
      } else {
        end = mid;
      }
    }

    if (arrI < arr[result[start]]) {
      if (start > 0) {
        p[i] = result[start - 1];
      }
      result[start] = i;
    }
  }

  let i = result.length;
  let lastIndex = result[i - 1];
  while (i-- > 0) {
    result[i] = lastIndex;
    lastIndex = p[lastIndex];
  }
  return result;
}
