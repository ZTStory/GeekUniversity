import { parseHTML } from "./template-parser.js"

/**
 * 通过keyPath访问obj
 * @param {Object} data
 * @param {string} keyPath
 */
function getValueForKeyPath(data, keyPath) {
    let result = data;
    let directives = keyPath.split(".");
    for (const directive of directives) {
        result = result[directive];
    }
    return result;
}
/**
 * 解析{{}}获取其内容
 * @param {string} mustacheContent
 */
function replaceMustacheContent(mustacheContent, options) {
    let replaceStr = mustacheContent.replace(/\{\{([^\}\}]+)\}\}/, (s0, s1) => {
        if (s1) {
            return getValueForKeyPath(options, s1);
        }
    });
    return replaceStr;
}

/**
 * 渲染
 * @param {string} tmpl
 * @param {object} options
 */
function render(tmpl, options) {
    let domtree = parseHTML(tmpl);
    console.log(domtree);
    let createElement = function (element) {
        let nodeEl = document.createElement(element.tagName);
        element.el = nodeEl;
        // 处理element属性
        for (const attribute of element.attributes) {
            if (attribute.name === "v-if") {
                let condition = getValueForKeyPath(options, attribute.value);
                if (typeof condition === "boolean") {
                    element.el.hidden = !condition;
                }
            } else if (attribute.name === "src") {
                element.el.src = replaceMustacheContent(attribute.value, options);
            }
        }
        // 处理children
        if (element.children.length) {
            for (const child of element.children) {
                if (child.type == "element") {
                    child.parentEl = nodeEl;
                    createElement(child);
                } else if (child.type == "text") {
                    const textWrap = document.createTextNode(replaceMustacheContent(child.content, options));
                    nodeEl.appendChild(textWrap);
                }
            }
        }
        if (element.parentEl) {
            element.parentEl.appendChild(nodeEl);
        } else {
            document.body.appendChild(nodeEl);
        }
    };
    createElement(domtree.children[0]);
}

////////////////////////////////// user interface ///////////////////////////////////////////

let tmpl = `<div class="newslist">
<div class="img" v-if="info.showImage"><img src="{{image}}"/></div>
<div class="date" v-if="info.showDate">{{info.name}}</div>
<div class="img">{{info.name}}</div>
<div class="img">{{info.name}}</div>
<div class="img">{{msg}}<span>  {{info.detail.span}}</span></div>
</div>`;

render(tmpl, {
    image: "https://static001.geekbang.org/resource/image/bb/21/bb38fb7c1073eaee1755f81131f11d21.jpg",
    info: {
        showImage: true,
        showDate: false,
        name: "aaa",
        detail: {
            span: "deep span",
        },
    },
    msg: "Hello world",
});
