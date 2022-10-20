import { startsWith } from "@vue/shared";
import { NodeTypes } from "./ast";

function createParserContext(content) {
  return {
    line: 1,
    column: 1,
    offset: 0,
    source: content,
    originalSource: content,
  };
}

// 获取当前所在位置
function getCursor(context) {
  const { line, column, offset } = context;
  return { line, column, offset };
}

function isEnd(context) {
  const s = context.source;
  return !s;
}

// 给我一个length，我删这么多,并且在删之前更新位置信息
function advanceBy(context, length) {
  const { source } = context;
  advancePositionWithMutaiton(context, source, length);
  context.source = source.slice(length);
}

// 更新位置信息
function advancePositionWithMutaiton(context, source, length) {
  let linesCount = 0;
  let lastNewPos = -1;
  for (let i = 0; i < length; i++) {
    // 看看有没有换行符
    if (source.charCodeAt(i) === 10) {
      linesCount++;
      lastNewPos = i;
    }
  }

  context.line += linesCount;
  context.offset += length;
  /**
   * a
   *  b
   *    cdde
   */
  context.column =
    lastNewPos === -1 ? context.column + length : length - lastNewPos;
}

function getSelection(context, start) {
  const end = getCursor(context);
  return {
    start,
    end,
    source: context.originalSource.slice(start.offset, end.offset),
  };
}

export function baseParse(content) {
  const context = createParserContext(content);
  const start = getCursor(context);
  return parseChildren(context);
}

function parseChildren(context) {
  const nodes = []; // 节点

  while (!isEnd(context)) {
    const s = context.source;
    let node;
    if (startsWith(s, "{{")) {
      // 解析插值语法
      // node = xxx
    } else if (s[0] === "<" && /[a-z]/i.test(s[1])) {
      // 解析标签
      // node = xxx
    }
    if (!node) {
      // 当成文本
      node = parseText(context);
    }

    pushNode(nodes, node);
  }

  return nodes;
}

function pushNode(nodes, node) {
  nodes.push(node);
}

function parseText(context) {
  const endTokens = ["{{", "<"];
  let endIndex = context.source.length;

  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i], 1);
    if (index !== -1 && endIndex > index) {
      endIndex = index;
    }
  }

  const start = getCursor(context);
  const content = parseTextData(context, endIndex);
  return {
    type: NodeTypes.TEXT,
    content,
    loc: getSelection(context, start),
  };
}

function parseTextData(context, length) {
  const rawText = context.source.slice(0, length);
  advanceBy(context, length);
  return rawText;
}
