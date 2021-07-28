let http = require("http");
let io = require("socket.io");

const child_process = require("child_process");

const fs = require("fs");
const path = require("path");
let filePath = path.resolve(__dirname, "./vue-project");
let appPath = path.resolve(__dirname, "./vue-project/src/App.vue");

let server = http.createServer((req, res) => {});
server.listen(3000);

let ws = io(server, { cors: true });

let isRunning = false;

ws.on("connection", function (socket) {
    
    console.log("connected");

    socket.on("disconnect", function () {
        console.log("disconnect");
    });

    socket.on("server", function (obj) {
        // console.log("the websokcet message is" + obj);
        fs.writeFileSync(appPath, obj, { encoding: "utf-8" });
        if (!isRunning) {
            let cp = child_process.spawn("npm", ["run", "serve"], { cwd: filePath, shell: true });
            cp.stdout.on("data", data => {
                console.log(`stdout: ${data}`);
                if (data.includes("http://localhost")) {
                    isRunning = true;
                    socket.emit("server", "vue project started!")
                }
            })
            cp.stderr.on("data", data => {
                if (typeof data === "string") {
                    console.log(`stderr: ${data}`); 
                }
            })
        }
    });
});
console.log("server started");
