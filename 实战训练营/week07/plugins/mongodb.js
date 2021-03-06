const fastifyPlugin = require("fastify-plugin");

async function mongo(fastify, options) {
    fastify.register(require("fastify-mongodb"), {
        url: "mongodb://liuzt:liuzt!123@localhost:27017/todos",
    });
}

// Wrapping a plugin function with fastify-plugin exposes the decorators
// and hooks, declared inside the plugin to the parent scope.
module.exports = fastifyPlugin(mongo);
