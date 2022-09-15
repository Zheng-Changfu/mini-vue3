import { createRenderer } from "@vue/runtime-core";
import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";

const rendererOps = {
  patchProp,
  ...nodeOps,
};

export const render = (vnode, container) => {
  const { render: _render } = createRenderer(rendererOps);
  return _render(vnode, container);
};

export * from "@vue/runtime-core";
