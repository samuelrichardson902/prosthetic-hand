import {
  connectToPicoW,
  sendCommand,
  disconnectFromPicoW,
} from "../utils/picoBluetooth";

let isConnected = false;
let isLightOn = false;

const handleConnect = async () => {
  try {
    isConnected = await connectToPicoW();
    if (isConnected) {
      await sendCommand("ON");
      isLightOn = true;
    }
    return isConnected;
  } catch (error) {
    console.error("Connection error:", error);
    isConnected = false;
    isLightOn = false;
    throw error;
  }
};

const handleLightToggle = async () => {
  if (!isConnected) {
    throw new Error("Device not connected");
  }

  try {
    if (isLightOn) {
      await sendCommand("OFF");
      isLightOn = false;
    } else {
      await sendCommand("ON");
      isLightOn = true;
    }
    return isLightOn;
  } catch (error) {
    console.error("Light toggle error:", error);
    throw error;
  }
};

const handleDisconnect = async () => {
  if (!isConnected) {
    return;
  }

  try {
    await sendCommand("OFF");
    isLightOn = false;
    await disconnectFromPicoW();
    isConnected = false;
  } catch (error) {
    console.error("Disconnection error:", error);
    throw error;
  }
};

// Getter functions to check current state
const getConnectionStatus = () => isConnected;
const getLightStatus = () => isLightOn;

export {
  handleConnect,
  handleLightToggle,
  handleDisconnect,
  getConnectionStatus,
  getLightStatus,
};
