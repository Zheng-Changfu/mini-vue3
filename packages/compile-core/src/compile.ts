import { generate } from "./codegen";
import { baseParse } from "./parse";
import { transform } from "./transform";
import { transformElement } from "./transforms/transformElement";
import { transformExpression } from "./transforms/transformExpression";
import { transformText } from "./transforms/transformText";

function getBaseTransformPreset() {
  return [
    [
      // transformIf,
      // transformFor,
      transformElement,
      transformText,
      transformExpression,
    ],
    {
      // on: transformOn,
      // bind: transformBind,
      // model:transformModel
    },
  ];
}

export function baseCompile(template) {
  const ast = baseParse(template);
  const [nodeTransforms, directiveTransforms] = getBaseTransformPreset();

  /**
   * transform主要做了一些格式化的处理
   *  1. 将 parse 生成的ast节点类型 进行了包装,方便 codeGen 生成代码
   *  2. vue源码中在transform中做了patchFlag的处理，为了实现靶向更新，这里我们没做
   *
   * generate主要做的事情
   *  根据 ast 节点类型 拼接字符串,生成最终的 render 函数
   *
   * 源码中部分api说明:
   *  toDisplayString: 将插值语法中的内容进行格式化处理,{{aaa}},如果这个aaa是undefined或者null是不会显示到页面上的，内部用了 JSON.stringify
   *  createElementVNode: 创建一个虚拟节点,等同于 createVNode
   *  createTextVNode: 创建一个虚拟几节点,等同于createVNode(Text)
   *
   * blockTree
   *  内部为了实现靶向更新(只更新动态的节点,静态节点没有必要进行更新)
   */

  transform(ast, {
    nodeTransforms,
    directiveTransforms,
  });

  return generate(ast);
}
