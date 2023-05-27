import { sendMessage, MessageType } from "./video connection.js";
import { selectedColor } from "./color manager.js"
import { initModelCanvas, modelCanvas, initMarking, loadModel, refreshModel, removeModel, getModelData } from "./model manager.js";
import { initDrawingCanvas, initDrawing, closeDrawing, getDrawingData } from "./drawing manager.js";

var btnMark = document.getElementById('mark');
var btnDraw = document.getElementById('draw');
// var btnFinishMark = document.querySelector('button#finish-mark');
// var btnFinishDraw = document.querySelector('button#finish-draw');
var btnFinish = document.getElementById('finish');
var btnCancel = document.getElementById('cancel');

// 确认是否开始mark和draw
export let isMark = false;
export let isDraw = false;

const markTypeArray = ["静态标记.gltf", "拧动标记1.gltf", "拧动标记2.gltf", "拉动标记1.gltf", "拉动标记2.gltf", "转动标记1.gltf", "转动标记2.gltf", "掰动标记1.gltf", "掰动标记2.gltf",];

let modelTypeIndex = 0;

document.getElementById('mark1').addEventListener('click', function () {
  if (isMark === false) {
    isMark = true;
    // 发送-1给远程端，要求暂停画面
    sendMarkingMessage(getModelData(true));
  }
  modelTypeIndex = 0
  refreshModel("3d model/" + markTypeArray[modelTypeIndex]);
});

document.getElementById('mark2').addEventListener('click', function () {
  if (isMark === false) {
    isMark = true;
    // 发送-1给远程端，要求暂停画面
    sendMarkingMessage(getModelData(true));
  }
  modelTypeIndex = 1;
  refreshModel("3d model/" + markTypeArray[modelTypeIndex]);
});

document.getElementById('mark3').addEventListener('click', function () {
  if (isMark === false) {
    isMark = true;
    // 发送-1给远程端，要求暂停画面
    sendMarkingMessage(getModelData(true));
  }
  modelTypeIndex = 3;
  refreshModel("3d model/" + markTypeArray[modelTypeIndex]);
});

document.getElementById('mark4').addEventListener('click', function () {
  if (isMark === false) {
    isMark = true;
    // 发送-1给远程端，要求暂停画面
    sendMarkingMessage(getModelData(true));
  }
  modelTypeIndex = 5;
  refreshModel("3d model/" + markTypeArray[modelTypeIndex]);
});

document.getElementById('mark5').addEventListener('click', function () {
  if (isMark === false) {
    isMark = true;
    // 发送-1给远程端，要求暂停画面
    sendMarkingMessage(getModelData(true));
  }
  modelTypeIndex = 7;
  refreshModel("3d model/" + markTypeArray[modelTypeIndex]);
});

document.getElementById('transform1').addEventListener('click', function () {
  if (modelTypeIndex !== 0 && modelTypeIndex % 2 !== 0) {
    modelTypeIndex++;
    refreshModel("3d model/" + markTypeArray[modelTypeIndex]);
  }
  else if (modelTypeIndex !== 0 && modelTypeIndex % 2 === 0) {
    modelTypeIndex--;
    refreshModel("3d model/" + markTypeArray[modelTypeIndex]);
  }

});

document.getElementById('transform2').addEventListener('click', function () {
  if (modelTypeIndex !== 0 && modelTypeIndex % 2 !== 0) {
    modelTypeIndex++;
    refreshModel("3d model/" + markTypeArray[modelTypeIndex]);
  }
  else if (modelTypeIndex !== 0 && modelTypeIndex % 2 === 0) {
    modelTypeIndex--;
    refreshModel("3d model/" + markTypeArray[modelTypeIndex]);
  }
});


// let amend_x = 65.49;
// let amend_y = 116.94;
let amend_x = 0;
let amend_y = 0;

//Mark按钮的点击事件
//点击Mark再点击具体要Mark的种类
btnMark.addEventListener("click", function () {
  isMark = true;
  isDraw = false;
  initMarking(isMark);
  modelTypeIndex = 0;
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

// document.body.addEventListener('click', function (event) {
//   if (event.target.id === 'connserver') {
//     console.log("点击connserver");

//     });
//   }
// });


function sendMarkingMessage(modelData) {
  var position = modelData.position;
  var scale = modelData.scale;
  var rotation = modelData.rotation;

  var message = {
    MessageType: MessageType.Model,
    Data: {
      type: modelTypeIndex,
      color: selectedColor,
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
        x: amend_x,
        y: amend_y
      }
    }
  }
  sendMessage(message);
}

// 初始化 Three.js 场景,同时加载 mark 所需的 Canvas
initDrawingCanvas();
initModelCanvas();
// refresh();
// 在这里处理 canvas 的点击事件
modelCanvas.addEventListener("click", function (event) {
  if (isMark) {
    // 获取屏幕点击信息
    let rect = modelCanvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    //加载模型
    loadModel(event, [x, y], "3d model/" + markTypeArray[modelTypeIndex]);
  }
  if (isDraw) {

  }
});