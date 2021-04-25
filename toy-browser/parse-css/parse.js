const css = require("css");
let rules = [];

class CSSParser {
    constructor(stack) {
        this.stack = stack;
    }
    addCSSRules(text) {
        let ast = css.parse(text);
        console.log(JSON.stringify(ast, null, "  "));
        rules.push(...ast.stylesheet.rules);
    }

    match(element, selector) {
        if (!selector || !element.attributes) {
            return false;
        }

        if (selector.charAt(0) === "#") {
            let attr = element.attributes.filter((attr) => attr.name === "id")[0];
            if (attr && attr.value === selector.replace("#", "")) {
                return true;
            }
        } else if (selector.charAt(0) === ".") {
            ///（选做）带空格的class匹配
            let attr = element.attributes.filter((attr) => attr.name === "class")[0];
            if (attr) {
                let attrs = attr.value.split(" ");
                if (attrs.length && attrs.includes(selector.replace(".", ""))) {
                    return true;
                }
            }
        } else {
            if (element.tagName === selector) {
                return true;
            }
        }
        return false;
    }

    computeCSS(element) {
        // 获取父元素
        let elements = this.stack.slice().reverse();
        if (!element.computedStyle) {
            element.computedStyle = {};
        }

        for (const rule of rules) {
            let selectorParts = rule.selectors[0].split(" ").reverse();

            if (!this.match(element, selectorParts[0])) {
                continue;
            }

            let matched = false;

            let j = 1;
            for (let i = 0; i < elements.length; i++) {
                if (this.match(elements[i], selectorParts[j])) {
                    j++;
                }
            }
            if (j >= selectorParts.length) {
                matched = true;
            }

            if (matched) {
                let sp = this.specificity(rule.selectors[0]);
                let computedStyle = element.computedStyle;
                for (const declaration of rule.declarations) {
                    if (!computedStyle[declaration.property]) {
                        computedStyle[declaration.property] = {};
                    }
                    if (!computedStyle[declaration.property].specificity) {
                        computedStyle[declaration.property].value = declaration.value;
                        computedStyle[declaration.property].specificity = sp;
                    } else if (this.compare(computedStyle[declaration.property].specificity, sp) < 0) {
                        computedStyle[declaration.property].value = declaration.value;
                        computedStyle[declaration.property].specificity = sp;
                    }
                }
                console.log(element.computedStyle);
            }
        }
    }

    // 计算specificity
    specificity(selector) {
        let p = new Array(4).fill(0);
        let selectorParts = selector.split(" ");
        for (const part of selectorParts) {
            // 解析复合选择器
            if (part.charAt(0) === "#") {
                p[1] += 1;
            } else if (part.charAt(0) === ".") {
                p[2] += 1;
            } else {
                p[3] += 1;
            }
        }
        return p;
    }
    // 比较specificity
    compare(sp1, sp2) {
        if (sp1[0] - sp2[0]) {
            return sp1[0] - sp2[0];
        }
        if (sp1[1] - sp2[1]) {
            return sp1[1] - sp2[1];
        }
        if (sp1[2] - sp2[2]) {
            return sp1[2] - sp2[2];
        }
        return sp1[3] - sp2[3];
    }
}

module.exports = CSSParser;
