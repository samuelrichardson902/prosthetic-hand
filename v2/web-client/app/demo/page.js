"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import HandTracker from "../components/handTracker";

export default function DemoPage() {
  const router = useRouter();
  const [handLandmarks, setHandLandmarks] = useState(null);

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
          <button
            onClick={() => router.push("/")}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Back to Home
          </button>

          <HandTracker
            onLandmarksDetected={processHandLandmarks}
            enabled={true}
          />
        </div>
      </div>
    </div>
  );
}
