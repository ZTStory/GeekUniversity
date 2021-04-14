const http = require("http");
const querystring = require("querystring");
http.createServer((request, response) => {
    let body = [];
    request
        .on("error", (err) => {
            console.error(err);
        })
        .on("data", (chunk) => {
            body.push(chunk);
            console.log(body);
        })
        .on("end", () => {
            body = Buffer.concat(body).toString();
            console.log("body:", body);
            response.writeHead(200, { "Content-Type": "text/html" });
            // response.end("Hello World\n");
            let id = querystring.parse(body)["id"];
            if (id) {
                response.end(`Hellow World id is ${id}`);
            } else {
                response.end("Hello World");
            }
        });
}).listen(8088);
console.log("server started");
