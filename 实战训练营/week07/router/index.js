function createResponseEntity({ result = {}, msg = "success", code = 0 }) {
    return {
        msg,
        code,
        result,
    };
}

async function routes(fastify, options) {
    // mongodb
    const db = fastify.mongo.db;

    fastify.get("/todo/query", async (req, reply) => {
        const collection = db.collection("todos");
        const result = await collection.find({});
        console.log(result);
        return createResponseEntity({
            result,
        });
    });

    fastify.get("/todo/add", async (req, reply) => {
        const collection = db.collection("todos");
        await collection.insertMany([
            {
                subject: "这是一条数据！",
                datetime: Date.now(),
                state: 0,
            },
            {
                subject: "这是第二条数据！",
                datetime: Date.now(),
                state: 1,
            },
        ]);
        return createResponseEntity({});
    });

    // redis
    fastify.get("/redis/set", async (request, reply) => {
        console.log(request.query);
        if (!request.query) return createResponseEntity({ msg: "param key is required", code: 401 });
        const { redis } = fastify;
        Object.keys(request.query).forEach((key) => {
            redis.set(key, request.query[key]);
        });
        return createResponseEntity({ msg: "set success!", result: request.query });
    });

    fastify.get("/redis/get/:key", async (request, reply) => {
        if (!request.params.key) return createResponseEntity({ msg: "param key is required", code: 401 });
        const { redis } = fastify;
        let val = await redis.get(request.params.key);
        return createResponseEntity({ result: val });
    });

    // mysql
    fastify.get("/mysql/insert", async (req, reply) => {
        fastify.mysql.getConnection((err, connection) => {
            if (err) return reply.code(500).header("Content-Type", "application/json; charset=utf-8").send(err);
            connection.execute("INSERT INTO todos(num, name, date, ext) VALUES (0, 'mysql', '2021-08-10 20:20:20', 0)", (err, result, fields) => {
                return reply.code(200).header("Content-Type", "application/json; charset=utf-8").send({ result });
            });
        });
    });

    fastify.get("/mysql/query", async (req, reply) => {
        fastify.mysql.getConnection((err, connection) => {
            if (err) return reply.code(500).header("Content-Type", "application/json; charset=utf-8").send(err);
            connection.query("SELECT * FROM todos", (err, result, fields) => {
                return reply.code(200).header("Content-Type", "application/json; charset=utf-8").send({ result });
            });
        });
    });
}

module.exports = routes;
