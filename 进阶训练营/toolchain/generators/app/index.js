var Generator = require("yeoman-generator");

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);
    }

    async initPackage() {
        const answer = await this.prompt([
            {
                type: "input",
                name: "name",
                message: "Your project name",
                default: this.appname,
            },
        ]);

        const pkgJson = {
            name: answer.name,
            version: "1.0.0",
            description: "",
            main: "generators/app/index.js",
            scripts: {
                test: "jest",
                coverage: "jest --coverage",
            },
            author: "",
            license: "ISC",
            dependencies: {
                vue: "^2.5.16",
            },
            devDependencies: {
                "@babel/core": "^7.14.6",
                "@babel/plugin-transform-modules-commonjs": "^7.14.5",
                "@babel/preset-env": "^7.14.7",
                "@vue/compiler-sfc": "^3.1.4",
                "babel-loader": "^8.2.2",
                "copy-webpack-plugin": "^9.0.1",
                "css-loader": "^5.2.6",
                "html-webpack-plugin": "^5.3.2",
                jest: "^27.0.6",
                "vue-loader": "^15.9.3",
                "vue-style-loader": "^4.1.3",
                "vue-template-compiler": "^2.5.16",
                webpack: "^5.42.0",
                "webpack-cli": "^4.7.2",
            },
        };
        this.fs.extendJSON(this.destinationPath("package.json"), pkgJson);

        this.fs.copyTpl(this.templatePath(".babelrc"), this.destinationPath(".babelrc"));

        this.fs.copyTpl(this.templatePath("index.html"), this.destinationPath("src/index.html"), {
            title: answer.name,
        });

        this.fs.copyTpl(this.templatePath("App.vue"), this.destinationPath("src/App.vue"));

        this.fs.copyTpl(this.templatePath("main.js"), this.destinationPath("src/main.js"));

        this.fs.copyTpl(this.templatePath("pages"), this.destinationPath("src/pages"));

        this.fs.copyTpl(this.templatePath("webpack.config.js"), this.destinationPath("webpack.config.js"));

        this.fs.copyTpl(this.templatePath("add.js"), this.destinationPath("src/add.js"));
        
        this.fs.copyTpl(this.templatePath("__test__"), this.destinationPath("src/__test__"));
    }

    install() {
        this.npmInstall();
    }
};
