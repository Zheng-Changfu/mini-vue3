import { hasOwn, isFunction } from "@vue/shared";
import { proxyRefs } from "@vue/reactivity";
import { initProps } from "./componentProps";
import { nextTick } from "./scheduler";
import { initSlots } from "./componentSlots";

let uid = 0;
export function createComponentInstance(vnode) {
  const instance = {
    uid: uid++, // 组件唯一id
    setupState: {}, // setup函数返回的如果是对象，那么这里就是那个对象的数据
    data: {}, // 组件的数据
    props: {}, // 组件的props
    attrs: {}, // 组件的attrs
    slots: {}, // 组件的插槽
    ctx: null, // 组件的上下文
    subTree: null, // 组件内部render函数返回的虚拟节点对象
    vnode, // 组件本身的vnode
    type: vnode.type, // 组件type
    effect: null, // 组件的effect
    update: null, // 组件更新的方法
    isMounted: false, // 组件是否挂载了
    setupContext: null,
  };
  instance.ctx = { _: instance };
  return instance;
}

const publicPropertiesMap = {
  $attrs: (i) => i.attrs,
  $data: (i) => i.data,
  $slots: (i) => i.slots,
  $el: (i) => i.vnode.el,
  $nextTick: () => nextTick, // this.$nextTick()
  $props: (i) => {
    return i.props;
  },
};

const PublicComponentProxyHandlers = {
  get(instance, key) {
    const { data, props, setupState } = instance;
    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(data, key)) {
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
    const { data, props, setupState } = instance;
    if (hasOwn(setupState, key)) {
      setupState[key] = value; //
    } else if (hasOwn(data, key)) {
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
  initSlots(children, instance);
  instance.proxy = new Proxy(instance, PublicComponentProxyHandlers);

  const { setup, render, template } = instance.type;
  if (setup) {
    const setupContext = (instance.setupContext = createSetupContext(instance));
    setCurrentInstance(instance);
    const setupResult = setup(instance.props, setupContext); // setup(props,{emit,slots,attrs,expose}){return () =>{}}
    setCurrentInstance(null);
    if (isFunction(setupResult)) {
      instance.render = setupResult;
    } else {
      instance.setupState = proxyRefs(setupResult);
    }
  }
  if (!instance.render) {
    if (isFunction(render)) {
      instance.render = render;
    } else {
      if (template) {
        // 模版编译成render函数
        // instance.render = compiler(template);
      }
    }
  }

  if (!instance.render) {
    instance.render = () => {};
  }
}

function createSetupContext(instance) {
  return {
    attrs: instance.attrs,
    slots: instance.slots,
    emit: function emit(eventName, ...args) {
      const props = instance.vnode.props;
      const handlerName = `on${eventName[0].toUpperCase()}${eventName.slice(
        1
      )}`;
      const handler = props[handlerName];
      handler && handler(...args);
    },
  };
}

let currentInstance;
export const getCurrentInstance = () => currentInstance;
export const setCurrentInstance = (i) => (currentInstance = i);
