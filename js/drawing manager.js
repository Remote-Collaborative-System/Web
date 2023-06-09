import { divElement, remoteVideo } from "./video connection.js";
import { modelCanvas } from "./model manager.js";
import { selectedColor } from "./color manager.js";

// var remoteVideo = localVideo

// 定义画笔和控制绘画的布尔量 以及画布
export let brush, previewBrush, drawCanvas;
let drawing, previewCanvas, rect;

export function initDrawingCanvas() {
    // 创建用于 draw 的 canvas
    if (!drawCanvas) {
        drawCanvas = document.createElement('canvas');
        drawCanvas.id = "draw-canvas";
        // 将 drawCanvas 添加到 video 元素下，使其与 video 元素重叠
        divElement.appendChild(drawCanvas);
        // 设置 drawCanvas 的大小为 video 元素的大小
        rect = remoteVideo.getBoundingClientRect();
        drawCanvas.width = rect.width;
        drawCanvas.height = rect.height;
        // 获取 remoteVideo 的位置信息,并于之重合
        drawCanvas.style.position = "absolute";
        drawCanvas.style.zIndex = '1';
        drawCanvas.style.top = '0';
        drawCanvas.style.left = '0';
        drawCanvas.style.pointerEvents = 'none';
    }

    if (!previewCanvas) {
        // 创建用于预览的 canvas
        previewCanvas = document.createElement('canvas');
        previewCanvas.id = "preview-canvas";
        // 将 previewCanvas 添加到 drawCanvas 元素下，使其与 drawCanvas 元素重叠
        divElement.appendChild(previewCanvas);
        // 设置 previewCanvas 的大小为 drawCanvas 元素的大小
        rect = remoteVideo.getBoundingClientRect();
        previewCanvas.width = rect.width;
        previewCanvas.height = rect.height;
        // 获取 remoteVideo 的位置信息,并于之重合
        previewCanvas.style.position = "absolute";
        previewCanvas.style.zIndex = '1';
        previewCanvas.style.top = '0';
        previewCanvas.style.left = '0';
        previewCanvas.style.pointerEvents = 'none';
    }

}

export function initDrawing() {
    modelCanvas.style.pointerEvents = 'none';
    drawCanvas.style.pointerEvents = 'auto';

    // 画刷标记相关代码
    brush = drawCanvas.getContext('2d');
    console.log(drawCanvas)
    console.log(brush)
    // 设置画笔颜色和宽度
    brush.strokeStyle = selectedColor;
    brush.lineWidth = 8;

    // 设置线条端点和交叉点样式
    brush.lineCap = 'round';    // 线条的结束端点样式为圆形
    brush.lineJoin = 'round';   // 两条线相交时的拐角类型为圆形

    // 创建预览画笔
    previewBrush = previewCanvas.getContext('2d');
    previewBrush.fillStyle = selectedColor;
    previewBrush.lineWidth = brush.lineWidth;

    drawCanvas.addEventListener("mousedown", startDrawing);
    drawCanvas.addEventListener("mousemove", inDrawing);
    drawCanvas.addEventListener("mouseup", stopDrawing);
    drawCanvas.addEventListener("wheel", adjustBrushSize);
    drawCanvas.addEventListener("mousemove", showPreview);
}

export function closeDrawing() {
    drawCanvas.removeEventListener("mousedown", startDrawing);
    drawCanvas.removeEventListener("mousemove", inDrawing);
    drawCanvas.removeEventListener("mouseup", stopDrawing);
    drawCanvas.removeEventListener("wheel", adjustBrushSize);
    drawCanvas.removeEventListener("mousemove", showPreview);
    brush.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
}

function startDrawing(event) {
    console.log("成功点击drawCanvas")
    drawing = true;
    brush.beginPath();
    brush.moveTo(event.clientX - drawCanvas.getBoundingClientRect().left, event.clientY - drawCanvas.getBoundingClientRect().top);
}

function inDrawing(event) {
    if (!drawing) return;
    brush.lineTo(event.clientX - drawCanvas.getBoundingClientRect().left, event.clientY - drawCanvas.getBoundingClientRect().top);
    brush.stroke();
}

function stopDrawing() {
    drawing = false;
}

function adjustBrushSize(event) {
    // 鼠标滚轮向上滚动时增大画笔大小，向下滚动时减小画笔大小
    if (event.deltaY < 0) {
        brush.lineWidth = Math.min(brush.lineWidth + 1, 30);
    } else {
        brush.lineWidth = Math.max(brush.lineWidth - 1, 3);
    }
    // 同时更新预览画笔的大小和颜色
    previewBrush.lineWidth = brush.lineWidth;
    // 更新预览点的大小
    showPreview(event);
    // 阻止浏览器默认的滚轮事件（比如页面滚动）
    event.preventDefault();
}

function showPreview(event) {

    // 清除之前的预览点
    previewBrush.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    // 在当前鼠标位置画上新的预览点
    previewBrush.beginPath();
    previewBrush.arc(event.clientX - previewCanvas.getBoundingClientRect().left, event.clientY - previewCanvas.getBoundingClientRect().top, brush.lineWidth / 2, 0, 2 * Math.PI);
    previewBrush.fill();
}

export function getDrawingData(isDraw, isSend) {
    if (isSend) {
        if (!isDraw) {
            let dataUrl = drawCanvas.toDataURL('image/png', 1); // 第二个参数是质量，范围从0到1
            return dataUrl;
        }
        else {
            return '-1';
        }
    }
    else {
        return '1';
    }

}


