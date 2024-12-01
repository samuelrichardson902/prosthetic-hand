"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendPiData, handleDisconnect } from "../utils/picoControl";
import HandTracker from "../components/handTracker";
import { getFingerStates } from "../utils/landmarkAnalysis";
import HandVisualization from "../components/handVisualizer";

export default function Home() {
  const router = useRouter();
  const [fingerStates, setFingerStates] = useState(null);

  // Add a last send time tracker
  const lastSendTime = { current: 0 };
  const SEND_INTERVAL = 100; // 100ms minimum between sends

  const handleDisconnectAttempt = async () => {
    try {
      await handleDisconnect();
      router.push("/"); // Route back to main page after successful disconnect
    } catch (error) {
      console.error("Disconnection error:", error);
    }
  };

  const processHandLandmarks = async (handsData) => {
    const states = getFingerStates(handsData);
    setFingerStates(states);

    const currentTime = Date.now();

    // Check if enough time has passed since last send and skip otherwise to prevent flooding
    if (currentTime - lastSendTime.current < SEND_INTERVAL) {
      return;
    }

    // Convert the hand data for Pi
    const piData = states.map((hand) => {
      const fingerStates = hand.states
        .map((fingerState) => (fingerState.extended ? "1" : "0"))
        .join("");
      // Format the hand data as L or R followed by the finger states
      return `${hand.handType.charAt(0).toUpperCase()}${fingerStates}`;
    });

    try {
      await sendPiData(piData); // Send the converted data to Pi
      lastSendTime.current = currentTime; // Update last send time
    } catch (error) {
      console.error("Error sending data to Pi:", error);
    }
  };

  return (
    <div className="home-container">
      <div className="home-inner">
        <div className="home-button-container">
          <div className="home-buttons">
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
