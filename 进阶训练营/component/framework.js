export let createElement = function (type, attributes, ...children) {
    let element;
    if (typeof type === "string") {
        element = new ElementWrapper(type);
    } else {
        element = new type();
    }

    for (const name in attributes) {
        element.setAttribute(name, attributes[name]);
    }
    let processChildren = (children) => {
        for (const child of children) {
            if (typeof child === "object" && child instanceof Array) {
                processChildren(child);
                continue;
            }
            if (typeof child === "string") {
                child = new TextWrapper(child);
            }
            element.appendChild(child);
        }
    }
    processChildren(children);

    return element;
};

export const STATE = Symbol("state");
export const ATTRIBUTE = Symbol("attribute");

export class Component {
    constructor(type) {
        this[STATE] = Object.create(null);
        this[ATTRIBUTE] = Object.create(null);
    }
    setAttribute(attrName, value) {
        this[ATTRIBUTE][attrName] = value;
    }
    appendChild(child) {
        child.mountTo(this.root);
    }
    mountTo(parent) {
        if (!this.root) {
            this.render();
        }
        parent.appendChild(this.root);
    }
    render() {
        return this.root;
    }
    triggerEvent(type, args) {
        this[ATTRIBUTE]["on" + type.replace(/^[\s\S]/, (v) => v.toUpperCase())](new CustomEvent(type, { detail: args }));
    }
}

class ElementWrapper extends Component {
    constructor(type) {
        super();
        this.root = document.createElement(type);
    }
    setAttribute(attrName, value) {
        this.root.setAttribute(attrName, value);
    }
}

class TextWrapper extends Component {
    constructor(type) {
        super();
        this.root = document.createTextNode(type);
    }
}
