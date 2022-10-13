import { getCurrentInstance } from "./component";

// getCurrentInstance:获取当前组件实例
// getContext:获取当前组件实例中的setup函数的第二个参数,setupContext
export const getContext = () => {
  const i = getCurrentInstance();
  return i.setupContext;
};

export const useAttrs = () => {
  return getContext().attrs;
};

export const useSlots = () => {
  return getContext().slots;
};
