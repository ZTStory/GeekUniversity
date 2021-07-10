<template>
    <p>{{ msg }} World!</p>
</template>

<script>
export default {
    data() {
        return {
            msg: "Hello",
        };
    },
};
</script>

<style scoped>
p {
    font-size: 20px;
    color: red;
    text-align: center;
}
</style>
