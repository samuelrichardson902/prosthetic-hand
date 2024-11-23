import cv2
import serial
from cvzone.HandTrackingModule import HandDetector
# connect to the internal or external webcam
try:
    cam = cv2.VideoCapture(0)
except:
    cam = cv2.VideoCapture(1)

#detect hand in image
detector = HandDetector(maxHands=2, detectionCon=0.8)

#connect to arduino over usb
arduino = serial.Serial(port='COM5', baudrate=9600)

while True:
    #feed webcam image into AI to find hand landmarks
    success, img = cam.read()
    hand, img = detector.findHands(img)

    # saves the state of finger position to an array
    if hand:
        hand1=hand[0]
        lmList = hand1["lmList"]
        handType = hand1["type"]
        fingers1 = detector.fingersUp(hand1)

        #detect if the hand is facing the camera or not
        notpalm=False
        if handType == "Right":
            if (lmList[5][0])<(lmList[17][0]):
                notpalm=True
        elif handType == "Left":
            if (lmList[5][0])>(lmList[17][0]):
                notpalm=True

        #decides if the thumb is up based on if hand is facing the camera
        if notpalm:
            if fingers1[0]==0:
                fingers1[0]=1
            else:
                fingers1[0]=0

        #send data to arduino over usb
        string = "$"+str(int(fingers1[0]))+str(int(fingers1[1]))+str(int(fingers1[2]))+str(int(fingers1[3]))+str(int(fingers1[4]))
        arduino.write(string.encode())

    #display camera image to the screen
    cv2.imshow('image', img)
    if cv2.waitKey(1) == 27: 
            break  # esc to quit
    
cv2.destroyAllWindows()

