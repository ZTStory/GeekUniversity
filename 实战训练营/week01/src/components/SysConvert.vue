<template>
    <div class="hello">
        <div>
            <input v-model="input" type="number" placeholder="请输入十进制数" />
            <div>64进制：{{ result }}</div>
            <button @click="change">10转换64</button>
        </div>
        <div>
            <input v-model="input2" type="text" placeholder="请输入六十四进制数" />
            <div>10进制：{{ result2 }}</div>
            <button @click="change2">64转换10</button>
        </div>
    </div>
</template>

<script>
let tmpList = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-".split("");
export default {
    name: "HelloWorld",
    data() {
        return {
            input: 0,
            result: "",
            input2: "",
            result2: "",
        };
    },

    methods: {
        change() {
            this.result = this._10To64(this.input);
        },
        change2() {
            this.result2 = this._64To10(this.input2);
        },
        _10To64(num) {
            let n = num;
            let result = [];
            while (n > 0) {
                result.push(tmpList[n % 64]);
                n = Math.floor(n / 64);
            }
            return result.reverse().join("");
        },
        _64To10(num) {
            let result = 0;
            let nList = num
                .toString()
                .split("")
                .reverse();
            let i = 0;
            while (i < nList.length) {
                let index = tmpList.findIndex((item) => item === nList[i]);
                result += index * 64 ** i;
                i++;
            }
            return result;
        },
    },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
