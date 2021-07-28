<template>
    <div id="app">
        <div class="opration_wrap">
            <div class="button_view">
                <div>
                    <button class="btn" :class="{ active: textType === 'js' }" @click="changeTextType('js')">js</button>
                    <button class="btn" :class="{ active: textType === 'vue' }" @click="changeTextType('vue')">vue</button>
                </div>
                <button class="btn" @click="run">run code</button>
            </div>
            <Editor class="editor_view" ref="editor" @change="onChange" />
        </div>
        <div class="preview">
            <code v-if="textType === 'js'" class="result">
                {{ result }}
            </code>
            <template v-if="textType === 'vue'">
                <div v-if="loading">加载中...</div>
                <iframe v-else id="iframe" class="result" src="http://127.0.0.1:8089/#/" frameborder="0"></iframe>
            </template>
        </div>
    </div>
</template>

<script>
import Editor from "./components/Editor.vue";
import io from "socket.io-client";
export default {
    name: "App",
    components: {
        Editor,
    },
    data() {
        return {
            result: "",
            loading: false,
            socket: null,
            textType: "vue",
        };
    },
    mounted() {
        let socket = io("ws://127.0.0.1:3000"); // 建立链接
        // 此时会触发后台的connect事件
        socket.on("server", (data) => {
            console.log(data);
            this.loading = false;
        });
        this.socket = socket;
    },
    unmounted() {
        this.socket.disconnect();
    },
    methods: {
        run() {
            let editorResult = this.$refs.editor.getVal();
            console.log(this.socket.connected);
            if (this.textType === "js") {
                if (editorResult.includes("<template>")) {
                    alert("请输入js文件, console.log()为输出");
                    return;
                }
                // editorResult = "var __result = [];" + editorResult;
                // editorResult = editorResult.replace(/console\.log\(([\s\S]*?)\);?/g, function(s0, s1) {
                //     return `__result.push('> ' + ${s1})`;
                // });
                // editorResult += "return __result.join('\\n')";
                console.log(editorResult);
                let Fresult = Function(`"use strict";${editorResult}`)();
                // console.log(Fresult);
                this.result = Fresult;
            } else {
                if (!editorResult.includes("<template>")) {
                    alert("请输入vue模板文件");
                    return;
                }
                this.loading = true;
                this.socket.emit("server", editorResult);
            }
        },
        onChange() {},
        changeTextType(type) {
            this.textType = type;
        },
        add(a, b) {
            return a + b;
        },
    },
};
</script>

<style>
#app {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-around;
}

.opration_wrap {
    width: 50%;
    height: 100%;
    display: flex;
    flex-direction: column;
}
.button_view {
    flex: none;
    height: 40px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.editor_view {
    flex: 1;
}

.preview {
    width: 49%;
    height: 100%;
}

.result {
    display: block;
    width: 100%;
    height: 100%;
    border: 1px solid #e3e3e3;
    border-radius: 5px;
    white-space: pre-wrap;
}

.btn {
    height: 30px;
    width: 100px;
    background-color: #fff;
    border-radius: 4px;
    margin-left: 10px;
}

.active {
    background-color: #00a4ff;
}
</style>
