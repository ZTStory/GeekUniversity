<template>
    <div ref="editor" class="monaco-editor"></div>
</template>

<script>
import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";
export default {
    name: "Editor",
    data() {
        return {
            monacoEditor: null,
            editorValue: "",
        };
    },
    mounted() {
        setTimeout(() => {
            this.monacoEditor = monaco.editor.create(this.$refs.editor, {
                theme: "vs-dark", // 编辑器主题：vs, hc-black, or vs-dark，更多选择详见官网
                autoIndent: true, // 自动缩进
                language: "javascript",
                value: ""
            });
            // // 编辑器内容发生改变时触发
            this.monacoEditor.onDidChangeModelContent(() => {
                this.$emit("change", this.monacoEditor.getValue());
            });
        }, 100);
    },
    unmounted() {
        this.monacoEditor.dispose();
    },
    methods: {
        getVal() {
            return this.monacoEditor.getValue();
        },
    },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.monaco-editor {
    width: 100%;
}
</style>
