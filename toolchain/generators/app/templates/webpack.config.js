const webpack = require("webpack"); // 用于访问内置插件
const { VueLoaderPlugin } = require("vue-loader");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: "./src/main.js",
    mode: "production",
    module: {
        rules: [
            { test: /\.vue$/, use: "vue-loader" },
            {
                test: /\.css$/,
                use: ["vue-style-loader", "css-loader"],
            },
            {
                test: /\.js$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                    },
                },
            },
        ],
    },
    plugins: [
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            filename: "index.html",
        }),
    ],
};
