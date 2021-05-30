import {
    scan
} from "./LexParser.js";

let syntax = {
    Program: [
        ["StatementList", "EOF"]
    ],
    StatementList: [
        ["Statement"],
        ["StatementList", "Statement"]
    ],
    Statement: [
        ["ExpressionStatement"],
        ["IfStatement"],
        ["VariableDeclaration"],
        ["FunctionDeclaration"]
    ],
    IfStatement: [
        ["if", "(", "Expression", ")", "Statement"]
    ],
    VariableDeclaration: [
        ["var", "Identifier", ";"],
        ["let", "Identifier", ";"],
        ["const", "Identifier", ";"],
    ],
    FunctionDeclaration: [
        ["function", "Identifier", "(", ")", "{", "Statement", "}"]
    ],
    ExpressionStatement: [
        ["Expression", ";"]
    ],
    Expression: [
        ["AssignmentExpression"]
    ],
    AssignmentExpression: [
        ["Identifier", "=", "AdditiveExpression"],
        ["AdditiveExpression"]
    ],
    AdditiveExpression: [
        ["MultiplicativeExpression"],
        ["AdditiveExpression", "+", "MultiplicativeExpression"],
        ["AdditiveExpression", "-", "MultiplicativeExpression"]
    ],
    MultiplicativeExpression: [
        ["PrimaryExpression"],
        ["MultiplicativeExpression", "*", "PrimaryExpression"],
        ["MultiplicativeExpression", "/", "PrimaryExpression"]
    ],
    PrimaryExpression: [
        ["(", "Expression", ")"],
        ["Literal"],
        ["Identifier"]
    ],
    Literal: [
        ["NumericLiteral"],
        ["StringLiteral"],
        ["BooleanLiteral"],
        ["NullLiteral"],
        ["RegularExpressionLiteral"],
        ["ObjectLiteral"],
        ["ArrayLiteral"]
    ],
    ObjectLiteral: [
        ["{", "}"],
        ["{", "PropertyList", "}"],
    ],
    PropertyList: [
        ["Property"],
        ["PropertyList", ",", "Property"]
    ],
    Property: [
        ["StringLiteral", ":", "AdditiveExpression"],
        ["Identifier", ":", "AdditiveExpression"],
    ],
};

let hash = {};

function closure(state) {
    hash[JSON.stringify(state)] = state;
    let queue = [];
    for (const symbol in state) {
        if (symbol.match(/^\$/)) {
            continue;
        }
        queue.push(symbol);
    }
    // 广度优先搜索
    while (queue.length) {
        let symbol = queue.shift();
        // console.log(symbol);
        if (syntax[symbol]) {
            for (const rule of syntax[symbol]) {
                if (!state[rule[0]]) {
                    queue.push(rule[0]);
                }
                let current = state;
                for (const part of rule) {
                    if (!current[part]) {
                        current[part] = {};
                    }
                    current = current[part];
                }
                current.$reduceType = symbol;
                current.$reduceLength = rule.length;
            }
        }
    }

    for (const symbol in state) {
        if (symbol.match(/^\$/)) {
            continue;
        }
        if (hash[JSON.stringify(state[symbol])]) {
            state[symbol] = hash[JSON.stringify(state[symbol])];
        } else {
            closure(state[symbol]);
        }
    }
}

let end = {
    $isEnd: true,
};

let start = {
    Program: end,
};

closure(start);

function parse(source) {
    let stack = [start];
    let symbolStack = [];

    function reduce() {
        let state = stack[stack.length - 1];

        if (state.$reduceType) {
            let children = [];
            for (let i = 0; i < state.$reduceLength; i++) {
                stack.pop();
                children.push(symbolStack.pop());
            }
            let newSymbol = {
                type: state.$reduceType,
                children: children.reverse(),
            };
            // create a non-terminal symbol and shift it
            return newSymbol;
        } else {
            throw new Error("unexpected token");
        }
    }

    function shift(symbol) {
        let state = stack[stack.length - 1];
        if (symbol.type in state) {
            stack.push(state[symbol.type]);
            symbolStack.push(symbol);
        } else {
            // reduce to non-terminal symbols
            shift(reduce());
            shift(symbol);
        }
    }

    for (const symbol of scan(source)) {
        shift(symbol);
        // console.log(symbol);
    }

    return reduce();
}

class Realm {
    constructor() {
        this.global = new Map();
        this.Object = new Map();
        this.Object.call = function () {

        }
        this.Object_prototype = new Map();
    }
}

class EnvironmentRecord {
    constructor() {
        this.thisValue
        this.variables = new Map();
        this.outer = null;
    }
}

class ExecutionContext {
    constructor() {
        this.lexicalEnvironment = {}
        this.variableEnvironment = this.lexicalEnvironment;
        this.realm = {}
    }
}

