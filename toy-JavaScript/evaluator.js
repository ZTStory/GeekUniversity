import { ExecutionContext, Reference, Realm, JSObject, JSNumber, JSBoolean, JSString, JSUndefined, JSNull, JSSymbol, CompletionRecord, EnvironmentRecord, ObjectEnvironmentRecord } from "./runtime.js";

export class Evaluator {
    constructor() {
        this.realm = new Realm();
        this.globalObject = new JSObject();
        this.globalObject.set("log", new JSObject());
        this.globalObject.get("log").call = (args) => {
            console.log(args);
        };
        this.ecs = [new ExecutionContext(this.realm, new ObjectEnvironmentRecord(this.globalObject), new ObjectEnvironmentRecord(this.globalObject))];
    }
    evaluateModule(node) {
        let globalEC = this.ecs[0];
        let newEC = new ExecutionContext(this.realm, new ObjectEnvironmentRecord(globalEC.lexicalEnvironment), new ObjectEnvironmentRecord(globalEC.lexicalEnvironment));
        this.ecs.push(newEC);
        let result = this.evaluate(node);
        this.ecs.pop();
        return result;
    }
    evaluate(node) {
        if (this[node.type]) {
            let r = this[node.type](node);
            return r;
        }
    }

    Program(node) {
        return this.evaluate(node.children[0]);
    }
    StatementList(node) {
        if (node.children.length === 1) {
            return this.evaluate(node.children[0]);
        } else {
            let record = this.evaluate(node.children[0]);
            if (record.type === "normal") {
                return this.evaluate(node.children[1]);
            }
            return record;
        }
    }
    Statement(node) {
        return this.evaluate(node.children[0]);
    }
    BreakStatement(node) {
        return new CompletionRecord("break");
    }
    ContinueStatement(node) {
        return new CompletionRecord("continue");
    }
    WhileStatement(node) {
        while (true) {
            let condition = this.evaluate(node.children[2]);
            if (condition instanceof Reference) {
                condition = condition.get();
            }
            if (condition.toBoolean().value) {
                let record = this.evaluate(node.children[4]);
                if (record.type === "break") {
                    return new CompletionRecord("normal");
                }
                if (record.type === "continue") {
                    continue;
                }
            } else {
                return new CompletionRecord("normal");
            }
        }
    }
    IfStatement(node) {
        let condition = this.evaluate(node.children[2]);
        if (condition instanceof Reference) {
            condition = condition.get();
        }
        if (condition.toBoolean().value) {
            return this.evaluate(node.children[4]);
        }
    }
    Block(node) {
        if (node.children.length === 2) {
            return;
        }
        let runningEC = this.ecs[this.ecs.length - 1];
        let newEC = new ExecutionContext(runningEC.realm, new EnvironmentRecord(runningEC.lexicalEnvironment), runningEC.variableEnvironment);
        this.ecs.push(newEC);
        let result = this.evaluate(node.children[1]);
        this.ecs.pop(newEC);
        return result;
    }
    VariableDeclaration(node) {
        let runningEC = this.ecs[this.ecs.length - 1];
        runningEC.variableEnvironment.add(node.children[1].value);
        return new CompletionRecord("normal", new JSUndefined());
        // console.log("Declare variable", node.children[1].value);
    }
    ExpressionStatement(node) {
        let result = this.evaluate(node.children[0]);
        if (result instanceof Reference) {
            result = result.get();
        }
        return new CompletionRecord("normal", result);
    }
    Expression(node) {
        return this.evaluate(node.children[0]);
    }
    /// 增加等式表达式
    EqualityExpression(node) {
        if (node.children.length == 1) {
            return this.evaluate(node.children[0]);
        }
        let left = this.evaluate(node.children[0]);
        let right = this.evaluate(node.children[2]);
        if (left instanceof Reference) {
            left = left.get();
        }
        if (right instanceof Reference) {
            right = right.get();
        }
        if (node.children[1].type === "==") {
            return new JSBoolean(left.value == right.value);
        }
        if (node.children[1].type === "!=") {
            return new JSBoolean(left.value != right.value);
        }
        if (node.children[1].type === "===") {
            return new JSBoolean(left.value === right.value);
        }
        if (node.children[1].type === "!==") {
            return new JSBoolean(left.value !== right.value);
        }
    }
    /// 增加相关表达式
    RelationalExpression(node) {
        if (node.children.length == 1) {
            return this.evaluate(node.children[0]);
        }
        let left = this.evaluate(node.children[0]);
        let right = this.evaluate(node.children[2]);
        if (left instanceof Reference) {
            left = left.get();
        }
        if (right instanceof Reference) {
            right = right.get();
        }
        if (node.children[1].type === "<") {
            return new JSBoolean(left.value < right.value);
        }
        if (node.children[1].type === "<=") {
            return new JSBoolean(left.value <= right.value);
        }
        if (node.children[1].type === ">") {
            return new JSBoolean(left.value > right.value);
        }
        if (node.children[1].type === ">=") {
            return new JSBoolean(left.value >= right.value);
        }
    }
    AdditiveExpression(node) {
        if (node.children.length == 1) {
            return this.evaluate(node.children[0]);
        } else {
            // TODO
            let left = this.evaluate(node.children[0]);
            let right = this.evaluate(node.children[2]);
            if (left instanceof Reference) {
                left = left.get();
            }
            if (right instanceof Reference) {
                right = right.get();
            }
            if (node.children[1].type === "+") {
                return new JSNumber(left.value + right.value);
            } else if (node.children[1].type === "-") {
                return new JSNumber(left.value - right.value);
            }
        }
    }
    MultiplicativeExpression(node) {
        if (node.children.length == 1) {
            return this.evaluate(node.children[0]);
        } else {
            // TODO
            let left = this.evaluate(node.children[0]);
            let right = this.evaluate(node.children[2]);
            if (left instanceof Reference) {
                left = left.get();
            }
            if (right instanceof Reference) {
                right = right.get();
            }
            if (node.children[1].type === "*") {
                return new JSNumber(left.value * right.value);
            } else if (node.children[1].type === "/") {
                return new JSNumber(left.value / right.value);
            }
        }
    }
    PrimaryExpression(node) {
        if (node.children.length === 1) {
            return this.evaluate(node.children[0]);
        }
    }
    Literal(node) {
        return this.evaluate(node.children[0]);
    }
    BooleanLiteral(node) {
        if (node.value === "false") {
            return new JSBoolean(false);
        } else {
            return new JSBoolean(true);
        }
    }
    NullLiteral(node) {
        return new JSNull();
    }
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
        return new JSNumber(value);
    }
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
        return new JSString(result);
    }
    ObjectLiteral(node) {
        if (node.children.length === 2) {
            return {};
        } else if (node.children.length === 3) {
            let object = new JSObject();
            this.PropertyList(node.children[1], object);
            return object;
        }
    }
    PropertyList(node, object) {
        if (node.children.length === 1) {
            this.Property(node.children[0], object);
        } else {
            this.PropertyList(node.children[0], object);
            this.Property(node.children[2], object);
        }
    }
    Property(node, object) {
        let name;
        if (node.children[0].type === "Identifier") {
            name = node.children[0].value;
        } else if (node.children[0].type === "StringLiteral") {
            name = this.evaluate(node.children[0]);
        }
        object.set(name, {
            value: this.evaluate(node.children[2]),
            writable: true,
            enumerable: true,
            configable: true,
        });
    }
    AssignmentExpression(node) {
        if (node.children.length === 1) {
            return this.evaluate(node.children[0]);
        }
        let left = this.evaluate(node.children[0]);
        let right = this.evaluate(node.children[2]);
        left.set(right);
    }
    LogicalORExpression(node) {
        if (node.children.length === 1) {
            return this.evaluate(node.children[0]);
        }
        let result = this.evaluate(node.children[0]);
        if (result) {
            return result;
        } else {
            return this.evaluate(node.children[2]);
        }
    }

    LogicalANDExpression(node) {
        if (node.children.length === 1) {
            return this.evaluate(node.children[0]);
        }
        let result = this.evaluate(node.children[0]);
        if (!result) {
            return result;
        } else {
            return this.evaluate(node.children[2]);
        }
    }

    Identifier(node) {
        let runningEC = this.ecs[this.ecs.length - 1];

        return new Reference(runningEC.lexicalEnvironment, node.value);
    }

    LeftHandSideExpression(node) {
        return this.evaluate(node.children[0]);
    }

    NewExpression(node) {
        if (node.children.length === 1) {
            return this.evaluate(node.children[0]);
        }
        if (node.children.length === 2) {
            let cls = this.evaluate(node.children[1]);
            return cls.call();
        }
    }
    CallExpression(node) {
        if (node.children.length === 1) {
            return this.evaluate(node.children[0]);
        }
        if (node.children.length === 2) {
            let func = this.evaluate(node.children[0]);
            let args = this.evaluate(node.children[1]);
            if (func instanceof Reference) func = func.get();
            return func.call(args);
        }
    }
    MemberExpression(node) {
        if (node.children.length === 1) {
            return this.evaluate(node.children[0]);
        }
        if (node.children.length === 3) {
            let obj = this.evaluate(node.children[0]).get();
            let props = obj.get(node.children[2].value);
            if ("value" in props) {
                return props.value;
            }
            if ("get" in props) {
                return props.get.call();
            }
        } else if (node.children.length === 4) {
            let obj = this.evaluate(node.children[0]).get();
            // let props = obj.get(node.children[2].value);
        }
    }

    Arguments(node) {
        if (node.children.length === 2) {
            return [];
        } else {
            return this.evaluate(node.children[1]);
        }
    }
    ArgumentList(node) {
        if (node.children.length === 1) {
            let result = this.evaluate(node.children[0]);
            if (result instanceof Reference) result = result.get();
            return [result];
        } else {
            let result = this.evaluate(node.children[2]);
            if (result instanceof Reference) result = result.get();
            return this.evaluate(node.children[0]).concat(result);
        }
    }

    FunctionDeclaration(node) {
        let name = node.children[1].name;
        let code = node.children[node.children.length - 2];
        let func = new JSObject();
        func.call = (args) => {
            let newEC = new ExecutionContext(this.realm, new EnvironmentRecord(func.environment), new EnvironmentRecord(func.environment));
            this.ecs.push(newEC);
            this.evaluate(code);
            this.ecs.pop();
        };
        let runningEC = this.ecs[this.ecs.length - 1];
        runningEC.lexicalEnvironment.add(name);
        runningEC.lexicalEnvironment.set(name, func);
        func.environment = runningEC.lexicalEnvironment;
        return new CompletionRecord("normal");
    }

    EOF() {
        return null;
    }
}
