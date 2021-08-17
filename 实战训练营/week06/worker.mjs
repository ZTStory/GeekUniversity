import http from "http";
import { URL } from "url";

http.createServer((req, res) => {
    res.writeHead(200, "", {
        "Cache-Control": "no-cache",
        "Keep-Alive": "timeout=0"
    });
    res.end(`worker ${process.pid} handle\n`);
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.searchParams.get("kill")) {
        throw new Error("error");
    }
}).listen(8000);

console.log(`Worker ${process.pid} started`);
