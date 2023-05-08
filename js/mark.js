import { sendMessage, MessageType } from "./video connection.js";
import { loadModel, removeModel } from "./model manager.js";

var remoteVideo = document.querySelector('video#local-video');

var btnMark = document.querySelector('button#mark');
var btnFinishMark = document.querySelector('button#finish-mark');

//Mark按钮的点击事件
btnMark.addEventListener("click", function () {
  // 发送-1给远程端，要求暂停画面
  sendModelMessage([-1, -1]);

  //给remoteVideo添加点击事件
  remoteVideo.addEventListener("click", onMouseClick);
});

//remoteVideo的点击事件
function onMouseClick(event) {
  // 获取屏幕点击信息
  console.log("x坐标: " + event.clientX);
  console.log("y坐标: " + event.clientY);
  let rect = remoteVideo.getBoundingClientRect();
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;
  console.log("相对于矩形的x坐标: " + (event.clientX - rect.left));
  console.log("相对于矩形的y坐标: " + (event.clientY - rect.top));

  // 发送坐标数据给远程端
  sendModelMessage([x, y]);

  //加载模型
  loadModel(event);
}

//FinishMark按钮的点击事件
btnFinishMark.addEventListener("click", function () {

  //给remoteVideo移除点击事件
  remoteVideo.removeEventListener("click", onMouseClick);

  //移除模型
  removeModel();

});

function sendModelMessage([x, y]) {
  var position = {
    MessageType: MessageType.Position,
    Data: x + ',' + y,
    DataSeparator: ','
  };
  sendMessage(position);
}


