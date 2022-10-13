import { getCurrentInstance } from "./component";

export const useSlots = () => {
  return getContext().slots;
};

export const useAttrs = () => {
  return getContext().attrs;
};

// getContext:获取setup函数的第二个参数
// getCurrentInstance:获取当前组件实例
export function getContext() {
  const i = getCurrentInstance();
  return i.setupContext;
}
