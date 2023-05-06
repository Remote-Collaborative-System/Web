import { sendMessage, MessageType } from "./video connection.js";
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118.3/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.118.3/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.3/examples/jsm/loaders/GLTFLoader.js';

var remoteVideo = document.querySelector('video#local-video');

var btnMark = document.querySelector('button#mark');
var btnFinishMark = document.querySelector('button#finish-mark');

let scene, camera, renderer, controls, model;
var mouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();

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

  // 添加 OrbitControls 以支持拖拽、滑动和滚轮调整
  // OrbitControls 需要一个相机和一个 DOM 元素作为参数
  controls = new OrbitControls(camera, renderer.domElement);
  //是否开启右键拖拽
  controls.enablePan = true;

  // 获取 remoteVideo 的位置信息
  let rect = remoteVideo.getBoundingClientRect();

  // 将相机位置和远端视频位置重合
  camera.position.set(0, 0, 0);
  camera.lookAt(0, 0, 1);
  camera.position.z = 2;
  camera.position.x = (remoteVideo.clientWidth / 2 - rect.left - remoteVideo.clientLeft) / (remoteVideo.clientWidth / 2);
  camera.position.y = -(remoteVideo.clientHeight / 2 - rect.top - remoteVideo.clientTop) / (remoteVideo.clientHeight / 2);

  // 将渲染器位置和远端视频位置重合
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = rect.top + "px";
  renderer.domElement.style.left = rect.left + "px";

  // 开始动画循环
  animate();
  console.log('Finish init!')
}

//Mark按钮的点击事件
btnMark.addEventListener("click", function () {
  // 发送-1给远程端，要求暂停画面
  var position = {
    MessageType: MessageType.Position,
    Data: -1 + ',' + -1,
    DataSeparator: ','
  }
  sendMessage(position)

  //给remoteVideo添加点击事件
  remoteVideo.addEventListener("click", onMouseClick);
});

//FinishMark按钮的点击事件
btnFinishMark.addEventListener("click", function () {
  if (!model) return;

  //给remoteVideo移除点击事件
  remoteVideo.removeEventListener("click", onMouseClick);

  const position = model.position;
  const rotation = model.rotation;
  const scale = model.scale;

  console.log(`
      Position: x=${position.x.toFixed(2)}, y=${position.y.toFixed(2)}, z=${position.z.toFixed(2)}<br>
      Rotation: x=${rotation.x.toFixed(2)}, y=${rotation.y.toFixed(2)}, z=${rotation.z.toFixed(2)}<br>
      Scale: x=${scale.x.toFixed(2)}, y=${scale.y.toFixed(2)}, z=${scale.z.toFixed(2)}
    `);
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
  var position = {
    MessageType: MessageType.Position,
    Data: x + ',' + y,
    DataSeparator: ','
  }
  sendMessage(position)

  // 添加模型
  event.preventDefault();

  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  let intersects = raycaster.intersectObjects(scene.children, true);

  if (model) {
    scene.remove(model);
  }

  // 添加 GLTFLoader 以加载模型
  const gltfLoader = new GLTFLoader();
  gltfLoader.load("3d model/demo.gltf", function (gltf) {
    model = gltf.scene;

    if (intersects.length > 0) {
      model.position.copy(intersects[0].point);
    }

    scene.add(model);
  });
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

