'use strict'
export var localVideo = document.querySelector('video#local-video');
var remoteVideo = document.querySelector('video#remote-video');

var btnConn = document.querySelector('button#connserver');
var btnLeave = document.querySelector('button#leave');

var localStream;

var localPeerId = 'Web'
var remotePeerId = 'Hololens2'
var pc = null;

var timer = null

export var MessageType = {
    Offer: 1,
    Answer: 2,
    IceCandidate: 3,
    Model: 4,
    Draw: 5
}

// 发送消息
export function sendMessage(data) {
    console.log('send p2p message', JSON.stringify(data));
    $.ajax({
        url: "http://127.0.0.1:3000/data/" + remotePeerId,
        type: "POST",
        data: JSON.stringify(data),
        error: (err) => { console.log(err) }
    })
}

// 处理要发送的消息
function processSenderMessage(data) {
    // offer
    if (data.type === 'offer') {
        // 
    }
    // answer
    else if (data.type === 'answer') {
        var answer = {
            MessageType: MessageType.Answer,
            Data: data.sdp,
            IceDataSeparator: ''
        }
        sendMessage(answer)
    }
    // ice candidate
    else if (data.type === 'candidate') {
        var content = data.candidate.candidate
        var sdpMLineIndex = data.candidate.sdpMLineIndex
        var sdpMid = data.candidate.sdpMid
        var iceCandidate = {
            MessageType: MessageType.IceCandidate,
            Data: content + '|' + sdpMLineIndex + '|' + sdpMid,
            IceDataSeparator: '|'
        }
        sendMessage(iceCandidate)

    } else {
        console.log('invalid message')
    }
}

// 不断向信令服务器轮询消息
function getMessage() {
    $.ajax({
        url: "http://127.0.0.1:3000/data/" + localPeerId,
        type: "GET",
        success: (data) => {
            if (data) {
                data = JSON.parse(data)
                console.log(data)
                processReceiverMessage(data)
            }
        },
        error: (err) => { console.log(err) }
    })
}

// 处理接收到的消息
function processReceiverMessage(data) {
    // offer
    if (data.MessageType === 1) {
        pc.signal({
            type: 'offer',
            sdp: data.Data
        })
    }
    // answer, 实际上在这个客户端不会收到answer
    // 因为HoloLens是发起方, 所以客户端只会收到offer
    else if (data.MessageType === 2) {
        //
    }
    // ice candidate
    else if (data.MessageType === 3) {
        var parts = data.Data.split(data.IceDataSeparator)
        var iceCandidate = {
            type: 'candidate',
            candidate: {
                candidate: parts[0],
                sdpMLineIndex: Number(parts[1]),
                sdpMid: parts[2]
            }
        }
        pc.signal(iceCandidate)
    } else {
        console.log('invalid message')
    }
}

// 创建对等连接
function createPeerConnection() {
    console.log('create simple peer!');
    if (!pc) {
        // 配置 NAT 穿透服务器，可以使用公开免费的一些ice服务器资源
        var pcConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
            ]
        }

        // 接收远端视频和音频
        var offerOptions = {
            offerToRecieveAudio: 1,
            offerToRecieveVideo: 1
        }

        // 创建 SimplePeer 对象
        pc = new SimplePeer({
            initiator: false,
            config: pcConfig,
            offerOptions: offerOptions,
            stream: localStream,
            trickle: true //优化属性可以自动去寻找一个好的网络
        });

        // 当接收到信号
        pc.on('signal', data => {
            processSenderMessage(data)
        });

        // 当获取到媒体流
        pc.on('stream', stream => {
            console.log(stream)
            remoteVideo.srcObject = stream;
        });

        // 当发生error
        pc.on('error', err => {
            console.log(err);
            closePeerConnection();
        })
    }
}

// 点击 start 按钮的响应事件
function start() {
    // // 如果对等连接不存在，创建对等连接
    // !pc && createPeerConnection();
    // btnConn.disabled = true;
    // btnLeave.disabled = false;

    // // 开始向信令服务器轮询消息
    // timer = setInterval(getMessage, 500)

    //获取本地音视频流
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('the getUserMedia is not supported!');
        return;
    } else {
        var constraints = {
            video: true,
            audio: true
        }
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                localStream = stream;
                localVideo.srcObject = stream;

                // 如果对等连接不存在，创建对等连接
                !pc && createPeerConnection();
                btnConn.disabled = true;
                btnLeave.disabled = false;

                // 开始向信令服务器轮询消息
                timer = setInterval(getMessage, 500)
            })
            .catch(err => console.error('Failed to get Media Stream!', err));
    }
}

// 关闭本地媒体流
function closeLocalMedia() {
    if (localStream && localStream.getTracks()) {
        localStream.getTracks().forEach((track) => {
            track.stop();
        })
    }
    localStream = null;
}

// 关闭 PeerConnection
function closePeerConnection() {
    console.log('close simple peer!');
    if (pc) {
        pc.destroy();
        pc = null;
    }
}

// 点击 leave 按钮的响应事件
function leave() {
    btnConn.disabled = false;
    btnLeave.disabled = true;
    closePeerConnection();
    closeLocalMedia();
}

btnConn.onclick = start;
btnLeave.onclick = leave;