class Reference {
    constructor(object, property) {
        this.object = object;
        this.property = property;
    }
    set(value) {
        this.object[this.property] = value;
    }
    get() {
        return this.object[this.property];
    }
}

let evaluator = {
    Program(node) {
        return evaluate(node.children[0]);
    },
    StatementList(node) {
        if (node.children.length === 1) {
            return evaluate(node.children[0]);
        } else {
            evaluate(node.children[0]);
            return evaluate(node.children[1]);
        }
    },
    Statement(node) {
        return evaluate(node.children[0]);
    },
    VariableDeclaration(node) {
        debugger;
        let runningEC = ecs[ecs.length - 1];
        runningEC.variableEnvironment[node.children[1].value];
        // console.log("Declare variable", node.children[1].value);
    },
    ExpressionStatement(node) {
        return evaluate(node.children[0]);
    },
    Expression(node) {
        return evaluate(node.children[0]);
    },
    AdditiveExpression(node) {
        if (node.children.length == 1) {
            return evaluate(node.children[0]);
        } else {
            // TODO
        }
    },
    MultiplicativeExpression(node) {
        if (node.children.length == 1) {
            return evaluate(node.children[0]);
        } else {
            // TODO
        }
    },
    PrimaryExpression(node) {
        if (node.children.length === 1) {
           return evaluate(node.children[0]);
        }
    },
    Literal(node) {
        return evaluate(node.children[0]);
    },
    NumericLiteral(node) {
        let str = node.value;
        let l = str.length;
        let value = 0;

        let n = 10;
        if (str.match(/^0b/)) {
            n = 2;
            l -= 2;
        } else if (str.match(/^0o/)) {
            n = 8;
            l -= 2;
        } else if (str.match(/^0x/)) {
            n = 16;
            l -= 2;
        }

        while (l--) {
            let c = str.charCodeAt(str.length - l - 1);
            if (c >= "a".charCodeAt(0)) {
                c = c - "a".charCodeAt(0) + 10;
            } else if (c >= "A".charCodeAt(0)) {
                c = c - "A".charCodeAt(0) + 10;
            } else if (c >= "0".charCodeAt(0)) {
                c = c - "0".charCodeAt(0);
            }
            value = value * n + c;
        }
        return value;
    },
    StringLiteral(node) {
        // let i = 1;
        let result = [];

        for (let index = 1; index < node.value.length - 1; index++) {
            if (node.value[index] === "\\") {
                ++index;
                let c = node.value[index];
                // ' " \ b f n r t v
                let map = {
                    "'": "'",
                    '"': '"',
                    "\\": "\\",
                    "\0": String.fromCharCode(0x0000),
                    b: String.fromCharCode(0x0008),
                    f: String.fromCharCode(0x000c),
                    n: String.fromCharCode(0x000a),
                    r: String.fromCharCode(0x000d),
                    t: String.fromCharCode(0x0009),
                    v: String.fromCharCode(0x000b),
                };
                if (c in map) {
                    result.push(map[c]);
                } else {
                    result.push(c);
                }
            } else {
                result.push(node.value[index]);
            }
        }
        // console.log(result);
        return result.join("");
    },
    ObjectLiteral(node) {
        if (node.children.length === 2) {
            return {};
        } else if (node.children.length === 3) {
            let object = new Map();
            this.PropertyList(node.children[1], object);
            // console.log(object);
            return object;
        }
    },
    PropertyList(node, object) {
        if (node.children.length === 1) {
            this.Property(node.children[0], object);
        } else {
            this.PropertyList(node.children[0], object);
            this.Property(node.children[2], object);
        }
    },
    Property(node, object) {
        let name;
        if (node.children[0].type === "Identifier") {
            name = node.children[0].value;
        } else if (node.children[0].type === "StringLiteral") {
            name = evaluate(node.children[0]);
        }
        object.set(name, {
            value: evaluate(node.children[2]),
            writable: true,
            enumerable: true,
            configable: true
        });
    },
    AssignmentExpression(node) {
        if (node.children.length === 1) {
            return evaluate(node.children[0]);
        } 
        let left = evaluate(node.children[0]);
        let right = evaluate(node.children[2]);
        left.set(right);
    },
    Identifier(node) {
        let runningEC = ecs[ecs.length - 1];

        return new Reference(runningEC.lexicalEnvironment, node.value);
    },
    EOF() {
        return null;
    },
};

let realm = new Realm();
let ecs = [new ExecutionContext()];

function evaluate(node) {
    if (evaluator[node.type]) {
        let r = evaluator[node.type](node);
        return r;
    }
}

window.js = {
    evaluate,
    parse,
};

////////////////////////////////////////////
// let source = `
//     "ab\\\nab";
// `;

// let tree = parse(source);

// evaluate(tree);