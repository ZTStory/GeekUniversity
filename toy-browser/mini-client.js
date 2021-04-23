const Request = require("./http/request");
const Parser = require("./parse-html/parser");
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
    let body = decodeURIComponent(response.body);
    console.log(body);
    let dom = Parser.parseHTML(body);
    console.log(dom);
})();
