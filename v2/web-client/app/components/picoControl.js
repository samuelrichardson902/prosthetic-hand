"use client"; // Mark the component as client-side

import React, { useState } from "react"; // Import useState hook
import {
  connectToPicoW,
  sendCommand,
  disconnectFromPicoW,
} from "../utils/picoBluetooth";

function PicoControl() {
  const [connected, setConnected] = useState(false); // Track connection state
  const [connecting, setConnecting] = useState(false); // Track connecting state
  const [lightOn, setLightOn] = useState(false); // Track LED state (on or off)

  const handleConnect = async () => {
    try {
      await connectToPicoW(setConnected, setConnecting); // Pass setConnected to handle connection state updates
    } finally {
      setConnecting(false); // Always stop showing the spinner after the attempt
    }
  };

  const handleSendOn = async () => {
    if (connected) {
      await sendCommand("ON");
      setLightOn(true); // Update the light state to "on"
    }
  };

  const handleSendOff = async () => {
    if (connected) {
      await sendCommand("OFF");
      setLightOn(false); // Update the light state to "off"
    }
  };

  const handleLightToggle = async () => {
    if (connected) {
      // Toggle the LED state
      if (lightOn) {
        await sendCommand("OFF");
        setLightOn(false); // Set to "off"
      } else {
        await sendCommand("ON");
        setLightOn(true); // Set to "on"
      }
    }
  };

  const handleDisconnect = () => {
    disconnectFromPicoW(setConnected); // Pass setConnected to reset state on disconnect
    setLightOn(false); // Reset light state on disconnect
  };

  return (
    <div className="mainContent">
      {connecting ? ( // Show spinner when connecting
        <div>
          <div className="spinner"></div> {/* Placeholder for spinner */}
        </div>
      ) : !connected ? ( // Show connect button when not connected
        <button onClick={handleConnect}>Connect to Pico W</button>
      ) : (
        // Show LED controls and disconnect button when connected
        <div>
          <button onClick={handleSendOn} disabled={lightOn}>
            Turn LED ON
          </button>
          <button onClick={handleSendOff} disabled={!lightOn}>
            Turn LED OFF
          </button>
          <button onClick={handleLightToggle}>Toggle LED</button>
          <button onClick={handleDisconnect}>Disconnect</button>
        </div>
      )}
    </div>
  );
}

export default PicoControl;
