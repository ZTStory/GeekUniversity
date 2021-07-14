<template>
    <div>
        <input type="file" name="" id="file-input" @change="previewFile" />
        <img src="" id="img" />
        <button @click="download">下载图片</button>
    </div>
</template>

<script>
export default {
    data() {
        return {};
    },
    methods: {
        previewFile() {
            var preview = document.getElementById("img");
            var file = document.getElementById("file-input").files[0];
            var reader = new FileReader();

            reader.addEventListener(
                "load",
                function() {
                    preview.src = reader.result;
                },
                false
            );

            if (file) {
                reader.readAsDataURL(file);
            }
        },
        download() {
            // 灰度算法
            var preview = document.querySelector("img");
            let canvas = document.createElement("canvas");
            canvas.width = preview.width;
            canvas.height = preview.height;

            let ctx = canvas.getContext("2d");
            ctx.drawImage(preview, 0, 0);

            var pixels = ctx.getImageData(0, 0, preview.width, preview.height);
            var pixeldata = pixels.data;
            for (var i = 0, len = pixeldata.length; i < len; i += 4) {
                var gray = Math.floor((pixels.data[i] + pixels.data[i + 1] + pixels.data[i + 2]) / 3); //平均值灰度算法
                pixels.data[i] = gray;
                pixels.data[i + 1] = gray;
                pixels.data[i + 2] = gray;
            }
            ctx.putImageData(pixels, 0, 0);
            document.body.appendChild(canvas);

            let a = document.createElement("a");
            a.href = canvas.toDataURL("image/png");
            a.download = "gray_icon";
            document.body.appendChild(a);
            a.click();
        },
    },
};
</script>

<style scoped></style>
