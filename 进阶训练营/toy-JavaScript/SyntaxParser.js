import { scan } from "./LexParser.js";

let syntax = {
    Program: [["StatementList", "EOF"]],
    StatementList: [["Statement"], ["StatementList", "Statement"]],
    Statement: [["ExpressionStatement"], ["IfStatement"], ["WhileStatement"], ["VariableDeclaration"], ["FunctionDeclaration"], ["Block"],
     ["BreakStatement"], ["ContinueStatement"], ["FunctionDeclaration"]],
    FunctionDeclaration: [
        ["function", "Identifier", "(", ")","{","StatementList", "}"]
    ],
    BreakStatement: [["break", ";"]],
    ContinueStatement: [["continue", ";"]],
    WhileStatement: [["while", "(", "Expression", ")", "Statement"]],
    IfStatement: [["if", "(", "Expression", ")", "Statement"]],
    Block: [
        ["{", "}"],
        ["{", "StatementList", "}"],
    ],
    VariableDeclaration: [
        ["var", "Identifier", ";"],
        ["let", "Identifier", ";"],
        ["const", "Identifier", ";"],
    ],
    FunctionDeclaration: [["function", "Identifier", "(", ")", "{", "Statement", "}"]],
    Arguments: [
        ["(", ")"],
        ["(", "ArgumentList", ")"],
    ],
    ArgumentList: [["AssignmentExpression"], ["ArgumentList", ",", "AssignmentExpression"]],
    ExpressionStatement: [["Expression", ";"]],
    Expression: [["AssignmentExpression"]],
    AssignmentExpression: [["LeftHandSideExpression", "=", "LogicalORExpression"], ["LogicalORExpression"]],
    LogicalORExpression: [["LogicalANDExpression"], ["LogicalORExpression", "||", "LogicalANDExpression"]],
    LogicalANDExpression: [["EqualityExpression"], ["LogicalANDExpression", "&&", "EqualityExpression"]],
    EqualityExpression: [
        ["RelationalExpression"],
        ["EqualityExpression", "==", "RelationalExpression"],
        ["EqualityExpression", "!=", "RelationalExpression"],
        ["EqualityExpression", "===", "RelationalExpression"],
        ["EqualityExpression", "!==", "RelationalExpression"],
    ],
    RelationalExpression: [
        ["AdditiveExpression"],
        ["RelationalExpression", "<", "AdditiveExpression"],
        ["RelationalExpression", ">", "AdditiveExpression"],
        ["RelationalExpression", "<=", "AdditiveExpression"],
        ["RelationalExpression", ">=", "AdditiveExpression"],
    ],
    AdditiveExpression: [["MultiplicativeExpression"], ["AdditiveExpression", "+", "MultiplicativeExpression"], ["AdditiveExpression", "-", "MultiplicativeExpression"]],
    MultiplicativeExpression: [["LeftHandSideExpression"], ["MultiplicativeExpression", "*", "LeftHandSideExpression"], ["MultiplicativeExpression", "/", "LeftHandSideExpression"]],
    LeftHandSideExpression: [["CallExpression"], ["NewExpression"]],
    CallExpression: [
        ["MemberExpression", "Arguments"],
        ["CallExpression", "Arguments"],
    ],
    NewExpression: [["MemberExpression"], ["new", "NewExpression"]],
    MemberExpression: [["PrimaryExpression"], ["PrimaryExpression", ".", "Identifier"], ["PrimaryExpression", "[", "Expression", "]"]],
    PrimaryExpression: [["(", "Expression", ")"], ["Literal"], ["Identifier"]],
    Literal: [["NumericLiteral"], ["StringLiteral"], ["BooleanLiteral"], ["NullLiteral"], ["RegularExpressionLiteral"], ["ObjectLiteral"], ["ArrayLiteral"]],
    ObjectLiteral: [
        ["{", "}"],
        ["{", "PropertyList", "}"],
    ],
    PropertyList: [["Property"], ["PropertyList", ",", "Property"]],
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

export function parse(source) {
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
