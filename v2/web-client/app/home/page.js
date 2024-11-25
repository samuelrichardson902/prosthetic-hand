"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { handleLightToggle, handleDisconnect } from "../components/picoControl";
import HandTracker from "../components/handTracker";

export default function Home() {
  const router = useRouter();
  const [handLandmarks, setHandLandmarks] = useState(null);

  const handleDisconnectAttempt = async () => {
    try {
      await handleDisconnect();
      router.push("/"); // Route back to main page after successful disconnect
    } catch (error) {
      console.error("Disconnection error:", error);
    }
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
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <button
              onClick={handleLightToggle}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            >
              Toggle LED
            </button>
            <button
              onClick={handleDisconnectAttempt}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
            >
              Disconnect
            </button>
          </div>

          <HandTracker
            onLandmarksDetected={processHandLandmarks}
            enabled={true}
          />
        </div>
      </div>
    </div>
  );
}
