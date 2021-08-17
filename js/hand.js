// Our input frames will come from here.
const videoElement =
  document.getElementsByClassName('input_video')[0];
const canvasElement =
  document.getElementsByClassName('output_canvas')[0];

const canvasCtx = canvasElement.getContext('2d');


function onResults(results) {
  // Hide the spinner.
  document.body.classList.add('loaded');

  // Draw the overlays.
//   canvasCtx.save();
//   canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
//   canvasCtx.drawImage(
//     results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.multiHandLandmarks && results.multiHandedness) {
    for (let index = 0; index < results.multiHandLandmarks.length; index++) {
      const classification = results.multiHandedness[index];
      const isRightHand = classification.label === 'Right';
      const landmarks = results.multiHandLandmarks[index];

      let x = landmarks[8].x * 1280;
      let y = landmarks[8].y * 720;
    //   hero.style.left = x - 50 + 'px';
    //   hero.style.top = y - 40 + 'px';
    movePlaneWithFinger(x,y)

    //   drawConnectors(
    //     canvasCtx, landmarks, HAND_CONNECTIONS,
    //     { color: isRightHand ? '#00FF00' : '#FF0000' }),
    //     drawLandmarks(canvasCtx, landmarks, {
    //       color: isRightHand ? '#00FF00' : '#FF0000',
    //       fillColor: isRightHand ? '#FF0000' : '#00FF00',
    //       radius: (x) => {
    //         return lerp(x.from.z, -0.15, .1, 10, 1);
    //       }
    //     });
    }
  }
//   canvasCtx.restore();
}

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.3/${file}`;
  }
});
hands.onResults(onResults);

hands.setOptions({
  selfieMode: true,
  maxNumHands: 1,
  minDetectionConfidence: 0.75,
  minTrackingConfidence: 0.75
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
