import { createObjectExpression, createVNodeCall, NodeTypes } from "../ast";

export function transformElement(node, context) {
  return () => {
    if (node.type === NodeTypes.ELEMENT) {
      const { tag, props } = node;
      const vnodeTag = `"${tag}"`;
      const properties = [];
      for (let i = 0; i < props.length; i++) {
        properties.push({
          key: props[i].name,
          value: props[i].value.content,
        });
      }
      // 包装属性的ast节点类型,方便codegen时判断
      const propsExpression =
        properties.length > 0 ? createObjectExpression(properties) : null;
      // 包装属性的ast节点类型,方便codegen时判断
      node.codegenNode = createVNodeCall(
        context,
        vnodeTag,
        propsExpression,
        node.children
      );
    }
  };
}
