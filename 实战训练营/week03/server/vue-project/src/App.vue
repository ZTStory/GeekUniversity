<template>
    <p>{{ msg }} World!
        <button @click="tap">按钮</button>
    </p>
</template>

<script>
export default {
    data() {
        return {
            msg: "Helllo sdafdasfasdfdsasdfasf",
        };
    },
    methods: {
        tap() {
            alert("点击了")
        }
    }
};
</script>

<style scoped>
p {
    font-size: 20px;
    color: red;
    text-align: center;
    background: white;
}
</style>
