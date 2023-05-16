import {brush, previewBrush} from "./drawing manager.js"
import {model} from "./model manager.js"
export let selectedColor = '#a5c926'; // 默认颜色

function updateColor(color) {
    selectedColor = color;

    // 更新画笔颜色
    if (brush && previewBrush) {
        brush.strokeStyle = selectedColor;
        previewBrush.fillStyle = selectedColor;
    }

    // 更新模型颜色
    if (model) {
        model.traverse((o) => {
            if (o.isMesh) {
                o.material.color.setStyle(selectedColor);
            }
        });
    }
}

document.getElementById('color1').addEventListener('click', function() {
    updateColor('#a5c926');
});

document.getElementById('color2').addEventListener('click', function() {
    updateColor('#009bfa');
});

document.getElementById('color3').addEventListener('click', function() {
    updateColor('#ffc12c');
});

document.getElementById('color4').addEventListener('click', function() {
    updateColor('#fb416b');
});