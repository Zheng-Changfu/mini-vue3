import { isFunction } from "@vue/shared";

export function emit(instance, eventName, ...args) {
  const props = instance.vnode.props;
  const handleName = `on${eventName[0].toUpperCase()}${eventName.slice(1)}`;
  const handler = props[handleName];
  if (handler && isFunction(handler)) {
    handler.call(instance, ...args);
  }
}
