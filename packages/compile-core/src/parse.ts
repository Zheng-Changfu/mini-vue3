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
  if (startsWith(s, "</")) return true;
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

function pushNode(nodes, node) {
  nodes.push(node);
}

// 截取掉空格
function advanceSpaces(context) {
  const match = /^[\t\r\n\f ]+/.exec(context.source);
  if (match) {
    advanceBy(context, match[0].length);
  }
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
      node = parseElement(context);
    }
    if (!node) {
      // 当成文本
      node = parseText(context);
    }

    pushNode(nodes, node);
  }

  return nodes;
}

function parseElement(context) {
  // 标签名，属性，指令，子元素
  const element = parseTag(context, "START");

  if (element.isSelfClosing) {
    return element;
  }

  const children = parseChildren(context);
  element.children = children;
  parseTag(context, "END");
  element.loc = getSelection(context, element.loc.start);

  return element;
}

function parseTag(context, type) {
  // tag open
  const start = getCursor(context);
  const match = /^<\/?([a-z][^\t\r\n\f />]*)/i.exec(context.source);
  const tag = match[1];

  advanceBy(context, match[0].length);
  advanceSpaces(context);

  // 解析props
  const props = [];

  let isSelfClosing = startsWith(context.source, "/>");
  advanceBy(context, isSelfClosing ? 2 : 1);

  if (type === "END") return;

  return {
    type: NodeTypes.ELEMENT,
    isSelfClosing,
    tag,
    props,
    children: [],
    loc: getSelection(context, start),
  };
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
