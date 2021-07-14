// 暂存当前解析到的标签信息
let currentToken = null;
// 暂存当前解析到的文本信息
let currentTextNode = null;
// 暂存当前标签的属性
let currentAttribute = null;
// 暂存DOM树
let stack;

// 当前标签解析完成并生成DOM树
function emit(token) {
    // 获取栈顶元素
    let top = stack[stack.length - 1];
    // 非文本逻辑
    if (token.type != "text") {
        // 当前标签是开始类型时，创建元素对象，并将标签名和属性复制给元素对象，然后入栈顶
        if (token.type == "startTag") {
            let element = {
                type: "element",
                children: [],
                attributes: [],
            };
            element.tagName = token.tagName;

            for (let t in token) {
                if (t !== "type" && t != "tagName") {
                    element.attributes.push({
                        name: t,
                        value: token[t],
                    });
                }
            }

            top.children.push(element);
            element.parent = top;

            // 自封闭标签不能入栈，因为它没有结束标签
            if (!token.isSelfCloseing) {
                stack.push(element);
            }
        } else if (token.type == "endTag") {
            // 当前标签为结束类型时，判断是否与栈顶标签名相同
            if (top.tagName != token.tagName) {
                // 不相同情况抛错
                throw new Error(token.tagName + "tag start end doset match!");
            } else {
                if (token.tagName == "style") {
                    // addCssRules(top.children[0].content)
                }
                // 相同情况下栈顶元素出栈
                stack.pop();
            }
        }
        currentTextNode = null;
    } else {
        if (!currentTextNode) {
            currentTextNode = {
                type: "text",
                content: "",
            };
            top.children.push(currentTextNode);
        }
        currentTextNode.content += token.content;
    }
}

//response文档解析结束
const EOF = Symbol("EOF"); //

// 开始解析response
function data(c) {
    if (c == "<") {
        // 正常开始标签
        return tagOpen;
    } else if (c == EOF) {
        // response返回数据截止
        emit({
            type: "EOF",
        });
        return;
    } else {
        // 文本内容
        emit({
            type: "text",
            content: c,
        });
        return data;
    }
}

function tagOpen(c) {
    if (c == "/") {
        // 结束标签
        return endTagOpen;
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: "startTag",
            tagName: "",
        };
        // 开始标签或自封闭标签
        return tagName(c);
    } else {
        emit({
            type: "text",
            content: c,
        });
        return data;
    }
}

// 标签名解析
function tagName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        //标签内属性 <data class="">
        return beforeAttributeName;
    } else if (c == "/") {
        //自封闭标签 <img/>
        return selfCloseingStartTag;
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken.tagName += c;
        // 正常标签还未解析完 <di...
        return tagName;
    } else if (c == ">") {
        // 正常结束标签，重新开始下一个标签解析
        emit(currentToken);
        return data;
    } else {
        currentToken.tagName = currentToken.tagName + c;
        return tagName;
    }
}

// 标签属性解析
function beforeAttributeName(c) {
    if (c.match(/^[\n\t\f ]$/)) {
        return beforeAttributeName;
    } else if (c == "/" || c == ">" || c == EOF) {
        return afterAttributeName(c);
    } else if (c == "=") {
    } else {
        currentAttribute = {
            name: "",
            value: "",
        };
        return attributeName(c);
    }
}

// 解析属性名
function attributeName(c) {
    if (c.match(/^[\n\t\f ]$/) || c == "/" || c == ">" || c == EOF) {
        return afterAttributeName(c);
    } else if (c == "=") {
        return beforeAttributeValue;
    } else if (c == "\u0000") {
    } else if (c == "/" || c == "" || c == "<") {
    } else {
        currentAttribute.name += c;
        return attributeName;
    }
}

// 判断属性值的包裹方式：双引号、单引号、无
function beforeAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/)) {
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

// 属性值被双引号包括
function doubleQuotedAttributeValue(c) {
    if (c == '"') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    } else if (c == "\u0000") {
    } else if (c == EOF) {
    } else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}

// 属性值被单引号包括
function singleQuotedAttributeValue(c) {
    if (c == "'") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    } else if (c == "\u0000") {
    } else if (c == EOF) {
    } else {
        currentAttribute.value += c;
        return singleQuotedAttributeValue;
    }
}

// 属性值无包括符号
function UnquotedAttributeValue(c) {
    let { name, value } = currentAttribute;
    if (c.match(/^[\n\t\f ]$/)) {
        currentToken[name] = value;
        return beforeAttributeName;
    } else if (c == "/") {
        currentToken[name] = value;
        return selfCloseingStartTag;
    } else if (c == ">") {
        currentToken[name] = value;
        emit(currentToken);
        return data;
    } else if (c == "\u0000") {
    } else if (c == "=" || c == '"' || c == "'" || c == "<" || c == "`") {
    } else if (c == EOF) {
    } else {
        currentAttribute.value += c;
        return UnquotedAttributeValue;
    }
}

// 解析属性值
function afterQuotedAttributeValue(c) {
    if (c.match(/^[\n\t\f ]$/)) {
        return beforeAttributeName;
    } else if (c == "/") {
        return selfCloseingStartTag;
    } else if (c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c == EOF) {
    } else {
        throw new Error('unexpected charater "' + c + '"');
    }
}

// 自封闭标签解析
function selfCloseingStartTag(c) {
    if (c === ">") {
        // 自封闭标签正常结束
        currentToken.isSelfCloseing = true;
        emit(currentToken);
        return data;
    } else if (c == EOF) {
    } else {
    }
}

function endTagOpen(c) {
    if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: "endTag",
            tagName: "",
        };
        return tagName(c);
    } else if (c == ">") {
    } else if (c == EOF) {
    } else {
    }
}

// 判断属性名之后的字符
function afterAttributeName(c) {
    if (c.match(/^[\n\t\f ]$/)) {
        return afterAttributeName;
    } else if (c == "/") {
        return selfCloseingStartTag;
    } else if (c == "=") {
        return beforeAttributeValue;
    } else if (c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c == EOF) {
    } else {
        currentToken[currentAttribute.name] = currentAttribute.value;
        currentAttribute = {
            name: "",
            value: "",
        };
        return attributeName(c);
    }
}

export function parseHtml(html) {
    stack = [{ type: "document", children: [] }];
    currentToken = null;
    currentTextNode = null;
    currentAttribute = null;

    let state = data;
    for (let c of html) {
        state = state(c);
    }
    state = state(EOF);
    return stack[0];
}
