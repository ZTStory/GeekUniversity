<template>
    <div class="menu-list">
        <div :class="{ active: item.isSelect }" v-for="(item, index) in list" :key="index" @click="clickArticle(item)">
            {{ item.title }}
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
    name: "App",
    data() {
        return {
            list: [],
        };
    },
    mounted() {
        axios
            .get("/api/article/list/0/json", {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
            })
            .then((res) => {
                if (res.data.data.datas) {
                    this.list = res.data.data.datas;
                }
            });
    },
    methods: {
        clickArticle(item) {
            this.list.forEach((element) => {
                element.isSelect = false;
            });
            item.isSelect = true;
            console.log("文章信息：", item.link);
            history.pushState(null, "文字详情", "/content");
            setTimeout(() => {
                this.$customStore.setGlobalState({
                    articleSrc: item.link,
                });
            }, 300);
        },
    },
};
</script>

<style>
.menu-list div {
    color: #333;
    font-weight: 600;
    font-size: 18px;
    line-height: 30px;
    padding: 5px 0;
    border-bottom: 1px solid #e3e3e3;
}
.menu-list .active {
    color: #00a4ff;
}
</style>
