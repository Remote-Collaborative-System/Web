import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118.3/build/three.module.js";
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.3/examples/jsm/loaders/GLTFLoader.js';
import { TransformControls } from 'https://cdn.jsdelivr.net/npm/three@0.118.3/examples/jsm/controls/TransformControls.js';
import { isMark } from "./mark.js"
import { remoteVideo } from "./video connection.js";
import { drawCanvas } from "./drawing manager.js";
import { selectedColor } from "./color manager.js";

// var remoteVideo = localVideo

// 定义场景、相机、渲染器、模型控制器、动画和时间
let scene, camera, renderer, controls, mixer, clock;

// 定义模型和模型所在的画布
export var model, modelCanvas;

export function initModelCanvas() {
    // 创建一个新的 Three.js 场景
    scene = new THREE.Scene();

    // 添加全局环境光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    // 添加定向光源
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);

    // 创建一个透视摄像机，设置视角、纵横比、近剪切面和远剪切面
    camera = new THREE.PerspectiveCamera(75, remoteVideo.clientWidth / remoteVideo.clientHeight, 0.1, 1000);
    // 设置相机位置
    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, -1);
    camera.position.z = 5;

    // 创建 WebGL 渲染器，启用 alpha（透明度）和抗锯齿
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    // 将 renderer 的 canvas 添加到 video 元素下，使其与 video 元素重叠
    modelCanvas = renderer.domElement;
    remoteVideo.parentNode.insertBefore(modelCanvas, remoteVideo.nextSibling);
    // 设置渲染器的大小为 video 元素的大小
    renderer.setSize(remoteVideo.clientWidth, remoteVideo.clientHeight);
    modelCanvas.id = "model-canvas";
    // 将渲染器位置和远端视频位置重合
    // 获取 remoteVideo 的位置信息
    let rect = remoteVideo.getBoundingClientRect();
    modelCanvas.style.position = "absolute";
    modelCanvas.style.top = rect.top + "px";
    modelCanvas.style.left = rect.left + "px";

    clock = new THREE.Clock();

    // 开始动画循环
    animate();
    console.log('Finish init!')
}

// 箭头标记相关代码
export function initMarking() {
    drawCanvas.style.pointerEvents = 'none';
    modelCanvas.style.pointerEvents = 'auto';
    modelCanvas.addEventListener("mouseenter", onMouseEvent);
    modelCanvas.addEventListener("mouseleave", onMouseEvent);
}

export function loadModel(event, [x, y]) {
    if (model) return console.log('已有模型');
    //阻止默认的鼠标点击事件
    event.preventDefault();

    // 添加 GLTFLoader 以加载模型
    const gltfLoader = new GLTFLoader();
    gltfLoader.load("3d model/twist.gltf", function (gltf) {
        model = gltf.scene;

        // 设置模型的位置
        model.position.copy(setModelPosition([x, y]));

        // 设置模型的颜色
        model.traverse((o) => {
            if (o.isMesh) {
                o.material.color.setStyle(selectedColor);
            }
        });

        // 播放动画
        mixer = new THREE.AnimationMixer(model);
        const clips = gltf.animations;
        mixer.clipAction(clips[0]).play();

        // 创建 TransformControls 对象
        controls = new TransformControls(camera, modelCanvas);

        // 为模型添加控制器
        controls.attach(model);
        controls.setMode('rotate');
        modelCanvas.addEventListener("mousedown", onMouseEvent);
        modelCanvas.addEventListener("wheel", onMouseEvent);
        modelCanvas.addEventListener("contextmenu", onMouseEvent);

        // 将 controls 添加到场景中
        scene.add(controls);
        scene.add(model);
        console.log("成功生成模型！");

    }, undefined, function (error) {
        console.error(error);
    });
}

export function removeModel() {
    // 从场景中删除模型对象和控制器
    scene.remove(model);
    scene.remove(controls);
    model = null;
    controls = null;
    console.log("成功移除模型！");
}

