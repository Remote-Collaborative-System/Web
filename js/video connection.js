'use strict'

var localVideo = document.getElementById('local-video');
export var remoteVideo = document.getElementById('remote-video');

// 通过ID获取现有的div元素
var divElement = document.getElementById('remote-video-div');
// 定义视频URL
var videoUrl = 'https://192.168.3.65/api/holographic/stream/live_high.mp4?holo=true&pv=true&mic=true&loopback=true&RenderFromCamera=true';


var btnConn = document.getElementById('connserver');
var btnLeave = document.getElementById('leave');
var btnRefresh = document.getElementById('refresh');

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
        url: "http://192.168.3.35:3000/data/" + remotePeerId,
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
        url: "http://192.168.3.35:3000/data/" + localPeerId,
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
    // 检查视频元素是否存在
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

export function refresh() {
    // 检查视频元素是否存在
    var videoElement = divElement.querySelector('video#remote-video');
    if (videoElement) {
        // 如果视频元素存在，删除它
        divElement.removeChild(videoElement);
    }
    // 如果视频元素不存在，创建并添加新的视频元素
    videoElement = document.createElement('video');
    videoElement.id = "remote-video";
    videoElement.width = 1440;
    videoElement.height = 936;
    videoElement.style.pointerEvents = 'none';
    // 获取 remoteVideo 的位置信息
    let rect = remoteVideo.getBoundingClientRect();
    videoElement.style.position = "absolute";
    // 设置 videoElement 的 CSS 样式
    videoElement.style.zIndex = '-1'; // 将其设置为负数
    videoElement.style.top = rect.top + "px";
    videoElement.style.left = rect.left + "px";
    videoElement.autoplay = "";

    var sourceElement = document.createElement('source');
    sourceElement.src = videoUrl;
    sourceElement.type = 'video/mp4';

    videoElement.appendChild(sourceElement);
    divElement.appendChild(videoElement);

    videoElement.play();
}

btnConn.onclick = start;
btnLeave.onclick = leave;
// btnRefresh.onclick = refresh;
