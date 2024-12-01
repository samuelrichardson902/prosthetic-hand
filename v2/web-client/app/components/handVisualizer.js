import React from "react";

const HandVisualization = ({ handStates }) => {
  return (
    <div className="flex justify-center space-x-8 p-4">
      {handStates.map((hand, index) => (
        <div
          key={index}
          className="flex items-center border p-4 rounded shadow"
        >
          <h3 className="text-lg font-bold mr-4">{hand.handType} Hand</h3>
          <div className="flex flex-wrap">
            {hand.states.map((fingerState) => (
              <div
                key={fingerState.finger}
                className="flex flex-col items-center mr-8"
              >
                <h4
                  className={`font-medium ${
                    fingerState.extended ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {fingerState.finger}:{" "}
                  {fingerState.extended ? "Extended" : "Closed"}
                </h4>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HandVisualization;
