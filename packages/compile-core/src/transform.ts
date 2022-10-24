import { NodeTypes } from "./ast";
import { helperNameMap, TO_DISPLAY_STRING } from "./runtimeHelpers";

export function createTransformContext(root, options) {
  const context = {
    nodeTransforms: options.nodeTransforms,
    directiveTransforms: options.directiveTransforms,
    root,
    helpers: new Map(),
    directives: new Map(),
    parent: null,
    currentNode: root,

    helper(name) {
      // 统计方法名称用了多少次，vue源码内部会根据次数做一个字符串的小优化
      const count = context.helpers.get(name) || 0;
      context.helpers.set(name, count + 1);
      return name;
    },
    removeHelper(name) {
      const count = context.helpers.get(name);
      if (count) {
        const currentCount = count - 1;
        if (!currentCount) {
          context.helpers.delete(name);
        } else {
          context.helpers.set(name, currentCount);
        }
      }
    },
    helperString(name) {
      return `_${helperNameMap[context.helper(name)]}`;
    },
  };
  return context;
}

function traverseNode(node, context) {
  context.currentNode = node; // 当前遍历的节点
  const { nodeTransforms } = context;
  const exitFns = [];

  for (let i = 0; i < nodeTransforms.length; i++) {
    // 每个transform函数都可以返回一个退出函数，这个退出函数模拟递归的回溯性能, 1->2->3     3->2->1
    const onExit = nodeTransforms[i](node, context);
    if (onExit) {
      exitFns.push(onExit);
    }
    node = context.currentNode;
  }

  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING);
      break;
    case NodeTypes.ELEMENT:
    case NodeTypes.ROOT:
      traverseChildren(node, context);
      break;
  }
  // 这里是为了在退出函数中执行代码的时候node还是指向对应的节点
  context.currentNode = node;
  let i = exitFns.length;
  while (i--) {
    exitFns[i]();
  }
}

function traverseChildren(node, context) {
  for (let i = 0; i < node.children.length; i++) {
    traverseNode(node.children[i], context);
  }
}

export function transform(root, options) {
  const context = createTransformContext(root, options);
  traverseNode(root, context);
  root.helpers = [...context.helpers.keys()]; // 需要用到的方法，codegen 生成代码的时候会用到
}
