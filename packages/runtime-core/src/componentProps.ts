import { hasOwn } from "@vue/shared";
import { reactive } from "@vue/reactivity";

export function initProps(rawProps, instance) {
  /**
   * 1.
   */
  const props = {};
  const attrs = {};

  if (rawProps) {
    for (const key in rawProps) {
      const value = rawProps[key];
      // 要判断当前的这个key在不在组件内部定义的props中
      if (hasOwn(instance.type.props, key)) {
        props[key] = value;
      } else {
        attrs[key] = value;
      }
    }
  }
  // this.$attrs.a = 2222 v-bind="$attrs"
  // vue是单向数据流的 v-model :value="" @change="e => xxx"
  instance.props = reactive(props); // vue内部这里是用的shallowReactive
  instance.attrs = attrs;
}

export function updateProps(prevProps, nextProps) {
  if (prevProps) {
    for (let key in prevProps) {
      if (hasOwn(nextProps, key)) {
        // prevProps.age = 2
        prevProps[key] = nextProps[key]; // 请问这里会不会导致 componentUpdateFn 再次执行
      } else {
        delete prevProps[key];
      }
    }
  }
}
