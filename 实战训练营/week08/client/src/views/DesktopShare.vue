<template>
    <div>
        <div>
            <video ref="myVideo" width="500" height="400"></video>
            <video ref="otherVideo" width="500" height="400"></video>
        </div>
        <div>
            <button @click="joinRoom">加入房间</button>
            <button @click="startSharing">开始分享桌面</button>
            <button @click="startVideoCall">开始音视频通话</button>
            <button @click="stopSharing">断开连接</button>
        </div>
    </div>
</template>

<script>
// import io from "socket.io-client";
import conn from "./rtcpeerconnection";
import { shareDesktop, videoCall } from "./share";
export default {
    data() {
        return {
            socket: null,
            peer: null,
            recorder: null,
        };
    },
    mounted() {
        this.$nextTick(() => {
            console.log("initSocket");
            conn.initSocket("observable-1111");
        });
    },
    methods: {
        async startVideoCall() {
            // 音视频通信
            let stream = await videoCall({ audio: true, video: true },);
            await conn.addStream(stream);
            conn.addListenerForAddStream((stream) => {
                if (stream) {
                    this.$refs.otherVideo.srcObject = stream;
                    this.$refs.otherVideo.play();
                } else {
                    this.$refs.otherVideo.pause();
                    this.$refs.otherVideo.srcObject = null;
                }
            });

            // 将MediaStream输出至video标签
            this.$refs.myVideo.srcObject = stream;
            this.$refs.myVideo.play();
        },
        async startSharing() {
            // 桌面分享
            let stream = await shareDesktop();

            await conn.addStream(stream);
            conn.addListenerForAddStream((stream) => {
                if (stream) {
                    this.$refs.otherVideo.srcObject = stream;
                    this.$refs.otherVideo.play();
                } else {
                    this.$refs.otherVideo.pause();
                    this.$refs.otherVideo.srcObject = null;
                }
            });

            // 将MediaStream输出至video标签
            this.$refs.myVideo.srcObject = stream;
            this.$refs.myVideo.play();
        },
        // 存在疑问？如何在不互传的情况下实现单方分享数据传递
        joinRoom() {
            conn.join();
            conn.addListenerForAddStream((stream) => {
                if (stream) {
                    this.$refs.otherVideo.srcObject = stream;
                    this.$refs.otherVideo.play();
                }
            });
        },
        stopSharing() {
            conn.close();
            this.$refs.myVideo.pause();
            this.$refs.myVideo.srcObject = null;
            this.$refs.otherVideo.pause();
            this.$refs.otherVideo.srcObject = null;
        },
    },
};
</script>

<style scoped></style>
