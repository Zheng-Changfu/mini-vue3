var VueCompilerCore = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // packages/compile-core/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    baseParse: () => baseParse
  });

  // packages/compile-core/src/parse.ts
  function createParseContext(content) {
    return {
      line: 1,
      column: 1,
      offset: 0,
      source: content,
      originalSource: content
    };
  }
  function getCursor(context) {
    const { line, column, offset } = context;
    return { line, column, offset };
  }
  function isEnd(context) {
    const s = context.source;
    if (startsWith(s, "</"))
      return true;
    return !s;
  }
  function startsWith(s, key) {
    return s.startsWith(key);
  }
  function pushNode(nodes, node) {
    nodes.push(node);
  }
  function advanceBy(context, length) {
    const source = context.source;
    advancePositionWithMutation(context, source, length);
    context.source = source.slice(length);
  }
  function advanceSpaces(context) {
    const match = /^[\t\r\n\f ]+/.exec(context.source);
    if (match) {
      advanceBy(context, match[0].length);
    }
  }
  function advancePositionWithMutation(context, source, length) {
    let linesCount = 0;
    let lastNewPos = -1;
    for (let i = 0; i < length; i++) {
      if (source.charCodeAt(i) === 10) {
        linesCount++;
        lastNewPos = i;
      }
    }
    context.line += linesCount;
    context.offset += length;
    context.column = lastNewPos === -1 ? context.column + length : length - lastNewPos;
  }
  function getSelection(context, start, end) {
    end = end || getCursor(context);
    return {
      start,
      end,
      source: context.originalSource.slice(start.offset, end.offset)
    };
  }
  function baseParse(content) {
    const context = createParseContext(content);
    return parseChildren(context);
  }
  function parseChildren(context) {
    const nodes = [];
    while (!isEnd(context)) {
      const s = context.source;
      let node;
      if (startsWith(s, "{{")) {
        node = parseInterPolation(context);
      } else if (s[0] === "<" && /[a-z]/i.test(s[1])) {
        node = parseElement(context);
      }
      if (!node) {
        node = parseText(context);
      }
      pushNode(nodes, node);
    }
    return nodes;
  }
  function parseElement(context) {
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
    const start = getCursor(context);
    const match = /^<\/?([a-z][^\t\r\n\f />]*)/i.exec(context.source);
    const tag = match[1];
    advanceBy(context, match[0].length);
    advanceSpaces(context);
    const props = parseAttributes(context);
    const isSelfClosing = startsWith(context.source, "/>");
    advanceBy(context, isSelfClosing ? 2 : 1);
    if (type === "END")
      return;
    return {
      type: "ELEMENT" /* ELEMENT */,
      children: [],
      isSelfClosing,
      tag,
      props,
      loc: getSelection(context, start)
    };
  }
  function parseAttributes(context) {
    const props = [];
    while (context.source.length > 0 && !startsWith(context.source, ">") && !startsWith(context.source, "/>")) {
      const attr = parseAttribute(context);
      if (attr && attr.name === "class" && attr.value.value) {
        attr.value.value = attr.value.value.replace(/\s+/g, " ").trim();
      }
      props.push(attr);
      advanceSpaces(context);
    }
    return props;
  }
  function parseAttribute(context) {
    const start = getCursor(context);
    const match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source);
    let name = match[0];
    advanceBy(context, name.length);
    let value;
    if (/^[\t\r\n\f ]*=/.test(context.source)) {
      advanceSpaces(context);
      advanceBy(context, 1);
      advanceSpaces(context);
      value = parseAttributeValue(context);
    }
    return {
      type: "ATTRIBUTE" /* ATTRIBUTE */,
      name,
      value,
      loc: getSelection(context, start)
    };
  }
  function parseAttributeValue(context) {
    const start = getCursor(context);
    const quote = context.source[0];
    const isQuote = quote === '"' || quote === "'";
    let value;
    if (isQuote) {
      advanceBy(context, 1);
      const index = context.source.indexOf(quote);
      value = parseTextData(context, index);
      advanceBy(context, 1);
    } else {
      const match = /^[^\t\r\n\f >]+/.exec(context.source);
      value = parseTextData(context, match[0].length);
    }
    const loc = getSelection(context, start);
    return {
      type: "TEXT" /* TEXT */,
      value,
      loc
    };
  }
  function parseInterPolation(context) {
    const start = getCursor(context);
    const open = "{{";
    const close = "}}";
    const endIndex = context.source.indexOf(close, open.length);
    advanceBy(context, open.length);
    const innerStart = getCursor(context);
    const rawContentLength = endIndex - open.length;
    const content = parseTextData(context, rawContentLength);
    const innerEnd = getCursor(context);
    advanceBy(context, close.length);
    return {
      type: "INTERPOLATION" /* INTERPOLATION */,
      content: {
        type: "SIMPLE_EXPRESSION" /* SIMPLE_EXPRESSION */,
        content,
        loc: getSelection(context, innerStart, innerEnd)
      },
      loc: getSelection(context, start)
    };
  }
  function parseText(context) {
    const endTokens = ["<", "{{"];
    const start = getCursor(context);
    let endIndex = context.source.length;
    for (let i = 0; i < endTokens.length; i++) {
      const index = context.source.indexOf(endTokens[i], 1);
      if (index !== -1 && endIndex > index) {
        endIndex = index;
      }
    }
    const content = parseTextData(context, endIndex);
    return {
      type: "TEXT" /* TEXT */,
      content,
      loc: getSelection(context, start)
    };
  }
  function parseTextData(context, length) {
    const rawText = context.source.slice(0, length);
    advanceBy(context, length);
    return rawText;
  }
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=compile-core.global.js.map
