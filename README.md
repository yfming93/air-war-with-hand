# air-war-with-hand

## 手势隔空操控：你没玩过的飞机大战船新版本



飞机大战相信大家都玩过，好多同学甚至自己写过，不管你是用js还是用java，是用原生代码实现还是使用游戏引擎实现。无非就是使用鼠标或者手指触控来在屏幕上拖动飞机移动来打飞机，但我相信你应该还没有玩过使用手势隔空来控制飞机吧。

那今天我们就来开发一款飞机大战游戏，然后使用手势隔空操控飞机。

先上demo： [飞机大战](https://davie.gitee.io/air-war-with-hand)

注意：需要开启电脑摄像头

<img src="https://tva1.sinaimg.cn/large/008eGmZEly1gomxrjfhoqj30hs0fmabw.jpg" alt="image-20210317153114372" style="zoom:50%;" />



### MediaPipe

为了实现手势控制，我们就需要能够通过电脑摄像头来识别手部的动作。这里我们使用到了MediaPip。

MediaPipe 是一款由 Google Research 开发并开源的多媒体机器学习模型应用框架。在谷歌，一系列重要产品，如 、Google Lens、ARCore、Google Home 以及 ，都已深度整合了 MediaPipe。

![dupdvyvdex](https://tva1.sinaimg.cn/large/008eGmZEly1gomxwsjpa6g30tz0kdx6r.gif)

作为一款跨平台框架，MediaPipe 不仅可以被部署在服务器端，更可以在多个移动端 （安卓和苹果 iOS）和嵌入式平台（Google Coral 和树莓派）中作为设备端机器学习推理 （On-device Machine Learning Inference）框架

![image-20210317153803384](https://tva1.sinaimg.cn/large/008eGmZEly1gomxyledq7j30xq0u0diw.jpg)

Media Pip支持使用js实现人脸网格拓扑，人脸检测，手部检测，全身检测和姿势识别等。

![image-20210317154028501](https://tva1.sinaimg.cn/large/008eGmZEly1gomy144j4tj312c0dadhr.jpg)



### 手部识别

为了实现使用手势控制飞机，那么我们需要识别出手部动作。



![hand_tracking_3d_android_gpu](https://tva1.sinaimg.cn/large/008eGmZEly1gomyct1gwzg308c0fokjp.gif)

MediaPip可以识别人手，并且将手部结构按关节进行拓扑，识别结果为保存在两个对象中：

* MULTI_HAND_LANDMARKS：保存了每个手的关节信息

* MULTI_HANDEDNESS：保存多个手部信息，比如是左手还是右手

  

![image-20210317155357354](https://tva1.sinaimg.cn/large/008eGmZEly1gomyf4zbnaj311u0giq8o.jpg)

### 手势控制飞机原理

原理很简单，就是使用摄像头手别手部，MediaPip可以识别手部21个关节，我们可以使用食指尖这个点来控制飞机移动。即下标为8的点：**INDEX_FINGER_TIP**的坐标赋值给飞机。其实就相当于使用食指替代了鼠标。

### 代码实现

好，原理清楚之后，上代码：

创建html文件，引入三个js库：

```js
 <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>
```

index.html

```html
<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>
  <link rel="stylesheet" href="demo.css">

</head>

<body>
  <div class="container">
    <!-- 小飞机 -->
    <img src="./img/hero.png" class="hero" alt="">
    <!-- video用来开启摄像头 -->
    <video class="input_video"></video>
    <!-- 用来绘制识别内容 -->
    <canvas class="output_canvas" width="1280px" height="720px" ></canvas>
    
    <!-- loading 效果，当摄像头开启成功后会隐藏 -->
    <div class="loading">
      <div class="spinner"></div>
      <div class="message">
        Loading
      </div>
    </div>
  </div>

  <script src="./demo.js"></script>
</body>
</html>
```

创建Hands对象：

```js
const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.1/${file}`;
  }
});
```

里面这个file是为了识别手需要加载的资源文件。

设置默认选项：

```javascript
hands.setOptions({
  selfieMode: true, //是否自拍，即是否使用前置摄像头
  maxNumHands: 1,  //最大识别手部数量
  minDetectionConfidence: 0.5,  //识别精度，这个数值越高，则要求图像高评分才能被识别 默认 0.5
  minTrackingConfidence: 0.5 //跟踪速度，数值越高，花费时间越长
});
```

开启摄像头，把摄像头捕捉的画面传给hands对象：

```js
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 1280,
  height: 720
});
camera.start();
```

获取识别结果：

```js

function onResults(results) {
  // 隐藏loading动画
  document.body.classList.add('loaded');

  // Draw the overlays.
  canvasCtx.save();
  // 清空画布
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  // 绘制摄像头捕捉画面
  canvasCtx.drawImage(
    results.image, 0, 0, canvasElement.width, canvasElement.height);

    // 识别结果保存在multiHandLandmarks和multiHandedness对象中，如果这两个对象不为null，则说明识别成功
  if (results.multiHandLandmarks && results.multiHandedness) {
    
    // 遍历multiHandLandmarks，获得每个hand的信息
    for (let index = 0; index < results.multiHandLandmarks.length; index++) {
      const classification = results.multiHandedness[index];
      const isRightHand = classification.label === 'Right';
      // 一个手的关节信息
      const landmarks = results.multiHandLandmarks[index];
      // 下标为8的关节就是食指,坐标值为宽高的百分比，和画布宽高相乘就得到坐标
      let x = landmarks[8].x * 1280;
      let y = landmarks[8].y * 720;

      //把手指坐标赋值非小飞机
      hero.style.left = x - 50 + 'px';
      hero.style.top = y - 40 + 'px';

      // 绘制手部拓扑图
      drawConnectors(
        canvasCtx, landmarks, HAND_CONNECTIONS,
        { color: isRightHand ? '#00FF00' : '#FF0000' }),
        drawLandmarks(canvasCtx, landmarks, {
          color: isRightHand ? '#00FF00' : '#FF0000',
          fillColor: isRightHand ? '#FF0000' : '#00FF00',
          radius: (x) => {
            return lerp(x.from.z, -0.15, .1, 10, 1);
          }
        });
    }
  }
  canvasCtx.restore();
}

hands.onResults(onResults);
```

识别结果保存在multiHandLandmarks和multiHandedness对象中：

![image.png](https://tva1.sinaimg.cn/large/008eGmZEly1gonuptzkqkj310u0e6411.jpg)

**multiHandLandmarks**是一个二维数组，每一个数组中保存了21个关节坐标信息。把食指坐标赋值给飞机，就可以控制飞机移动了。

![hand](https://tva1.sinaimg.cn/large/008eGmZEly1gon20k3262g30nk0d7kjn.gif)

 然后再加一点点细节，我们的飞机大战就完成了：

![air](https://tva1.sinaimg.cn/large/008eGmZEly1gon23z6gjig30ai0f4u0y.gif)

好了完成了。

关注公众号**H5Talks** ，在公众号后台回复：**飞机大战**获取完整代码。

<img src="https://tva1.sinaimg.cn/large/008eGmZEly1gon2803g9yj30ae0agmyo.jpg" alt="image-20210317180528901" style="zoom:33%;" />

如果本文对你有帮助，欢迎关注、点赞、评论。