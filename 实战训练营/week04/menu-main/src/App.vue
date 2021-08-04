<template>
    <div class="layout">
        <div id="menu-list"></div>
        <div id="menu-list-content"></div>
    </div>
</template>

<script>
export default {
    name: "App",
    computed: {
        src() {
            console.log(this.$customStore.articleSrc);
            return this.$customStore.articleSrc;
        },
    },
    mounted() {},
};
</script>

<style>
.layout {
    display: flex;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
}
#menu-list {
    flex: 1;
}
#menu-list > div {
    height: 100%;
    width: 100%;
}

#menu-list-content {
    flex: 3;
}
#menu-list-content > div {
    height: 100%;
    width: 100%;
}
</style>
