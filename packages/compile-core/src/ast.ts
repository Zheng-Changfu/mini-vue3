import { CREATE_ELEMENT_VNODE } from "./runtimeHelpers";

export const enum NodeTypes {
  ROOT = "ROOT",
  ELEMENT = "ELEMENT",
  TEXT = "TEXT",
  SIMPLE_EXPRESSION = "SIMPLE_EXPRESSION",
  INTERPOLATION = "INTERPOLATION",
  ATTRIBUTE = "ATTRIBUTE",
  DIRECTIVE = "DIRECTIVE",
  //  containers
  COMPOUND_EXPRESSION = "COMPOUND_EXPRESSION",
  IF = "IF",
  IF_BRANCH = "IF_BRANCH",
  FOR = "FOR",
  TEXT_CALL = "TEXT_CALL",
  //  codegen
  VNODE_CALL = "VNODE_CALL",
  JS_CALL_EXPRESSION = "JS_CALL_EXPRESSION",
  JS_OBJECT_EXPRESSION = "JS_OBJECT_EXPRESSION",
  JS_PROPERTY = "JS_PROPERTY",
  JS_ARRAY_EXPRESSION = "JS_ARRAY_EXPRESSION",
  JS_FUNCTION_EXPRESSION = "JS_FUNCTION_EXPRESSION",
  JS_CONDITIONAL_EXPRESSION = "JS_CONDITIONAL_EXPRESSION",
  JS_CACHE_EXPRESSION = "JS_CACHE_EXPRESSION",
}

export const createCompoundExpression = (child, loc) => {
  return {
    type: NodeTypes.COMPOUND_EXPRESSION,
    loc,
    children: child,
  };
};

export const createCallExpression = (callee, args) => {
  return {
    type: NodeTypes.JS_CALL_EXPRESSION,
    callee,
    args,
  };
};

export const createObjectExpression = (properties) => {
  return {
    type: NodeTypes.JS_OBJECT_EXPRESSION,
    properties,
  };
};

export const createVNodeCall = (context, tag, props, children) => {
  context.helper(CREATE_ELEMENT_VNODE);
  return {
    type: NodeTypes.VNODE_CALL,
    tag,
    props,
    children,
  };
};
