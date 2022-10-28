import { ShapeFlags } from "@vue/shared";
import { getCurrentInstance, onMounted, onUpdated } from "../index";

export const KeepAliveImpl = {
  __isKeepAlive: true,
  name: "KeepAlive",
  props: {
    max: Number,
  },
  setup(props, { slots }) {
    const instance = getCurrentInstance();
    const sharedContext = instance.ctx;
    const {
      renderer: {
        um: unmount,
        o: { createElement, insert },
      },
    } = sharedContext;
    const cache = new Map();
    const keys = new Set();
    const storageContainer = createElement("div");
    let pendingCacheKey = null;
    sharedContext.activate = (n2, container, anchor) => {
      insert(n2.component.subTree.el, container, anchor);
    };

    sharedContext.deactivate = (vnode) => {
      // unmountComponent
      // 当组件要被切换时,会进入到此方法中,将该组件的真实元素进行缓存，也为了不触发卸载的钩子,因为被keepAlive了
      insert(vnode.component.subTree.el, storageContainer);
    };

    const cacheSubtree = () => {
      if (pendingCacheKey !== null) {
        cache.set(pendingCacheKey, instance.subTree);
      }
    };

    // keep-alive  [1,2]
    // component 1
    // component 2
    onMounted(cacheSubtree);
    onUpdated(cacheSubtree);

    const resetShapeFlag = (vnode) => {
      let shapeFlag = vnode.shapeFlag;
      if (shapeFlag & ShapeFlags.COMPONENT_KEPT_ALIVE) {
        shapeFlag -= ShapeFlags.COMPONENT_KEPT_ALIVE;
      }
      if (shapeFlag & ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE) {
        shapeFlag -= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE;
      }
      vnode.shapeFlag = shapeFlag;
    };

    const pruneCacheEntry = (key) => {
      const cached = cache.get(key); // [1,2,3] [1]
      if (cached) {
        resetShapeFlag(cached);
        unmount(cached, instance);
        cache.delete(key);
        keys.delete(key);
      }
    };

    return () => {
      debugger;
      const vnode = slots.default();
      const comp = vnode.type; // 组件对象
      const key = vnode.key == null ? comp : vnode.key;
      const cacheVNode = cache.get(key);
      // 1 2 1
      const { max } = props;
      if (cacheVNode) {
        vnode.component = cacheVNode.component; // 复用组件
        vnode.shapeFlag |= ShapeFlags.COMPONENT_KEPT_ALIVE; // 组件挂载时从keepAlive中读取
        // LRU缓存策略
        keys.delete(key);
        keys.add(key);
        // 缓存过
      } else {
        // max:2
        // [1,2,3]
        // max写0或者不写 都是缓存所有
        keys.add(key);
        if (max && keys.size > parseInt(max, 10)) {
          // 超过最大缓存数量,剔除掉时间最长未使用的那一个(就是第一个)
          pruneCacheEntry(keys.values().next().value); // subtree
        }
      }

      pendingCacheKey = key;
      vnode.shapeFlag |= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE; // 组件要被卸载时应该被 keepAlive

      return vnode;
    };
  },
};

export const isKeepAlive = (v) => !!v.__isKeepAlive;

export const KeepAlive = KeepAliveImpl;
