// 核心变量，初始化flex基本布局参数
let mainSize, mainStart, mainEnd, mainSign, mainBase, crossSize, crossStart, crossEnd, crossSign, crossBase;

let flexLine = [];
let flexLines = [flexLine];

let mainSpace, crossSpace;
let isAutoMainSize;

const Layout = {
    initStyle(style) {
        ["width", "height"].forEach((size) => {
            if (style[size] === "auto" || style[size] === "") {
                style[size] = null;
            }
        });

        if (!style.flexDirection || style.flexDirection === "auto") {
            style.flexDirection = "row";
        }
        if (!style.alignItems || style.alignItems === "auto") {
            style.alignItems = "stretch";
        }
        if (!style.justifyContent || style.justifyContent === "auto") {
            style.justifyContent = "flex-start";
        }
        if (!style.flexWrap || style.flexWrap === "auto") {
            style.flexWrap = "nowrap";
        }
        if (!style.alignContent || style.alignContent === "auto") {
            style.alignContent = "stretch";
        }
        return style;
    },
    getStyle(element) {
        if (!element.style) {
            element.style = {};
        }

        for (let prop in element.computedStyle) {
            if (Object.hasOwnProperty.call(element.computedStyle, prop)) {
                let p = element.computedStyle.value;
                element.style[prop] = element.computedStyle[prop].value;
                // 将-属性处理成驼峰
                if (prop.includes("-")) {
                    let tagList = prop.split("-").map((value, index) => {
                        if (index != 0) {
                            return value.replace(/^[a-z]/, (c) => c.toUpperCase());
                        }
                        return value;
                    });
                    let newProp = tagList.join("");
                    element.style[newProp] = element.style[prop];
                    prop = newProp;
                }

                // 将px与小数等value变为纯数字方便计算
                if (element.style[prop].toString().match(/px$/)) {
                    element.style[prop] = parseInt(element.style[prop]);
                }
                if (element.style[prop].toString().match(/^[0-9\.]+$/)) {
                    element.style[prop] = parseInt(element.style[prop]);
                }
            }
        }
        return element.style;
    },
    defineVariableWithFlexDirection(style) {
        if (style.flexDirection === "row") {
            mainSize = "width";
            mainStart = "left";
            mainEnd = "right";
            mainSign = +1;
            mainBase = 0;

            crossSize = "height";
            crossStart = "top";
            crossEnd = "bottom";
        }
        if (style.flexDirection === "row-reverse") {
            mainSize = "width";
            mainStart = "right";
            mainEnd = "left";
            mainSign = -1;
            mainBase = style.width;

            crossSize = "height";
            crossStart = "top";
            crossEnd = "bottom";
        }
        if (style.flexDirection === "column") {
            mainSize = "height";
            mainStart = "top";
            mainEnd = "bottom";
            mainSign = +1;
            mainBase = 0;

            crossSize = "width";
            crossStart = "left";
            crossEnd = "right";
        }
        if (style.flexDirection === "column-reverse") {
            mainSize = "height";
            mainStart = "bottom";
            mainEnd = "top";
            mainSign = -1;
            mainBase = style.height;

            crossSize = "width";
            crossStart = "left";
            crossEnd = "right";
        }

        if (style.flexWrap === "wrap-reverse") {
            let tmp = crossStart;
            crossStart = crossEnd;
            crossEnd = tmp;
            crossSign = -1;
        } else {
            crossBase = 0;
            crossSign = 1;
        }
    },
    collectElementsToFlexLines(style, items) {
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let itemStyle = this.getStyle(item);

            if (itemStyle[mainSize] === null) {
                itemStyle[mainSize] = 0;
            }

            if (itemStyle.flex) {
                flexLine.push(item);
            } else if (style.flexWrap === "nowrap" && isAutoMainSize) {
                mainSpace -= itemStyle[mainSize];
                if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== void 0) {
                    crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
                }
                flexLine.push(item);
            } else {
                if (itemStyle[mainSize] > style[mainSize]) {
                    itemStyle[mainSize] = style[mainSize];
                }
                if (mainSpace < itemStyle[mainSize]) {
                    flexLine.mainSpace = mainSpace;
                    flexLine.crossSpace = crossSpace;
                    flexLine = [item];
                    flexLines.push(flexLine);
                    mainSpace = style[mainSize];
                    crossSpace = 0;
                } else {
                    flexLine.push(item);
                }
                if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== void 0) {
                    crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
                }
                mainSpace -= itemStyle[mainSize];
            }
        }
        flexLine.mainSpace = mainSpace;
    },
    calculateMain(style, items) {
        if (style.flexWrap === "nowrap" || isAutoMainSize) {
            flexLine.crossSpace = style[crossSize] !== undefined ? style[crossSize] : crossSpace;
        } else {
            flexLine.crossSpace = crossSpace;
        }

        if (mainSpace < 0) {
            // 处理单行空间不够的情况
            let scale = style[mainSize] / (style[mainSize] - mainSpace);
            let currentMain = mainBase;
            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                let itemStyle = this.getStyle(item);

                if (itemStyle.flex) {
                    itemStyle[mainSize] = 0;
                }

                itemStyle[mainSize] = itemStyle[mainSize] * scale;

                itemStyle[mainStart] = currentMain;
                itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
                currentMain = itemStyle[mainEnd];
            }
        } else {
            flexLines.forEach((items) => {
                let mainSpace = items.mainSpace;
                let flexTotal = 0;
                for (let i = 0; i < items.length; i++) {
                    let item = items[i];
                    let itemStyle = this.getStyle(item);

                    if (itemStyle.flex !== null && itemStyle.flex !== void 0) {
                        flexTotal += itemStyle.flex;
                        continue;
                    }
                }

                if (flexTotal > 0) {
                    // 处理 flexible flex itmes
                    let currentMain = mainBase;
                    for (let i = 0; i < items.length; i++) {
                        let item = items[i];
                        let itemStyle = this.getStyle(item);

                        if (itemStyle.flex) {
                            itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex;
                        }
                        itemStyle[mainStart] = currentMain;
                        itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
                        currentMain = itemStyle[mainEnd];
                    }
                } else {
                    // 处理非 flexible flex items, justify-content 属性生效
                    let currentMain = 0;
                    let step = 0;
                    if (style.justifyContent === "flex-start") {
                        currentMain = mainBase;
                        step = 0;
                    }
                    if (style.justifyContent === "flex-end") {
                        currentMain = mainSpace * mainSign + mainBase;
                        step = 0;
                    }
                    if (style.justifyContent === "center") {
                        currentMain = (mainSpace / 2) * mainSign + mainBase;
                        step = 0;
                    }
                    if (style.justifyContent === "space-between") {
                        currentMain = mainBase;
                        step = (mainSpace / (items.length - 1)) * mainSign;
                    }
                    if (style.justifyContent === "space-around") {
                        step = (mainSpace / items.length) * mainSign;
                        currentMain = step / 2 + mainBase;
                    }
                    for (let i = 0; i < items.length; i++) {
                        let item = items[i];
                        let itemStyle = this.getStyle(item);
                        itemStyle[mainStart] = currentMain;
                        itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
                        currentMain = itemStyle[mainEnd] + step;
                    }
                }
            });
        }
    },
    calculateCross(style) {
        if (style.flexWrap === "wrap-reverse") {
            crossBase = style[crossSize];
        } else {
            crossBase = 0;
        }
        let lineSize = style[crossSize] / flexLines.length;

        let step;
        if (style.alignContent === "flex-start") {
            crossBase += 0;
            step = 0;
        }
        if (style.alignContent === "flex-end") {
            crossBase += crossSign * crossSpace;
            step = 0;
        }
        if (style.alignContent === "center") {
            crossBase += (crossSign * crossSpace) / 2;
            step = 0;
        }
        if (style.alignContent === "space-around") {
            crossBase += 0;
            step = crossSpace / (flexLines.length - 1);
        }
        if (style.alignContent === "space-between") {
            step = crossSpace / flexLines.length;
            crossBase += (crossSign * step) / 2;
        }
        if (style.alignContent === "stretch") {
            crossBase += 0;
            step = 0;
        }
        flexLines.forEach((items) => {
            let lineCrossSize = style.alignContent === "stretch" ? items.crossSpace + crossSpace / flexLines.length : items.crossSpace;
            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                let itemStyle = this.getStyle(item);

                let align = itemStyle.alignSelf || style.alignItems;

                if (itemStyle[crossSize] === null) {
                    itemStyle[crossSize] = align === "stretch" ? lineCrossSize : 0;
                }

                if (align === "flex-start") {
                    itemStyle[crossStart] = crossBase;
                    itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
                }

                if (align === "flex-end") {
                    itemStyle[crossEnd] = crossBase + crossSign * lineCrossSize;
                    itemStyle[crossStart] = itemStyle[crossEnd] - crossSign * itemStyle[crossSize];
                }

                if (align === "center") {
                    itemStyle[crossStart] = crossBase + (crossSign * (lineCrossSize - itemStyle[crossSize])) / 2;
                    itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
                }

                if (align === "stretch") {
                    itemStyle[crossStart] = crossBase;
                    itemStyle[crossEnd] = crossBase + crossSign * (itemStyle[crossSize] !== null && itemStyle[crossSize] !== void 0 ? itemStyle[crossSize] : lineCrossSize);

                    itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart]);
                }
            }
            crossBase += crossSign * (lineCrossSize + step);
        });
    },
    /**
     * flex布局逻辑
     * @param {Element} element
     * @returns
     */
    layout(element) {
        if (!element.computedStyle) {
            return;
        }

        let elementStyle = this.getStyle(element);

        if (elementStyle.display !== "flex" && elementStyle.display !== "inline-flex") {
            return;
        }

        // 获取有效子元素
        let items = element.children.filter((e) => e.type === "element");

        items.sort((a, b) => {
            return (a.order || 0) - (b.order || 0);
        });
        // 初始化style默认值
        let style = this.initStyle(elementStyle);

        this.defineVariableWithFlexDirection(style);

        // 处理无父元素主轴尺寸的情况
        isAutoMainSize = false;
        if (!style[mainSize]) {
            // 父元素主轴尺寸归0
            elementStyle[mainSize] = 0;
            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                let itemStyle = this.getStyle(item);
                if (itemStyle[mainSize] !== null || itemStyle[mainSize] !== void 0) {
                    // 计算子元素宽度和
                    elementStyle[mainSize] = elementStyle[mainSize] + itemStyle[mainSize];
                }
            }
            isAutoMainSize = true;
        }

        flexLine = [];
        flexLines = [flexLine];
        mainSpace = elementStyle[mainSize];
        crossSpace = 0;

        // 收集元素进行
        this.collectElementsToFlexLines(style, items);

        // 计算主轴
        this.calculateMain(style, items);

        // auto sizing
        if (!style[crossSize]) {
            crossSpace = 0;
            elementStyle[crossSize] = 0;
            for (let i = 0; i < flexLines.length; i++) {
                elementStyle[crossSize] = elementStyle[crossSize] + flexLines[i].crossSpace;
            }
        } else {
            crossSpace = style[crossSize];
            for (let i = 0; i < flexLines.length; i++) {
                crossSpace -= flexLines[i].crossSpace;
            }
        }
        // 计算交叉轴
        this.calculateCross(style, items);

        // console.log(flexLines);
    },
};

module.exports = Layout;
