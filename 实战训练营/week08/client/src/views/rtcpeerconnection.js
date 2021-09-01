let pc;
let socket;

let _roomName = "";

let onAddStream = () => {};
function addListenerForAddStream(cb) {
    if (cb) {
        onAddStream = cb;
    }
}

async function addStream(stream) {
    for (const track of stream.getTracks()) {
        pc.addTrack(track, stream);
    }
}

function initSocket(roomName) {
    _roomName = roomName;
    socket = new window.ScaleDrone("OXo4HSBTCQ8ehrxI");
    socket.on("open", (error) => {
        console.log("socket open");
        if (error) {
            console.error(error);
        }
        let room = socket.subscribe(roomName);
        room.on("open", function(error) {
            console.log("room open: ", room);
            if (error) {
                this.onError(error);
            }
        });
        room.on("members", (members) => {
            console.log("MEMBERS", members);
            // 如果你是第二个链接到房间的人，就会创建offer
            let isOffer = members.length === 2;
            _startWebRTC(isOffer);
        });
        room.on("member_join", (member) => {
            console.log("member_join", member);
        });
        room.on("member_leave", (id) => {
            console.log("member_leave", id);
        });
        room.on("message", () => {
            console.log("room message");
        });
        // 从Scaledrone监听信令数据
        room.on("data", (message, client) => {
            //不处理自己发送消息
            if (client.id === socket.clientId) {
                return;
            }
            console.log("room get data");
            if (message.sdp) {
                // 设置远程sdp, 在offer 或者 answer后
                console.log("sdp消息：", message);
                pc.setRemoteDescription(
                    new RTCSessionDescription(message.sdp),
                    () => {
                        // 当收到offer 后就接听
                        console.log("sdp消息类型：", pc.remoteDescription.type);
                        if (pc.remoteDescription.type === "offer") {
                            console.log("createAnswer");
                            pc.createAnswer()
                                .then((answer) => {
                                    pc.setLocalDescription(
                                        answer,
                                        () => {
                                            _sendMessage({ sdp: pc.localDescription });
                                        },
                                        _onError
                                    );
                                })
                                .catch(_onError);
                        }
                    },
                    this.onError
                );
            } else if (message.candidate) {
                console.log("candidate消息：", message);
                // 增加新的 ICE canidatet 到本地的链接中
                pc.addIceCandidate(new RTCIceCandidate(message.candidate));
            }
        });
    });
}

function _startWebRTC(isOffer) {
    const iceServer = {
        iceServers: [
            {
                urls: "stun:stun.l.google.com:19302",
            },
        ],
    };
    console.log("startWebRTC, connect to stun server");

    pc = new RTCPeerConnection(iceServer);
    pc.onicecandidate = function(evt) {
        if (evt.candidate) {
            console.log(">>>>>> onicecandidate");
            _sendMessage({ candidate: evt.candidate });
        }
    };

    pc.ontrack = function(evt) {
        console.log(">>>>>> ontrack");
        onAddStream(evt.streams[0]);
        return false;
    };
    if (isOffer) {
        pc.onnegotiationneeded = async () => {
            console.log(">>> onnegotiationneeded");
            let sdp = await pc.createOffer();
            await pc.setLocalDescription(sdp);
            _sendMessage({ sdp: pc.localDescription });
        };
    }
}

function _sendMessage(message) {
    socket.publish({
        room: _roomName,
        message,
    });
}

function _onError(error) {
    console.log(error);
}

function close() {
    socket.close();
}

async function join() {
    if (pc) {
        let sdp = await pc.createOffer();
        await pc.setLocalDescription(sdp);
        _sendMessage({ sdp: pc.localDescription });
    }
}

export default {
    initSocket,
    addListenerForAddStream,
    addStream,
    close,
    join
};
