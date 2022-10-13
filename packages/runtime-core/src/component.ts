import { hasOwn } from "@vue/shared";
import { initProps } from "./componentProps";
import { nextTick } from "./scheduler";

let uid = 0;
export function createComponentInstance(vnode) {
  const instance = {
    uid: uid++, // 组件唯一id
    data: {}, // 组件的数据
    props: {}, // 组件的props
    attrs: {}, // 组件的attrs
    ctx: null, // 组件的上下文
    subTree: null, // 组件内部render函数返回的虚拟节点对象
    vnode, // 组件本身的vnode
    type: vnode.type, // 组件type
    effect: null, // 组件的effect
    update: null, // 组件更新的方法
    isMounted: false, // 组件是否挂载了
  };
  instance.ctx = { _: instance };
  return instance;
}

const publicPropertiesMap = {
  $attrs: (i) => i.attrs,
  $data: (i) => i.data,
  $el: (i) => i.vnode.el,
  $nextTick: () => nextTick, // this.$nextTick()
  $props: (i) => {
    console.log(i, "i");
    return i.props;
  },
};

const PublicComponentProxyHandlers = {
  get(instance, key) {
    debugger;
    const { data, props } = instance;
    if (hasOwn(data, key)) {
      return data[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    }
    const publicGetter = publicPropertiesMap[key];
    // this.$attrs
    if (publicGetter) {
      return publicGetter(instance);
    }
  },
  set(instance, key, value) {
    const { data, props } = instance;
    if (hasOwn(data, key)) {
      data[key] = value;
      return true;
    } else if (hasOwn(props, key)) {
      console.warn("props is readonly");
      return false;
    }
  },
};

export function setupComponent(instance) {
  // 初始化props和attrs
  const { props, children } = instance.vnode;
  // children 是组件的插槽
  initProps(props, instance);

  instance.proxy = new Proxy(instance, PublicComponentProxyHandlers);
}
