import { NodeTypes } from "../ast";

function processExpression(node) {
  return node;
}

export function transformExpression(node, context) {
  if (node.type === NodeTypes.INTERPOLATION) {
    node.content = processExpression(node.content);
  }
}
