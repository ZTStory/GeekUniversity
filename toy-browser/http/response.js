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
            this.currentStatus = this.readingThunk;
        }
    }
    readingThunk(char) {
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

module.exports = ResponseParser;
