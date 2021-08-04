<template>
    <div class="article-content">
        <div>地址：{{ Src }}</div>
        <iframe :src="Src"></iframe>
    </div>
</template>

<script>
export default {
    name: "App",
    data() {
        return {
            Src: "",
        };
    },
    computed: {
        src() {
            console.log(this.$customStore.articleSrc);
            return this.$customStore.articleSrc;
        },
    },
    mounted() {
        this.$customStore.onGlobalStateChange((state, prev) => {
            this.Src = state.articleSrc;
        });
    },
    methods: {
        update() {
            console.log("content", this.$customStore.articleSrc);
            this.Src = this.$customStore.articleSrc;
        },
    },
};
</script>

<style>
.article-content {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 12px;
}
.article-content iframe {
    width: 100%;
    height: 100%;
}
</style>
