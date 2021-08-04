const { name } = require('./package');
module.exports = {
    lintOnSave: false,
    devServer: {
        proxy: "https://www.wanandroid.com",
        port: 9002,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
    },
    configureWebpack: {
        output: {
            library: `${name}-[name]`,
            libraryTarget: "umd", // 把微应用打包成 umd 库格式
            jsonpFunction: `webpackJsonp_${name}`,
        },
    },
};
