// Require the framework and instantiate it
const fastify = require("fastify")({ logger: true });

fastify.register(require("./plugins/mongodb"));
fastify.register(require("./plugins/mysql"));
fastify.register(require("./plugins/redis"));

// setup routers
fastify.register(require("./router/index"));

// Run the server!
const start = async () => {
    try {
        await fastify.listen(3000);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
