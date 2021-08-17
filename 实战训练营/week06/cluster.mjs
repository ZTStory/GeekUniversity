import cluster from "cluster";

console.log(`Primary ${process.pid} is running`);

cluster.setupMaster({
    exec: "./worker.mjs"
})
// 创建子进程
for (let index = 0; index < 4; index++) {
   cluster.fork();
}

cluster.schedulingPolicy = cluster.SCHED_RR;

// 监听 Worker 状态，如果 Worker 发生异常退出之后，Master 重启一个进程。
cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork();
});
