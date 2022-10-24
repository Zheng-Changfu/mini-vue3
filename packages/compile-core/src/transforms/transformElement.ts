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
      const propsExpression =
        properties.length > 0 ? createObjectExpression(properties) : null;

      node.codegenNode = createVNodeCall(
        context,
        vnodeTag,
        propsExpression,
        node.children
      );
    }
  };
}
