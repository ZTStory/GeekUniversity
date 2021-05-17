class XRegExp {
    constructor(source, flag, root = "root") {
        this.table = new Map();
        this.regexp = new RegExp(this.complieRegExp(source, root, 0).source, flag);
        console.log(this.regexp);
        console.log(this.table);
    }

    complieRegExp(source, name, start) {
        if (source[name] instanceof RegExp) {
            return {
                source: source[name].source,
                length: 0,
            };
        }
        let length = 0;

        let regexp = source[name].replace(/\<([^>]+)\>/g, (str, $1) => {
            this.table.set(start + length, $1);
            // this.table.set($1, start + length);

            ++length;

            let r = this.complieRegExp(source, $1, start + length);

            length += r.length;
            return `(${r.source})`;
        });
        return {
            source: regexp,
            length: length,
        };
    }

    exec(string) {
        let r = this.regexp.exec(string);
        for (let i = 1; i < r.length; i++) {
            if (r[i] !== undefined) {
                r[this.table.get(i - 1)] = r[i];
            }
        }
        return r;
    }

    get lastIndex() {
        return this.regexp.lastIndex;
    }

    set lastIndex(value) {
        return (this.regexp.lastIndex = value);
    }
}

const expressObj = {
    InputElement: "<Whitespace>|<LineTerminator>|<Comments>|<Token>",
    Whitespace: / /,
    LineTerminator: /\n/,
    Comments: /\/\*(?:[^*]|\*[^\/])*\*\/|\/\/[^\n]*/,
    Token: "<Literal>|<Keywords>|<Identifer>|<Punctuator>",
    Literal: "<NumericLiteral>|<BooleanLiteral>|<StringLiteral>|<NullLiteral>",
    NumericLiteral: /(?:[1-9][0-9]*|0)(?:\.[0-9]*)?|\.[0-9]+/,
    BooleanLiteral: /true|false/,
    StringLiteral: /\"(?:[^"\n]|\\[\s\S])*\"|\'(?:[^"\n]|\\[\s\S])*\'/,
    NullLiteral: /null/,
    Identifer: /[a-zA-Z_$][a-zA-Z0-9_$]*/,
    Keywords: /if|else|for|function|let/,
    Punctuator: /\?|\+|\-|\:|\,|\(|\<|\+\+|\=\=|\=\>|\=|\*|\.|\)|\[|\]|\;|\{|\}/,
};

// let xregexp = complieRegExp(expressObj, "InputElement");
// console.log(new RegExp(xregexp, "g"));

function scan(str) {
    let regexp = new XRegExp(expressObj, "g", "InputElement");
    while (regexp.lastIndex < str.length) {
        let r = regexp.exec(str);
        // document.write(r[0]);
        console.log(r);
        if (!r[0].length) {
            break;
        }
    }

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let cell = document.createElement("div");
            cell.classList.add("cell");
            cell.innerText = parttern[i * 3 + j] == 2 ? "❌" : pattern[i * 3 + j] == 1 ? "⭕️" : "";
            cell.addEventListener("click", () => userMove(j, i));
            board.appendChild(cell);
        }
        board.appendChild(document.createElement("br"));
    }
}

scan(`
    for(let i = 0; i < 3; i++) {
        for(let j = 0; j < 3; j++) {
            let cell = document.createElement("div");
            cell.classList.add("cell");
            cell.innerText = parttern[i * 3 + j] == 2 ? "❌" : pattern[i * 3 + j] == 1 ? "⭕️" : "";
            cell.addEventListener("click", () => userMove(j, i));
            board.appendChild(cell);
        }
        board.appendChild(document.createElement("br"));
    }
`);
