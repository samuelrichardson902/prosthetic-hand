const UART_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"; // Pico W's UART service UUID
const UART_RX_CHAR_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"; // RX characteristic (write)
const UART_TX_CHAR_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"; // TX characteristic (notify)

let bluetoothDevice;
let uartRxCharacteristic;

async function connectToPicoW() {
  try {
    console.log("Requesting Bluetooth device...");

    // Automatically connect to a device that matches the service UUID
    bluetoothDevice = await navigator.bluetooth.requestDevice({
      filters: [{ services: [UART_SERVICE_UUID] }], // Look for devices advertising the UART service
      optionalServices: [UART_SERVICE_UUID],
    });

    console.log("Connecting to GATT server...");
    const server = await bluetoothDevice.gatt.connect();

    console.log("Getting UART service...");
    const service = await server.getPrimaryService(UART_SERVICE_UUID);

    console.log("Getting RX characteristic...");
    uartRxCharacteristic = await service.getCharacteristic(UART_RX_CHAR_UUID);

    console.log("Connected to Pico W!");

    //return true if connected successfully
    return true;
  } catch (error) {
    // Handle cancellation or failure
    if (error.name === "NotFoundError") {
      console.log("User cancelled the Bluetooth device selection.");
      alert("You cancelled the Bluetooth device selection. Please try again.");
    } else if (error.name === "SecurityError") {
      console.log("SecurityError: Bluetooth permission denied.");
      alert("Bluetooth permission denied. Please check your browser settings.");
    } else {
      console.log("Error connecting to Pico W:", error);
      alert(
        "Failed to connect to Pico W. Please check if your Pico W is powered on and within range."
      );
    }

    //return false if connection fails
    return false;
  }
}

async function sendCommand(command) {
  if (!uartRxCharacteristic) {
    console.error("Not connected to a Bluetooth device.");
    return;
  }

  try {
    console.log(`Sending command: ${command}`);
    const encoder = new TextEncoder();
    await uartRxCharacteristic.writeValue(encoder.encode(command));
    console.log("Command sent successfully.");
  } catch (error) {
    console.log("Error sending command:", error);
  }
}

async function disconnectFromPicoW() {
  if (!bluetoothDevice) {
    console.log("No device to disconnect.");
    return;
  }

  if (bluetoothDevice.gatt.connected) {
    await sendCommand("OFF"); // Turn off the LED before disconnecting
    bluetoothDevice.gatt.disconnect();
    console.log("Disconnected from Pico W.");
  } else {
    console.log("Device already disconnected.");
  }
}

export { connectToPicoW, sendCommand, disconnectFromPicoW };
