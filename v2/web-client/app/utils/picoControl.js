import {
  connectToPicoW,
  sendCommand,
  disconnectFromPicoW,
} from "./picoBluetooth";

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

const sendPiData = async (data) => {
  if (isConnected) {
    try {
      await sendCommand(data);
    } catch (error) {
      console.error("Data send error:", error);
    }
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

export { handleConnect, sendPiData, handleDisconnect };
