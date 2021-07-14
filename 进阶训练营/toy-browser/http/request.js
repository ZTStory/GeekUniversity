const net = require("net");
const ResponseParser = require("./response");

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

module.exports = Request;
