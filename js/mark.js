import { sendMessage, MessageType, refresh } from "./video connection.js";
import { initModelCanvas, modelCanvas, initMarking, loadModel, removeModel, getModelData } from "./model manager.js";
import { initDrawingCanvas, initDrawing, closeDrawing, getDrawingData } from "./drawing manager.js";

var btnMark = document.querySelector('button#mark');
var btnDraw = document.querySelector('button#draw');
// var btnFinishMark = document.querySelector('button#finish-mark');
// var btnFinishDraw = document.querySelector('button#finish-draw');
var btnFinish = document.querySelector('button#finish');
var btnCancel = document.querySelector('button#cancel');

// 确认是否开始mark和draw
export let isMark = false;
export let isDraw = false;

// let amend_x = 65.49;
// let amend_y = 116.94;
let amend_x = 0;
let amend_y = 0;

//Mark按钮的点击事件
btnMark.addEventListener("click", function () {
  isMark = true;
  isDraw = false;
  initMarking(isMark);

  // 发送-1给远程端，要求暂停画面
  sendMarkingMessage(getModelData(true));
});

//Draw按钮的点击事件
btnDraw.addEventListener("click", function () {
  console.log("click Draw")
  //初始化Drawing的控制事件
  initDrawing();
  isDraw = true;
  isMark = false;
  // 发送-1给远程端，要求暂停画面
  sendDrawingMessage(getDrawingData(isDraw, true));

});

//Finish按钮的点击事件
btnFinish.addEventListener("click", function () {
  if (isDraw) {
    isDraw = false;
    // 发送坐标数据给远程端
    sendDrawingMessage(getDrawingData(isDraw, true));

    //关闭Drawing的控制事件
    closeDrawing();
  }
  if (isMark) {
    isMark = false;

    // 发送坐标数据给远程端
    sendMarkingMessage(getModelData(true));

    //移除模型
    removeModel();
  }
})

//Cancel按钮的点击事件
btnCancel.addEventListener("click", function () {
  if (isDraw) {
    isDraw = false;
    // 发送坐标数据给远程端
    sendDrawingMessage(getDrawingData(isDraw, false));

    //关闭Drawing的控制事件
    closeDrawing();
  }
  if (isMark) {
    isMark = false;

    // 发送坐标数据给远程端
    sendMarkingMessage(getModelData(false));

    //移除模型
    removeModel();
  }
})
// //FinishMark按钮的点击事件
// btnFinishMark.addEventListener("click", function () {
//   isMark = false;

//   // 发送坐标数据给远程端
//   sendMarkingMessage(getModelData());

//   //移除模型
//   removeModel();
// });

// //FinishDraw按钮的点击事件
// btnFinishDraw.addEventListener("click", function () {
//   isDraw = false;
//   // 发送坐标数据给远程端
//   sendDrawingMessage(getDrawingData(isDraw));

//   //关闭Drawing的控制事件
//   closeDrawing();
// });

document.body.addEventListener('click', function (event) {
  if (event.target.id === 'connserver') {
    console.log("点击connserver");
    // 初始化 Three.js 场景,同时加载 mark 所需的 Canvas
    initDrawingCanvas();
    initModelCanvas();
    refresh();
    // 在这里处理 canvas 的点击事件
    modelCanvas.addEventListener("click", function (event) {
      if (isMark) {
        // 获取屏幕点击信息
        let rect = modelCanvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;

        //加载模型
        loadModel(event, [x, y], isMark);
      }
      if (isDraw) {

      }
    });
  }
});


function sendMarkingMessage(modelData) {
  var position = modelData.position;
  var scale = modelData.scale;
  var rotation = modelData.rotation;

  var message = {
    MessageType: MessageType.Model,
    Data: {
      position: {
        x: position.x + amend_x,
        y: position.y + amend_y
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

function sendDrawingMessage(imageData) {
  var message = {
    MessageType: MessageType.Draw,
    Data: {
      imagedata: imageData,
      amend: {
        x: amend_x+20,
        y: amend_y
      }
    }
  }
  sendMessage(message);
}

