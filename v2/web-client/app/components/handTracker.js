import React, { useEffect, useRef, useState } from "react";

const HandTracker = ({
  // Hand detection settings
  maxNumHands = 2,
  minHandDetectionConfidence = 0.5,
  minHandPresenceConfidence = 0.5,
  minTrackingConfidence = 0.5,

  // Visualization settings
  landmarkColor = "red",
  landmarkSize = 4,
  connectionColor = "blue",
  connectionWidth = 2,

  // Video settings
  facingMode = "user", // or "environment" for back camera
  width = 640,
  height = 480,

  onLandmarksDetected = () => {}, // callback prop
  enabled = false, // control when tracking is active
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const animationFrameRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const streamRef = useRef(null);

  // Finger connection pairs for drawing lines
  const connections = [
    // Thumb
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    // Index finger
    [0, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    // Middle finger
    [0, 9],
    [9, 10],
    [10, 11],
    [11, 12],
    // Ring finger
    [0, 13],
    [13, 14],
    [14, 15],
    [15, 16],
    // Pinky
    [0, 17],
    [17, 18],
    [18, 19],
    [19, 20],
  ];

  // Cleanup function to stop everything
  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    handLandmarkerRef.current = null;
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (!enabled) return;

      try {
        // Get camera access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: width },
            height: { ideal: height },
          },
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Initialize MediaPipe HandLandmarker
        const vision = await import("@mediapipe/tasks-vision");
        const vision_wasm = await vision.FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        if (!mounted) return;

        handLandmarkerRef.current =
          await vision.HandLandmarker.createFromOptions(vision_wasm, {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            numHands: maxNumHands,
            minHandDetectionConfidence,
            minHandPresenceConfidence,
            minTrackingConfidence,
          });

        // Setup canvas and start detection
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");

        const detectHands = async () => {
          if (!video || !handLandmarkerRef.current || !ctx || !enabled) return;

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const results = await handLandmarkerRef.current.detectForVideo(
            video,
            performance.now()
          );

          if (results.landmarks) {
            const detectedHands = results.landmarks.map(
              (handLandmarks, index) => {
                const handedness =
                  results.handednesses && results.handednesses[index]
                    ? results.handednesses[index][0]
                    : null;

                return {
                  landmarks: handLandmarks,
                  handType: handedness ? handedness.categoryName : null, // 'Left' or 'Right'
                  confidence: handedness ? handedness.score : null, // Confidence score
                };
              }
            );

            // Pass detected hands to the callback
            onLandmarksDetected(detectedHands);

            // Visualize hands on canvas
            detectedHands.forEach(({ landmarks, handType, confidence }) => {
              // Draw connections
              ctx.strokeStyle = connectionColor;
              ctx.lineWidth = connectionWidth;
              connections.forEach(([start, end]) => {
                ctx.beginPath();
                ctx.moveTo(
                  landmarks[start].x * canvas.width,
                  landmarks[start].y * canvas.height
                );
                ctx.lineTo(
                  landmarks[end].x * canvas.width,
                  landmarks[end].y * canvas.height
                );
                ctx.stroke();
              });

              // Draw landmarks
              landmarks.forEach((landmark) => {
                ctx.beginPath();
                ctx.arc(
                  landmark.x * canvas.width,
                  landmark.y * canvas.height,
                  landmarkSize,
                  0,
                  2 * Math.PI
                );
                ctx.fillStyle = landmarkColor;
                ctx.fill();
              });

              // Draw hand type and confidence above the wrist (landmark 0)
              if (handType && confidence !== null) {
                ctx.font = "16px Arial";
                ctx.fillStyle = "white";
                ctx.fillText(
                  `${handType} (${confidence.toFixed(2)})`,
                  landmarks[0].x * canvas.width,
                  landmarks[0].y * canvas.height - 10
                );
              }
            });
          }

          if (enabled) {
            animationFrameRef.current = requestAnimationFrame(detectHands);
          }
        };

        detectHands();
      } catch (err) {
        setError(err.message);
      }
    };

    initialize();

    return () => {
      mounted = false;
      cleanup();
    };
  }, [enabled]); // Re-run when enabled state changes

  // Additional cleanup effect when component unmounts
  useEffect(() => {
    return cleanup;
  }, []);

  return (
    <div className="hand-tracker-container">
      <h1 className="hand-tracker-title">Hand Tracking</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="video-container">
        <video ref={videoRef} className="video-element" playsInline autoPlay />
        <canvas ref={canvasRef} className="canvas-element" />
      </div>
    </div>
  );
};

export default HandTracker;
