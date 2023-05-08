import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118.3/build/three.module.js";
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.3/examples/jsm/loaders/GLTFLoader.js';
import { TransformControls } from 'https://cdn.jsdelivr.net/npm/three@0.118.3/examples/jsm/controls/TransformControls.js';


var remoteVideo = document.querySelector('video#local-video');

// 定义场景、相机、渲染器、模型控制器和模型对象
let scene, camera, renderer, controls, model;

// 初始化 Three.js 场景
init();

function init() {
    // 创建一个新的 Three.js 场景
    scene = new THREE.Scene();

    // 创建一个透视摄像机，设置视角、纵横比、近剪切面和远剪切面
    camera = new THREE.PerspectiveCamera(75, remoteVideo.clientWidth / remoteVideo.clientHeight, 0.1, 1000);

    // 创建 WebGL 渲染器，启用 alpha（透明度）和抗锯齿
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    // 设置渲染器的大小为 video 元素的大小
    renderer.setSize(remoteVideo.clientWidth, remoteVideo.clientHeight);

    // 将 renderer 的 canvas 添加到 video 元素下，使其与 video 元素重叠
    remoteVideo.parentNode.insertBefore(renderer.domElement, remoteVideo.nextSibling);

    // 获取 remoteVideo 的位置信息
    let rect = remoteVideo.getBoundingClientRect();

    // 设置相机位置
    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, -1);
    camera.position.z = 5;

    // 将渲染器位置和远端视频位置重合
    renderer.domElement.style.pointerEvents = "none";
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = rect.top + "px";
    renderer.domElement.style.left = rect.left + "px";

    // 开始动画循环
    animate();
    console.log('Finish init!')
}

export function loadModel(event) {
    //阻止默认的鼠标点击事件
    event.preventDefault();

    //开启renderer.domElement点击事件
    renderer.domElement.style.pointerEvents = "auto";

    // 添加 GLTFLoader 以加载模型
    const gltfLoader = new GLTFLoader();
    gltfLoader.load("3d model/demo.gltf", function (gltf) {
        model = gltf.scene;

        // 创建 TransformControls 对象
        controls = new TransformControls(camera, renderer.domElement);

        // 附加到模型
        controls.attach(model);
        controls.setMode('rotate');//旋转
        renderer.domElement.addEventListener("mousedown", onMouseEvent);
        renderer.domElement.addEventListener("wheel", onMouseEvent);
        renderer.domElement.addEventListener("contextmenu", onMouseEvent);


        // 将 controls 添加到场景中
        scene.add(controls);
        scene.add(model);
        console.log("成功生成模型！");
    }, undefined, function (error) {
        console.error(error);
    });
}

export function removeModel() {
    // 遍历场景中的所有子对象
    scene.remove(model); // 从场景中删除模型对象
    model = null; // 将模型对象赋值为 null，释放内存

    //关闭renderer.domElement点击事件
    renderer.domElement.style.pointerEvents = "none";
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function onMouseEvent(event) {
    if (!controls || !model) return;
  
    switch (event.type) {
      case "mousedown":
        if (event.detail === 2) {
          // 双击时切换回旋转模式
          controls.setMode("rotate");
        } else {
          switch (event.button) {
            case 2: // 右键
              // 切换到平移模式
              controls.setMode("translate");
              break;
            default:
              break;
          }
        }
        break;
      case "wheel":
        // 切换到缩放模式
        controls.setMode("scale");
  
        // 根据滚轮方向调整模型的缩放
        const scaleFactor = 1.0 + (event.deltaY > 0 ? -0.1 : 0.1);
        model.scale.multiplyScalar(scaleFactor);
        event.preventDefault();
        break;
      case "contextmenu":
        event.preventDefault();
        break;
      default:
        break;
    }
  }
  