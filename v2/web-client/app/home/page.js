"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { handleLightToggle, handleDisconnect } from "../utils/picoControl";
import HandTracker from "../components/handTracker";
import { getFingerStates } from "../utils/landmarkAnalysis";
import HandVisualization from "../components/handVisualizer";

export default function Home() {
  const router = useRouter();
  const [hands, setHands] = useState(null);
  const [fingerStates, setFingerStates] = useState(null);

  const handleDisconnectAttempt = async () => {
    try {
      await handleDisconnect();
      router.push("/"); // Route back to main page after successful disconnect
    } catch (error) {
      console.error("Disconnection error:", error);
    }
  };

  const processHandLandmarks = (hands) => {
    setHands(hands);
    const states = getFingerStates(hands);
    setFingerStates(states);
    console.log(states);
  };

  return (
    <div className="home-container">
      <div className="home-inner">
        <div className="home-button-container">
          <div className="home-buttons">
            <button
              onClick={handleLightToggle}
              className="home-button green-button"
            >
              Toggle LED
            </button>
            <button
              onClick={handleDisconnectAttempt}
              className="home-button red-button"
            >
              Disconnect
            </button>
          </div>

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
