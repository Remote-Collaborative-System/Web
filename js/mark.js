import { sendMessage, MessageType } from "./video connection.js";
import { loadModel, removeModel, getModelData } from "./model manager.js";

var remoteVideo = document.querySelector('video#remote-video');

var btnMark = document.querySelector('button#mark');
var btnFinishMark = document.querySelector('button#finish-mark');

//Mark按钮的点击事件
btnMark.addEventListener("click", function () {
  // 发送-1给远程端，要求暂停画面
  sendModelMessage(getModelData());

  //给remoteVideo添加点击事件
  remoteVideo.addEventListener("click", onMouseClick);
});

//remoteVideo的点击事件
function onMouseClick(event) {
  // 获取屏幕点击信息
  let rect = remoteVideo.getBoundingClientRect();
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;

  //加载模型
  loadModel(event, [x, y]);
}

//FinishMark按钮的点击事件
btnFinishMark.addEventListener("click", function () {

  //给remoteVideo移除点击事件
  remoteVideo.removeEventListener("click", onMouseClick);

  // 发送坐标数据给远程端
  sendModelMessage(getModelData());

  //移除模型
  removeModel();
});

function sendModelMessage(modelData) {
  var position = modelData.position;
  var scale = modelData.scale;
  var rotation = modelData.rotation;

  var message = {
    MessageType: MessageType.Model,
    Data: {
      position: {
        x: position.x,
        y: position.y
      },
      scale: {
        x: scale.x,
        y: scale.y,
        z: scale.z
      },
      rotation: {
        x: rotation.x,
        y: rotation.y,
        z: rotation.z
      }
    }
  };
  sendMessage(message);
}