// 计算模型在世界坐标系中的位置
function setModelPosition([screenX, screenY]) {
    // 将屏幕坐标转换为归一化设备坐标
    //在 WebGL 中，归一化设备坐标系的原点位于屏幕中心，Y 轴向上为正方向。而在屏幕坐标系中，原点位于屏幕左上角，Y 轴向下为正方向。
    //在将归一化的 Y 坐标转换为屏幕 Y 坐标时，需要加上负号来翻转 Y 坐标的正负值，以便正确地将坐标从 WebGL 的坐标系转换为屏幕坐标系。

    var normalizedX = (screenX / remoteVideo.clientWidth) * 2 - 1;
    var normalizedY = -(screenY / remoteVideo.clientHeight) * 2 + 1;

    // 计算摄像机空间中的 x 和 y 坐标
    var cameraFov = 75;
    var cameraHeight = 2 * Math.tan((cameraFov / 2) * (Math.PI / 180)) * camera.position.z;
    var cameraWidth = cameraHeight * (remoteVideo.clientWidth / remoteVideo.clientHeight);

    var modelX = normalizedX * cameraWidth / 2;
    var modelY = normalizedY * cameraHeight / 2;

    return new THREE.Vector3(modelX, modelY, 0);
}

// 将模型坐标转换为摄像机空间中的坐标
function setScreenPostion([modelX, modelY]) {
    // 计算摄像机空间中的归一化 x 和 y 坐标
    var cameraFov = 75;
    var cameraHeight = 2 * Math.tan((cameraFov / 2) * (Math.PI / 180)) * camera.position.z;
    var cameraWidth = cameraHeight * (remoteVideo.clientWidth / remoteVideo.clientHeight);

    var normalizedX = modelX * 2 / cameraWidth;
    var normalizedY = modelY * 2 / cameraHeight;

    // 将归一化设备坐标转换为屏幕坐标
    var screenX = (normalizedX + 1) / 2 * remoteVideo.clientWidth;
    var screenY = (-normalizedY + 1) / 2 * remoteVideo.clientHeight;

    return new THREE.Vector2(screenX, screenY);
}

export function getModelData(isSend) {
    if(isSend){
        if (!model) {
            console.log('No model loaded.');
            return {
                position: { x: -1, y: 0 },
                scale: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 }
            };
        }
    
        const position = setScreenPostion([model.position.x, model.position.y]);
        const scale = model.scale;
        const rotation = model.rotation;
    
        return {
            position: { x: position.x, y: position.y },
            scale: { x: scale.x, y: scale.y, z: scale.z },
            rotation: { x: rotation.x, y: rotation.y, z: rotation.z }
        };
    }
    else{
        return {
            position: { x: 1, y: 0 },
            scale: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 }
        };
    }
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    // 反复循环动画
    if (mixer) {
        const delta = clock.getDelta();
        mixer.update(delta);
    }
}

function onMouseEvent(event) {
    if (isMark) {
        switch (event.type) {
            case "mousedown":
                if (event.detail === 2) {
                    // 双击时切换回旋转模式
                    controls.setMode("rotate");
                    //显示z轴
                    controls.showZ = true;
                } else {
                    switch (event.button) {
                        case 2: // 右键
                            // 切换到平移模式
                            controls.setMode("translate");
                            //隐藏z轴
                            controls.showZ = false;
                            break;
                        default:
                            break;
                    }
                }
                break;
            case "wheel":
                // 切换到缩放模式
                controls.setMode("scale");
                //显示z轴
                controls.showZ = true;

                // 根据滚轮方向调整模型的缩放
                const scaleFactor = 1.0 + (event.deltaY > 0 ? -0.1 : 0.1);
                model.scale.multiplyScalar(scaleFactor);
                event.preventDefault();
                break;
            case "contextmenu":
                event.preventDefault();
                break;
            case "mouseenter":
                //更变鼠标样式
                document.body.style.cursor = 'pointer';
                break;
            case "mouseleave":
                //更变鼠标样式
                document.body.style.cursor = 'default';
                break;
            default:
                break;
        }
    }
}

