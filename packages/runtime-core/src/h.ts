import { isArray, isObject } from "@vue/shared";
import { createVNode, isVNode } from "./vnode";

export function h(type, propsOrChildren?, children?) {
  const l = arguments.length;
  if (l === 2) {
    // 参数2个的情况
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      // 1. 是一个对象并且不是数组，是一个虚拟节点 h('div',h('span')) 包装成数组,当做children处理
      if (isVNode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren]);
      }
      // 2. 是一个对象并且不是数组，不是一个虚拟节点h('div',{style:{color:'red'}})  当做 prop 处理
      return createVNode(type, propsOrChildren, null);
    } else {
      // 3. 不是一个对象或者不是一个数组 h('div','helloworld') 忽略props，当做孩子处理
      return createVNode(type, null, propsOrChildren);
    }
  } else {
    // 参数大于3个的情况
    if (l > 3) {
      children = Array.prototype.slice.call(arguments, 2);
    } else if (l === 3 && isVNode(children)) {
      // 参数为3个的情况并且孩子是一个虚拟节点,当做children处理,包装成数组
      children = [children];
    }
    return createVNode(type, propsOrChildren, children);
  }
}
