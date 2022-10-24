import { isArray, isString } from "@vue/shared";
import { NodeTypes } from "./ast";
import {
  CREATE_ELEMENT_VNODE,
  helperNameMap,
  TO_DISPLAY_STRING,
} from "./runtimeHelpers";

function createCodeGenContext(ast) {
  const context = {
    code: "", // 生成的代码
    indentLevel: 0,
    helper(key) {
      return `_${helperNameMap[key]}`;
    },
    push(code) {
      context.code += code;
    },
    indent() {
      newline(++context.indentLevel);
    },
    deindent(withoutNewLine = false) {
      if (withoutNewLine) {
        --context.indentLevel;
      } else {
        newline(--context.indentLevel);
      }
    },
    newline() {
      newline(context.indentLevel);
    },
  };

  function newline(n) {
    context.push("\n" + ` `.repeat(n));
  }

  return context;
}

function genFunctionPreamble(ast, context) {
  context.push(`const _Vue = Vue`);
}

const aliasHelper = (s) => `${helperNameMap[s]}: _${helperNameMap[s]}`;

function genNodeListAsArray(node, context) {
  context.push(`[`);
  context.indent();
  genNodeList(node, context);
  context.deindent();
  context.push(`]`);
}

function genNodeList(nodes, context) {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (isString(node)) {
      context.push(node); // 标签名
    } else if (isArray(node)) {
      // 孩子
      genNodeListAsArray(node, context);
    } else {
      // 属性
      genNode(node, context);
    }
    if (i < nodes.length - 1) {
      context.push(", ");
    }
  }
}

function genText(node, context) {
  // 在模版中使用的 {{xxxx}} xxxx的值如果是undefined或者null，在页面上不会被显示的原因就是因为JSON.stringify
  context.push(JSON.stringify(node.content));
}

function genExpression(node, context) {
  context.push(node.content);
}

function genInterpolation(node, context) {
  // {{aaa}} 会被转成 toDisplayString(aaa)
  context.push(`${context.helper(TO_DISPLAY_STRING)}(`);
  genNode(node.content, context);
  context.push(`)`);
}

function genCompoundExpression(node, context) {
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (isString(child)) {
      context.push(child);
    } else {
      genNode(child, context);
    }
  }
}

function genVNodeCall(node, context) {
  const { push, helper } = context;
  const { tag, props, children } = node;
  const callHelper = helper(CREATE_ELEMENT_VNODE);
  push(`${callHelper}(`);
  genNodeList([tag, props ? props : `null`, children], context);
  push(`)`);
}

function genObjectExpression(node, context) {
  const { properties } = node;
  if (!properties.length) {
    context.push(`{}`);
    return;
  }
  context.push(`{`);
  context.indent();
  for (let i = 0; i < properties.length; i++) {
    const { key, value } = properties[i];
    context.push([key]);
    context.push(": ");
    context.push(value);
    if (i < properties.length - 1) {
      context.push(",");
      context.newline();
    }
  }
  context.deindent();
  context.push("}");
}

function genCallExpression(node, context) {
  const callee = context.helper(node.callee);
  context.push(callee + "(");
  genNodeList(node.args, context);
  context.push(")");
}

function genNode(node, context) {
  if (!node) return;
  switch (node.type) {
    case NodeTypes.ELEMENT:
      genNode(node.codegenNode, context);
      break;
    case NodeTypes.TEXT:
      genText(node, context);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context);
      break;
    case NodeTypes.JS_OBJECT_EXPRESSION:
      genObjectExpression(node, context);
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context);
      break;
    case NodeTypes.TEXT_CALL:
      genNode(node.codegenNode, context);
      break;
    case NodeTypes.JS_CALL_EXPRESSION:
      genCallExpression(node, context);
      break;
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context);
      break;
    case NodeTypes.VNODE_CALL:
      genVNodeCall(node, context);
      break;
  }
}

// 生成render函数,本质就是通过之前的ast节点类型来生成不同的字符串进行拼接
export function generate(ast) {
  debugger;
  const context = createCodeGenContext(ast);
  const hasHelpers = ast.helpers.length > 0;
  genFunctionPreamble(ast, context);
  const functionName = "render";
  const args = ["_ctx"];
  const signature = args.join(", ");
  context.push("\n");
  context.push(`function ${functionName}(${signature}){`);
  context.indent();
  if (hasHelpers) {
    context.push(`const { ${ast.helpers.map(aliasHelper)} } = _Vue`);
    context.push("\n");
    context.newline();
  }
  context.push(`return `);
  // 这里内部直接用的是ast.codegenNode,用于fragment的处理，这里没有做
  if (ast.children[0].codegenNode) {
    genNode(ast.children[0].codegenNode, context);
  } else {
    context.push(`null`);
  }
  context.deindent();
  context.push(`}`);

  return {
    ast,
    code: context.code,
  };
}
