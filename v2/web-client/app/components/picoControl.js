import React, { useState } from "react";
import {
  connectToPicoW,
  sendCommand,
  disconnectFromPicoW,
} from "../utils/picoBluetooth";
import HandTracker from "./handTracker";

function PicoControl() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [lightOn, setLightOn] = useState(false);
  const [handLandmarks, setHandLandmarks] = useState(null);
  const [trackingEnabled, setTrackingEnabled] = useState(false);

  const handleConnect = async () => {
    try {
      await connectToPicoW(setConnected, setConnecting);
      await sendCommand("ON");
      setLightOn(true);
      setTrackingEnabled(true); // Enable tracking after successful connection
    } finally {
      setConnecting(false);
    }
  };

  const handleLightToggle = async () => {
    if (connected) {
      if (lightOn) {
        await sendCommand("OFF");
        setLightOn(false);
      } else {
        await sendCommand("ON");
        setLightOn(true);
      }
    }
  };

  const handleDisconnect = () => {
    setTrackingEnabled(false); // Disable tracking before disconnecting
    disconnectFromPicoW(setConnected);
    setLightOn(false);
    setHandLandmarks(null);
  };

  const processHandLandmarks = (landmarks) => {
    setHandLandmarks(landmarks);

    if (landmarks && landmarks.length > 0) {
      console.log("hand in frame");
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="w-full max-w-2xl">
        {connecting ? (
          <div className="flex justify-center items-center p-4">
            <div className="spinner"></div>
          </div>
        ) : !connected ? (
          <button
            onClick={handleConnect}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Connect to Pico W
          </button>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <button
                onClick={handleLightToggle}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
              >
                Toggle LED
              </button>
              <button
                onClick={handleDisconnect}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
              >
                Disconnect
              </button>
            </div>

            {trackingEnabled && (
              <HandTracker
                onLandmarksDetected={processHandLandmarks}
                enabled={trackingEnabled}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PicoControl;
