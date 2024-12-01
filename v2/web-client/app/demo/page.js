"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import HandTracker from "../components/handTracker";
import { getFingerStates } from "../utils/landmarkAnalysis";
import HandVisualization from "../components/handVisualizer";

export default function DemoPage() {
  const router = useRouter();
  const [fingerStates, setFingerStates] = useState(null);

  const processHandLandmarks = (handsData) => {
    const states = getFingerStates(handsData);
    setFingerStates(states);
  };

  return (
    <div className="demo-container">
      <div className="demo-inner">
        <div className="demo-button-container">
          <button onClick={() => router.push("/")} className="demo-button">
            Back to Home
          </button>

          <HandTracker
            onLandmarksDetected={processHandLandmarks}
            enabled={true}
          />

          {fingerStates && <HandVisualization handStates={fingerStates} />}
        </div>
      </div>
    </div>
  );
}
