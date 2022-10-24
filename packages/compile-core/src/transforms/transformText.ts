import {
  createCallExpression,
  createCompoundExpression,
  NodeTypes,
} from "../ast";
import { CREATE_TEXT } from "../runtimeHelpers";

function isText(node) {
  return node.type === NodeTypes.TEXT || node.type === NodeTypes.INTERPOLATION;
}

export function transformText(node, context) {
  if (node.type === NodeTypes.ELEMENT) {
    return () => {
      const children = node.children;
      let currentContainer = null;
      let hasText = false;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (isText(child)) {
          hasText = true;
          for (let j = i + 1; j < children.length; j++) {
            const next = children[j];
            if (isText(next)) {
              if (!currentContainer) {
                currentContainer = children[i] = createCompoundExpression(
                  [child],
                  child.loc
                );
              }
              currentContainer.children.push(" + ", next);
              children.splice(j, 1);
              j--;
            } else {
              currentContainer = null;
              break;
            }
          }
        }
      }
      // debugger;
      // // 只有一个文本子元素，忽略掉
      // if (hasText && children.length === 1) {
      //   return;
      // }
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const callArgs = [];
        if (isText(child) || child.type === NodeTypes.COMPOUND_EXPRESSION) {
          callArgs.push(child);
          children[i] = {
            type: NodeTypes.TEXT_CALL,
            content: child,
            loc: child.loc,
            codegenNode: createCallExpression(
              context.helper(CREATE_TEXT),
              callArgs
            ),
          };
        }
      }
    };
  }
}
