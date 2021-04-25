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
    <style>
        .container {
            height: 100px;
            width: 200px;
        }
        .div {
            backgroud: #fff;
            height: 100%;
            width: 100%;
        }
        .div2 {
            border: 1px solid #e3e3e3;
        }
        body div {
            height: 150px;
            width: 300px;
        }
        .container div>span {
            color: red;
        }
    </style>
    <body class="container" custom=${id}>
        <div class="div div2">
            <span>This is Text!</span>
            <img src="" alt="" />
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
