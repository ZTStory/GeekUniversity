<template>
    <p>{{ msg }} World!</p>
</template>

<script>
export default {
    data() {
        return {
            msg: "Helllo",
        };
    },
};
</script>

<style scoped>
p {
    font-size: 20px;
    color: red;
    text-align: center;
    background: blue;
}
</style>
