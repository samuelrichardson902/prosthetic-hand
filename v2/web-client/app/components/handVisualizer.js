import React from "react";

const HandVisualization = ({ handStates }) => {
  return (
    <div className="flex justify-center space-x-8 p-4">
      {handStates.map((hand, index) => (
        <div key={index} className="flex flex-col items-center">
          <h3 className="text-lg font-bold mb-2">{hand.handType} Hand</h3>
          <div>
            {hand.states.map((fingerState) => (
              <div
                key={fingerState.finger}
                className={`font-medium ${
                  fingerState.extended ? "text-green-600" : "text-red-600"
                }`}
              >
                {fingerState.finger}:{" "}
                {fingerState.extended ? "Extended" : "Closed"}{" "}
                {fingerState.jointAngle}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HandVisualization;
