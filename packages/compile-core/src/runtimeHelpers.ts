export const FRAGMENT = Symbol("Fragment");
export const TO_DISPLAY_STRING = Symbol("toDisplayString");
export const CREATE_TEXT = Symbol("createTextVNode");
export const CREATE_ELEMENT_VNODE = Symbol("createElementVNode");

export const helperNameMap = {
  [FRAGMENT]: "Fragment",
  [CREATE_TEXT]: "createTextVNode",
  [CREATE_ELEMENT_VNODE]: "createElementVNode",
  [TO_DISPLAY_STRING]: "toDisplayString",
};
