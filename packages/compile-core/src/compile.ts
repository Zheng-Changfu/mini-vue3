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

  transform(ast, {
    nodeTransforms,
    directiveTransforms,
  });

  return generate(ast);
}
