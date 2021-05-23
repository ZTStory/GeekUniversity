import { scan } from "./LexParser.js";

let syntax = {
    Program: [["StatementList", "EOF"]],
    StatementList: [["Statement"], ["StatementList", "Statement"]],
    Statement: [["ExpressionStatement"], ["IfStatement"], ["VariableDeclaration"], ["FunctionDeclaration"]],
    IfStatement: [["if", "(", "Expression", ")", "Statement"]],
    VariableDeclaration: [["var", "Identifier", ";"]],
    FunctionDeclaration: [["function", "Identifier", "(", ")", "{", "Statement", "}"]],
    ExpressionStatement: [["Expression", ";"]],
    Expression: [["AdditiveExpression"]],
    AdditiveExpression: [["MultiplicativeExpression"], ["AdditiveExpression", "+", "MultiplicativeExpression"], ["AdditiveExpression", "-", "MultiplicativeExpression"]],
    MultiplicativeExpression: [["PrimaryExpression"], ["MultiplicativeExpression", "*", "PrimaryExpression"], ["MultiplicativeExpression", "/", "PrimaryExpression"]],
    PrimaryExpression: [["(", "Expression", ")"], ["Literal"], ["Identifier"]],
    Literal: [["Number"]],
};

let hash = {};

function closure(state) {
    hash[JSON.stringify(state)] = state;
    let queue = [];
    for (const symbol in state) {
        if (symbol.match(/^\$/)) {
            return;
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
            return;
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
        console.log("Declare variable", node.children[1].value);
    },
    EOF() {
        return null;
    },
};

function evaluate(node) {
    if (evaluator[node.type]) {
        return evaluator[node.type](node);
    }
}
////////////////////////////////////////////
let source = `
    var a;
    var b;
`;

let tree = parse(source);

evaluate(tree);
