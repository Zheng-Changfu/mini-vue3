// dom-api的相关操作
/**
 * insert: hostInsert, remove: hostRemove, patchProp: hostPatchProp, createElement: hostCreateElement, createText: hostCreateText, createComment: hostCreateComment, setText: hostSetText, setElementText: hostSetElementText, parentNode: hostParentNode, nextSibling: hostNextSibling, setScopeId: hostSetScopeId=NOOP, cloneNode: hostCloneNode, insertStaticContent: hostInsertStaticContent
 */
export const nodeOps = {
  insert(element, parent, anchor) {
    parent.insertBefore(element, anchor);
  },
  remove(element) {
    const parent = element.parentNode;
    if (parent) {
      parent.removeChild(element);
    }
  },
  createElement(tagName) {
    return document.createElement(tagName);
  },
  createText(text) {
    return document.createTextNode(text);
  },
  setText(el, text) {
    el.nodeValue = text;
  },
  setElementText(el, text) {
    el.textContent = text;
  },
  parentNode(el) {
    return el.parentNode;
  },
  nextSibling(el) {
    return el.nextSibling;
  },
  querySelector(selectors) {
    return document.querySelector(selectors);
  },
};
