const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
module.exports = {
    chainWebpack(config) {
        config.plugin("monaco").use(
            new MonacoWebpackPlugin({
                languages: ["javascript", "css", "html"],
            })
        );
    },
    devServer: {
        port: 8088
    }
};
