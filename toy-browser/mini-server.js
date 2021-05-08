const http = require("http");
const querystring = require("querystring");

// 这里需要注意的是中文字符在UTF-8格式下为3个字节，会导致后续response解析失败，所以中文字符需要进行 encodeURIComponent 转换，解析后再转换回来
function getHTMLById(id) {
    return `<html>
    <head>
        <style>
            #container {
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                height: 300px;
                width: 500px;
                background-color: rgb(255, 255, 255);
            }
            #container #myid {
                background-color: rgb(255, 0, 0);
                height: 100px;
                width: 200px;
            }
            #container .c1 {
                flex: 1;
                background-color: rgb(0, 255, 0);
                height: 50px;
            }
        </style>
    </head>
    <body>
        <div id="container">
            <div id="myid"></div>
            <div class="c1"></div>
        </div>
    </body>
</html>`;
}

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
            let id = querystring.parse(body)["id"];
            if (id) {
                response.end(getHTMLById(id));
            } else {
                response.end("Hello World");
            }
        });
}).listen(8088);
console.log("server started");
