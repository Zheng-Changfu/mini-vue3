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

function getSelection(context, start, end?) {
  end = end || getCursor(context);
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

function createRoot(children, loc) {
  return {
    type: NodeTypes.ROOT,
    children,
    loc,
  };
}

export function baseParse(content) {
  const context = createParserContext(content);
  const start = getCursor(context);
  return createRoot(parseChildren(context), getSelection(context, start));
}

function parseChildren(context) {
  const nodes = []; // 节点

  while (!isEnd(context)) {
    const s = context.source;
    let node;
    if (startsWith(s, "{{")) {
      // 解析插值语法
      // node = xxx
      node = parseInterPolation(context);
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

function parseInterPolation(context) {
  const open = "{{";
  const close = "}}";
  const start = getCursor(context);
  const closeIndex = context.source.indexOf(close, open.length);
  advanceBy(context, open.length);
  const innerStart = getCursor(context);
  const rawContentLength = closeIndex - open.length;
  const content = parseTextData(context, rawContentLength);
  const innerEnd = getCursor(context);
  advanceBy(context, close.length);
  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      content,
      loc: getSelection(context, innerStart, innerEnd),
    },
    loc: getSelection(context, start),
  };
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

  // 解析属性
  const props = parseAttributes(context);

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

function parseAttributes(context) {
  const props = [];
  while (
    context.source.length > 0 &&
    !startsWith(context.source, ">") &&
    !startsWith(context.source, "/>")
  ) {
    const attr = parseAttribute(context);
    props.push(attr);
    advanceSpaces(context);
  }
  return props;
}

function parseAttribute(context) {
  // name
  const start = getCursor(context);
  const match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source);
  const name = match[0];
  advanceBy(context, name.length);

  // value
  let value;
  if (/^[\t\r\n\f ]*=/.test(context.source)) {
    advanceSpaces(context); // 跳过空格
    advanceBy(context, 1); // 跳过=号
    advanceSpaces(context); // 跳过空格
    value = parseAttributeValue(context);
  }
  const loc = getSelection(context, start);

  if (/^(v-[A-Za-z0-9-]|:|\.|@|#)/.test(name)) {
    // 是否为 v-开头的相关指令
    const match =
      /(?:^v-([a-z0-9-]+))?(?:(?::|^\.|^@|^#)(\[[^\]]+\]|[^\.]+))?(.+)?$/i.exec(
        name
      );
    const dirName =
      match[1] ||
      (startsWith(name, ":") ? "bind" : startsWith(name, "@") ? "on" : "slot");

    return {
      type: NodeTypes.DIRECTIVE,
      name: dirName,
      exp: {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: value.content,
        loc: value.loc,
      },
      loc,
    };
  }

  return {
    type: NodeTypes.ATTRIBUTE,
    name,
    value: {
      type: NodeTypes.TEXT,
      content: value.content,
      loc: value.loc,
    },
    loc,
  };
}

function parseAttributeValue(context) {
  const start = getCursor(context);
  let content;
  const quote = context.source[0];
  const isQuote = quote === '"' || quote === "'";
  if (isQuote) {
    advanceBy(context, 1); // 跳过分号
    const endIndex = context.source.indexOf(quote);
    content = parseTextData(context, endIndex);
    advanceBy(context, 1);
  } else {
    const match = /^[^\t\r\n\f >]+/.exec(context.source);
    content = parseTextData(context, match[0].length);
  }

  return {
    content,
    isQuote,
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
