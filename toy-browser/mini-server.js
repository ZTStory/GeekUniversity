const http = require("http");
const querystring = require("querystring");

// 这里需要注意的是中文字符在UTF-8格式下为3个字节，会导致后续response解析失败，所以中文字符需要进行 encodeURIComponent 转换，解析后再转换回来
function getHTMLById(id) {
    return `<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
    </head>
    <body custom=${id}>
        <div class="container">
            <span>${encodeURIComponent("我是一条文本信息")}</span>
            <img src="" alt="" />
        </div>
    </body>
    <style>
        .container {
            height: 100px;
            width: 200px;
        }
    </style>
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
