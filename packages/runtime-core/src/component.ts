let uid = 0

export function createComponentInstance(vnode) {
  const type = vnode.type // {data:fn,render:fn}
  const instance = {
    uid: uid++, // 组件唯一id
    vnode, // 组件本身的虚拟节点 h(component) 创建出来的
    type, // 组件对象数据
    subTree: null, // 组件 render 函数调用后返回的虚拟节点
    effect: null, // 组件的 effect
    update: null, // 组件更新的方法
    isMounted: false, // 组件是否被挂载
    ctx: {}, // 组件上下文(instance)
    data: {}, // 组件数据
    props: {}, // 组件props
    attrs: {}, // 组件attrs
    slots: {}, // 组件插槽
  }

  instance.ctx = { _: instance }
  return instance
}

export function setupComponent(instance) {
  const component = instance.type
  
}