const net = require("net");

class Request {
    constructor(options) {
        this.method = options.method || "GET";
        this.host = options.host;
        this.port = options.port || 80;
        this.path = options.path || "/";
        this.body = options.body || {};
        this.headers = options.headers || {};
        if (!this.headers["Content-Type"]) {
            this.headers["Content-Type"] = "application/x-www-form-urlencoded";
        }

        if (this.headers["Content-Type"] === "application/json") {
            this.bodyText = JSON.stringify(this.body);
        } else if (this.headers["Content-Type"] === "application/x-www-form-urlencoded") {
            this.bodyText = Object.keys(this.body)
                .map((key) => `${key}=${encodeURIComponent(this.body[key])}`)
                .join("&");
        }

        this.headers["Content-Length"] = this.bodyText.length;
    }

    send() {
        return new Promise((resolve, reject) => {
            const parser = new ResponseParser();
            let connection = net.createConnection(
                {
                    host: this.host,
                    port: this.port,
                },
                () => {
                    connection.write(this.toString());
                    console.log(this.toString());
                }
            );
            connection.on("data", (data) => {
                console.log(data.toString());
                parser.receive(data.toString());
                if (parser.isFinished) {
                    resolve(parser.response);
                    connection.end();
                }
            });
            connection.on("end", () => {
                console.log("已断开服务器连接");
            });
            connection.on("error", (err) => {
                console.log(err);
                reject(err);
                connection.end();
            });
        });
    }

    toString() {
        return `${this.method} ${this.path} HTTP/1.1\r\n${Object.keys(this.headers)
            .map((key) => `${key}: ${this.headers[key]}`)
            .join("\r\n")}\r\n\r\n${this.bodyText}`;
    }
}

class ResponseParser {
    constructor() {
        this.currentStatus = this.waitingStatusLine;

        this.statusLine = "";
        this.headers = {};
        this.headerName = "";
        this.headerValue = "";
        this.bodyParser = null;
    }
    get isFinished() {
        return this.bodyParser && this.bodyParser.isFinished;
    }
    get response() {
        this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/);
        return {
            statusCode: RegExp.$1,
            statusText: RegExp.$2,
            headers: this.headers,
            body: this.bodyParser.content.join(""),
        };
    }
    configBodyParser() {
        if (this.headers["Transfer-Encoding"] === "chunked") {
            this.bodyParser = new TrunkedBodyParser();
        }
    }
    receive(string) {
        for (const char of string) {
            this.currentStatus(char);
        }
    }
    waitingStatusLine(char) {
        if (char === "\r") {
            this.currentStatus = this.waitingHeaderLineEnd;
        } else {
            this.statusLine += char;
        }
    }
    waitingStatusLineEnd(char) {
        if (char === "\n") {
            this.currentStatus = this.waitingHeaderName;
        }
    }
    waitingHeaderName(char) {
        if (char === ":") {
            this.currentStatus = this.waitingHeaderSpace;
        } else if (char === "\r") {
            this.currentStatus = this.waitingHeaderBlockEnd;
            this.configBodyParser();
        } else {
            this.headerName += char;
        }
    }
    waitingHeaderSpace(char) {
        if (char === " ") {
            this.currentStatus = this.waitingHeaderValue;
        }
    }
    waitingHeaderValue(char) {
        if (char === "\r") {
            this.currentStatus = this.waitingHeaderLineEnd;
            this.headers[this.headerName] = this.headerValue;
            this.headerName = "";
            this.headerValue = "";
        } else {
            this.headerValue += char;
        }
    }
    waitingHeaderLineEnd(char) {
        if (char === "\n") {
            this.currentStatus = this.waitingHeaderName;
        }
    }
    waitingHeaderBlockEnd(char) {
        if (char === "\n") {
            this.currentStatus = this.waitingBody;
        }
    }
    waitingBody(char) {
        this.bodyParser.receiveChar(char);
    }
}

class TrunkedBodyParser {
    constructor() {
        this.currentStatus = this.waitingLength;
        this.length = 0;
        this.content = [];
        this.isFinished = false;
    }
    receiveChar(char) {
        this.currentStatus(char);
    }
    waitingLength(char) {
        if (char === "\r") {
            if (this.length === 0) {
                this.isFinished = true;
                return;
            }
            this.currentStatus = this.waitingLengthLineEnd;
        } else {
            this.length *= 16;
            this.length += parseInt(char, 16);
        }
    }
    waitingLengthLineEnd(char) {
        if (char === "\n") {
            this.currentStatus = this.readingTrunk;
        }
    }
    readingTrunk(char) {
        this.content.push(char);
        this.length--;
        if (this.length === 0) {
            this.currentStatus = this.waitingNewLine;
        }
    }
    waitingNewLine(char) {
        if (char === "\r") {
            this.currentStatus = this.waitingNewLineEnd;
        }
    }
    waitingNewLineEnd(char) {
        if (char === "\n") {
            this.currentStatus = this.waitingLength;
        }
    }
}

/// void 运算符类似于 IIFE 的外部;()
void (async function () {
    let request = new Request({
        path: "/xxx",
        method: "POST",
        host: "127.0.0.1",
        port: "8088",
        headers: {
            ZTStory: "xxx",
        },
        body: {
            id: "1",
            name: "liuzt",
        },
    });

    let response = await request.send();
    console.log(JSON.stringify(response));
})();
