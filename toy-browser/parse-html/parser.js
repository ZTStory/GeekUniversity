const CSSParser = require("../parse-css/parse");

const Layout = require("../layout/layout");

const EOF = Symbol("EOF"); // End Of File
let currentToken = null;
let currentAttribute = null;
let currentTextNode = null;

let stack = [{ type: "doucument", children: [] }];

let cssParser = new CSSParser(stack);

function emit(token) {
    // console.log(token);
    // return;
    let top = stack[stack.length - 1];

    // 持有html-tag栈
    cssParser.stack = stack;

    if (token.type === "startTag") {
        let element = {
            type: "element",
            children: [],
            attributes: [],
        };

        element.tagName = token.tagName;

        for (const p in token) {
            if (p != "type" && p != "tagName") {
                element.attributes.push({
                    name: p,
                    value: token[p],
                });
            }
        }

        cssParser.computeCSS(element);

        top.children.push(element);

        element.parent = top;

        if (!token.isSelfClose) {
            stack.push(element);
        }

        currentTextNode = null;
    } else if (token.type === "endTag") {
        if (top.tagName != token.tagName) {
            throw new Error("Tag start end doesn't match!");
        } else {
            if (top.tagName === "style") {
                cssParser.addCSSRules(top.children[0].content);
            }
            // 解析完css，标签闭合时，进行布局
            Layout.layout(top);

            stack.pop();
        }
        currentTextNode = null;
    } else if (token.type === "text") {
        if (currentTextNode === null) {
            currentTextNode = {
                type: "text",
                content: "",
            };
            top.children.push(currentTextNode);
        }
        currentTextNode.content += token.content;
    }
}

function data(c) {
    if (c === "<") {
        return tagOpen;
    } else if (c === EOF) {
        emit({
            type: "EOF",
        });
        return;
    } else {
        emit({
            type: "text",
            content: c,
        });
        return data;
    }
}

function tagOpen(c) {
    if (c === "/") {
        return endTagOpen;
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: "startTag",
            tagName: "",
        };
        return tagName(c);
    } else {
        return;
    }
}

function endTagOpen(c) {
    if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: "endTag",
            tagName: "",
        };
        return tagName(c);
    } else if (c === ">") {
    } else if (c === EOF) {
    } else {
    }
}

function tagName(c) {
    // tab 换行 禁止符 空格
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if (c === "/") {
        return selfCloseTag;
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken.tagName += c;
        return tagName;
    } else if (c === ">") {
        emit(currentToken);
        return data;
    } else {
        return tagName;
    }
}

function selfCloseTag(c) {
    if (c === ">") {
        currentToken.isSelfClose = true;
        emit(currentToken);
        return data;
    } else if (c === EOF) {
    } else {
    }
}

function beforeAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if ([">", "/", EOF].includes(c)) {
        return afterAttributeName(c);
    } else if (c === "=") {
        return beforeAttributeName;
    } else {
        currentAttribute = {
            name: "",
            value: "",
        };
        return attributeName(c);
    }
}

function attributeName(c) {
    if (c.match(/^[\t\n\f ]$/) || [">", "/", EOF].includes(c)) {
        return afterAttributeName(c);
    } else if (c === "=") {
        return beforeAttributeValue;
    } else if (c === "\u0000") {
    } else if (['"', "'", "<"].includes(c)) {
    } else {
        currentAttribute.name += c;
        return attributeName;
    }
}

function afterAttributeName(c) {
    if (c === "/") {
        return selfCloseTag;
    } else if (c === EOF) {
    } else {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data(c);
    }
}

function beforeAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/) || [">", "/", EOF].includes(c)) {
        return beforeAttributeValue(c);
    } else if (c === '"') {
        return doubleQuotedAttributeValue;
    } else if (c === "'") {
        return singleQuotedAttributeValue;
    } else if (c === ">") {
    } else {
        return UnquotedAttributeValue(c);
    }
}

function doubleQuotedAttributeValue(c) {
    if (c === '"') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    } else if (c === "\u0000") {
    } else if (c === EOF) {
    } else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}

function singleQuotedAttributeValue(c) {
    if (c === "'") {
        return afterQuotedAttributeValue;
    } else if (c === "\u0000") {
    } else if (c === EOF) {
    } else {
        currentAttribute.value += c;
        return singleQuotedAttributeValue;
    }
}

function UnquotedAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return beforeAttributeName;
    } else if (c === "/") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return selfCloseTag;
    } else if (c === ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c === "u\0000") {
    } else if (['"', "'", "<", "=", "`"].includes(c)) {
    } else if (c === EOF) {
    } else {
        currentAttribute.value += c;
        return UnquotedAttributeValue;
    }
}

function afterQuotedAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if (c === "/") {
        return selfCloseTag;
    } else if (c === ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c === EOF) {
    } else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}

/**
 * 解析HTML
 * @param {String} html
 */
module.exports.parseHTML = function (html) {
    let state = data;
    for (const c of html) {
        state = state(c);
    }
    state = state(EOF);
    return stack[0];
};
