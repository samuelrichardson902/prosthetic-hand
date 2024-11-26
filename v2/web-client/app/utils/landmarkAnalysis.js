function getFingerStates(handData) {
  // Compute Euclidean distance between two points
  function distance(p1, p2) {
    return Math.sqrt(
      Math.pow(p1.x - p2.x, 2) +
        Math.pow(p1.y - p2.y, 2) +
        Math.pow(p1.z - p2.z, 2)
    );
  }

  // Compute angle between vectors
  function angle(v1, v2) {
    const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    const mag1 = Math.sqrt(v1.x ** 2 + v1.y ** 2 + v1.z ** 2);
    const mag2 = Math.sqrt(v2.x ** 2 + v2.y ** 2 + v2.z ** 2);
    return (Math.acos(dot / (mag1 * mag2)) * 180) / Math.PI;
  }

  function isFingerExtended(landmarks, finger) {
    const { tipIdx, mcpIdx, pipIdx, dipIdx } = finger;
    const tip = landmarks[tipIdx];
    const dip = landmarks[dipIdx];
    const pip = landmarks[pipIdx];
    const mcp = landmarks[mcpIdx];

    // Create vectors
    const fingerVector = {
      x: pip.x - mcp.x,
      y: pip.y - mcp.y,
      z: pip.z - mcp.z,
    };

    const baseJointVector = {
      x: dip.x - pip.x,
      y: dip.y - pip.y,
      z: dip.z - pip.z,
    };

    // Check distances between joints
    const mcpToTipDist = distance(mcp, tip);
    const mcpToPipDist = distance(mcp, pip);
    const pipToDipDist = distance(pip, dip);
    const dipToTipDist = distance(dip, tip);

    // Check angle between finger vector and base joint vector
    const fingerAngle = angle(fingerVector, baseJointVector);

    // Thumb has different landmarks, so special case
    if (finger.name === "Thumb") {
      return fingerAngle < 30;
    }

    // For other fingers, check if tip is significantly further from MCP
    // and the angle is large
    return fingerAngle < 55;
  }

  function fingerJointAngle(landmarks, finger) {
    const { tipIdx, mcpIdx, pipIdx, dipIdx } = finger;
    const tip = landmarks[tipIdx];
    const dip = landmarks[dipIdx];
    const pip = landmarks[pipIdx];
    const mcp = landmarks[mcpIdx];

    // Create vectors
    const fingerVector = {
      x: pip.x - mcp.x,
      y: pip.y - mcp.y,
      z: pip.z - mcp.z,
    };

    const baseJointVector = {
      x: dip.x - pip.x,
      y: dip.y - pip.y,
      z: dip.z - pip.z,
    };

    // Check angle between finger vector and base joint vector
    const fingerAngle = angle(fingerVector, baseJointVector);

    return fingerAngle;
  }

  return handData.map(({ landmarks, handType, confidence }) => {
    const fingers = [
      {
        name: "Thumb",
        tipIdx: 4,
        mcpIdx: 2,
        pipIdx: 3,
        dipIdx: 4,
      },
      {
        name: "Index",
        tipIdx: 8,
        mcpIdx: 5,
        pipIdx: 6,
        dipIdx: 7,
      },
      {
        name: "Middle",
        tipIdx: 12,
        mcpIdx: 9,
        pipIdx: 10,
        dipIdx: 11,
      },
      {
        name: "Ring",
        tipIdx: 16,
        mcpIdx: 13,
        pipIdx: 14,
        dipIdx: 15,
      },
      {
        name: "Pinky",
        tipIdx: 20,
        mcpIdx: 17,
        pipIdx: 18,
        dipIdx: 19,
      },
    ];

    return {
      handType,
      confidence,
      states: fingers.map((finger) => ({
        finger: finger.name,
        jointAngle: fingerJointAngle(landmarks, finger),
        extended: isFingerExtended(landmarks, finger),
      })),
    };
  });
}

export { getFingerStates };
