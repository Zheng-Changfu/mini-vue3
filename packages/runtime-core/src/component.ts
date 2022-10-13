import { isFunction, isObject } from "@vue/shared";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";

let uid = 0;

export function createComponentInstance(vnode) {
  const type = vnode.type; // {data:fn,render:fn}
  const instance = {
    uid: uid++, // 组件唯一id
    vnode, // 组件本身的虚拟节点 h(component) 创建出来的
    type, // 组件对象数据
    subTree: null, // 组件 render 函数调用后返回的虚拟节点
    effect: null, // 组件的 effect
    update: null, // 组件更新的方法
    isMounted: false, // 组件是否被挂载
    proxy: null, // 组件代理
    ctx: {}, // 组件上下文(instance)
    data: {}, // 组件数据
    props: {}, // 组件props
    attrs: {}, // 组件attrs
    slots: {}, // 组件插槽
    exposed: {}, // 当前组件向外暴露的内容,可让外界通过 ref 读取
    setupState: null, // setup 中返回的对象数据
  };

  instance.ctx = { _: instance };
  return instance;
}

export function setupComponent(instance) {
  const { props, children } = instance.vnode; // props 是完整的外界传的, children 是组件的插槽
  const Component = instance.type;
  initProps(instance, props);
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);
  // 优先级: setup.render -> component.render -> template
  const { setup, render, template } = Component;
  if (setup) {
    const setupContext = createSetupContext(instance);
    const setupResult = setup(instance.props, setupContext);
    if (isFunction(setupResult)) {
      instance.render = setupResult;
    } else if (isObject(setupResult)) {
      instance.setupState = setupResult;
    }
  } else {
    if (render) {
      instance.render = render;
    } else {
      if (template) {
        // compiler to render
      }
    }
  }
  if (!instance.render) {
    instance.render = () => {};
  }
}

export function createSetupContext(instance) {
  const expose = (exposed) => {
    instance.exposed = exposed || {};
  };

  return {};
}
