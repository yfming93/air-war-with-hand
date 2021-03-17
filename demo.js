// Our input frames will come from here.
const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];

const canvasCtx = canvasElement.getContext('2d');

const hero = document.getElementsByClassName('hero')[0];

const spinner = document.querySelector('.loading');

spinner.ontransitionend = () => {
  spinner.style.display = 'none';
};

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.1/${file}`;
  }
});

hands.setOptions({
  selfieMode: true, //是否自拍，即是否使用前置摄像头
  maxNumHands: 2,  //最大识别手部数量
  minDetectionConfidence: 0.5,  //识别精度，这个数值越高，则要求图像高评分才能被识别 默认 0.5
  minTrackingConfidence: 0.5 //跟踪速度，数值越高，花费时间越长
});

/**
 * Instantiate a camera. We'll feed each frame we receive into the solution.
 */
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 1280,
  height: 720
});
camera.start();

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

