<template>
    <div id="app">
        <SysConvertCmp />
        <FileReaderCmp />
    </div>
</template>

<script>
import SysConvertCmp from "./components/SysConvert.vue";
import FileReaderCmp from "./components/FileReader.vue";
export default {
    name: "App",
    components: {
        SysConvertCmp,
        FileReaderCmp
    },
};
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}
</style>
