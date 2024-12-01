import bluetooth
import time
from machine import Pin
from ble_advertising import advertising_payload
from micropython import const
import json

# BLE event constants
_IRQ_CENTRAL_CONNECT = const(1)
_IRQ_CENTRAL_DISCONNECT = const(2)
_IRQ_GATTS_WRITE = const(3)

# BLE characteristic flags
_FLAG_READ = const(0x0002)
_FLAG_WRITE_NO_RESPONSE = const(0x0004)
_FLAG_WRITE = const(0x0008)
_FLAG_NOTIFY = const(0x0010)

# UUIDs for the UART service
_UART_UUID = bluetooth.UUID("6E400001-B5A3-F393-E0A9-E50E24DCCA9E")
_UART_TX = (
    bluetooth.UUID("6E400003-B5A3-F393-E0A9-E50E24DCCA9E"),
    _FLAG_READ | _FLAG_NOTIFY,
)
_UART_RX = (
    bluetooth.UUID("6E400002-B5A3-F393-E0A9-E50E24DCCA9E"),
    _FLAG_WRITE | _FLAG_WRITE_NO_RESPONSE,
)
_UART_SERVICE = (
    _UART_UUID,
    (_UART_TX, _UART_RX),
)


class BLESimplePeripheral:
    def __init__(self, ble, name="sam-hand"):
        self._ble = ble
        self._ble.active(True)
        self._ble.irq(self._irq)
        ((self._handle_tx, self._handle_rx),) = self._ble.gatts_register_services((_UART_SERVICE,))
        self._connections = set()
        self._write_callback = None
        self._payload = advertising_payload(name=name, services=[_UART_UUID])
        self._advertise()

    def _irq(self, event, data):
        if event == _IRQ_CENTRAL_CONNECT:
            conn_handle, _, _ = data
            print("New connection", conn_handle)
            self._connections.add(conn_handle)
        elif event == _IRQ_CENTRAL_DISCONNECT:
            conn_handle, _, _ = data
            print("Disconnected", conn_handle)
            self._connections.remove(conn_handle)
            self._advertise()
        elif event == _IRQ_GATTS_WRITE:
            conn_handle, value_handle = data
            value = self._ble.gatts_read(value_handle)
            if value_handle == self._handle_rx and self._write_callback:
                self._write_callback(value)

    def send(self, data):
        for conn_handle in self._connections:
            self._ble.gatts_notify(conn_handle, self._handle_tx, data)

    def is_connected(self):
        return len(self._connections) > 0

    def _advertise(self, interval_us=100000):
        print("Starting advertising")
        self._ble.gap_advertise(interval_us, adv_data=self._payload)

    def on_write(self, callback):
        self._write_callback = callback


def demo():
    led_onboard = Pin("LED", Pin.OUT)  # Use "LED" for onboard LED pin
    ble = bluetooth.BLE()
    p = BLESimplePeripheral(ble, name="RoboHand")

    def on_rx(v):
        """Callback for receiving hand data."""
        try:
            # Decode the received data
            handData = v.decode('utf-8')
            
            # Check if the data is simply "ON" or "OFF"
            if handData == "ON":
                led_onboard.on()
                print("LED ON due to 'ON' command")
                return
            elif handData == "OFF":
                led_onboard.off()
                print("LED OFF due to 'OFF' command")
                return
            
            # Split the data into individual hand data
            hand_data_list = handData.split(',')
            
            any_finger_extended = False
            
            for hand_data in hand_data_list:
                if len(hand_data) == 6:  # Each hand data should be 6 characters long (1 for hand type + 5 for finger states)
                    hand_type = hand_data[0]
                    finger_states = hand_data[1:6]
                    
                    print(f"Hand type: {hand_type}, Finger states: {finger_states}")

                    # Check if any finger is extended (1 in the string)
                    if '1' in finger_states:
                        any_finger_extended = True
                        print(f"At least one finger is extended on {hand_type} hand")

            if any_finger_extended:
                led_onboard.on()  # At least one finger is extended on any hand
                print("At least one finger is extended on any hand - LED ON")
            else:
                led_onboard.off()  # All fingers are closed on all hands
                print("All fingers are closed on all hands - LED OFF")

        except Exception as e:
            print(f"Unexpected error processing hand data: {e}")
            led_onboard.off()  # Turn off LED on any error

    p.on_write(on_rx)



if __name__ == "__main__":
    demo()


