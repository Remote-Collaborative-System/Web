import { isDraw } from "./mark.js"
import { localVideo } from "./video connection.js";
import { modelCanvas } from "./model manager.js";

var remoteVideo = localVideo

// 定义画笔和控制绘画的布尔量
let brush, drawing;

export var drawCanvas;

export function initDrawingCanvas() {
    // 创建用于 draw 的 canvas
    drawCanvas = document.createElement('canvas');
    drawCanvas.id="draw-canvas";
    // 将 drawCanvas 添加到 video 元素下，使其与 video 元素重叠
    remoteVideo.parentNode.insertBefore(drawCanvas, remoteVideo.nextSibling);
    // 设置 drawCanvas 的大小为 video 元素的大小
    drawCanvas.width = remoteVideo.clientWidth;
    drawCanvas.height = remoteVideo.clientHeight;
    let rect = remoteVideo.getBoundingClientRect();
    drawCanvas.style.position = "absolute";
    drawCanvas.style.top = rect.top + "px";
    drawCanvas.style.left = rect.left + "px";
}

export function initDrawing() {
    modelCanvas.style.pointerEvents = 'none';
    drawCanvas.style.pointerEvents = 'auto';

    // 画刷标记相关代码
    brush = drawCanvas.getContext('2d');
    console.log(drawCanvas)
    console.log(brush)
    // 设置画笔颜色和宽度
    brush.strokeStyle = 'red';
    brush.lineWidth = 50;

    drawCanvas.addEventListener("mousedown", startDrawing);
    drawCanvas.addEventListener("mousemove", inDrawing);
    drawCanvas.addEventListener("mouseup", stopDrawing);
}

export function closeDrawing() {
    drawCanvas.removeEventListener("mousedown", startDrawing);
    drawCanvas.removeEventListener("mousemove", inDrawing);
    drawCanvas.removeEventListener("mouseup", stopDrawing);
}

function startDrawing(event) {
    console.log("成功点击drawCanvas")
    drawing = true;
    brush.beginPath();
    brush.moveTo(event.clientX - drawCanvas.offsetLeft, event.clientY - drawCanvas.offsetTop);
}

function inDrawing(event) {
    if (!drawing) return;
    brush.lineTo(event.clientX - drawCanvas.offsetLeft, event.clientY - drawCanvas.offsetTop);
    brush.stroke();


}

function stopDrawing() {
    drawing = false;
}




  