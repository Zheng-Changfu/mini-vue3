import { reactive } from "@vue/reactivity";
import { hasOwn } from "@vue/shared";

export function initProps(instance, rawProps) {
  const props = {};
  const attrs = {};
  if (rawProps) {
    for (let key in rawProps) {
      const value = rawProps[key];
      if (instance.type.props && hasOwn(instance.type.props, key)) {
        props[key] = value;
      } else {
        attrs[key] = value;
      }
    }
  }
  instance.props = reactive(props);
  instance.attrs = attrs;
}

export function updateProps(prevProps, nextProps) {
  for (let key in prevProps) {
    if (hasOwn(nextProps, key)) {
      prevProps[key] = nextProps[key];
    } else {
      delete prevProps[key];
    }
  }
}
