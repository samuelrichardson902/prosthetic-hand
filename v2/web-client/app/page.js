"use client";
import { useRouter } from "next/navigation";
import { handleConnect } from "./components/picoControl";

export default function Home() {
  const router = useRouter();

  const handleConnectionAttempt = async () => {
    try {
      const isConnected = await handleConnect();
      if (isConnected) {
        router.push("/home");
      } else {
        // Optionally handle failed connection
        console.log("Connection failed");
      }
    } catch (error) {
      // Handle any errors that occur during connection
      console.error("Connection error:", error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <button
              onClick={handleConnectionAttempt}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              Connect to Pico W
            </button>
            <button
              onClick={() => router.push("/demo")}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            >
              Try Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
