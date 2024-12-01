function getFingerStates(handData) {
  // Helper function to calculate angle between two vectors
  const angle = (v1, v2) => {
    const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    const mag1 = Math.hypot(v1.x, v1.y, v1.z);
    const mag2 = Math.hypot(v2.x, v2.y, v2.z);
    const cosTheta = dot / (mag1 * mag2);
    // Clamp the value to prevent Math.acos errors due to precision issues
    const clampedCosTheta = Math.min(1, Math.max(-1, cosTheta));
    return (Math.acos(clampedCosTheta) * 180) / Math.PI;
  };

  // Helper function to calculate the distance between two points
  const distance = (p1, p2) =>
    Math.hypot(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z);

  // Define finger configurations with thresholds
  const fingersConfig = [
    {
      name: "Thumb",
      tipIdx: 4,
      dipIdx: 3,
      pipIdx: 2,
      mcpIdx: 1,
      thresholds: { dip: 25, pip: 25, mcp: 30 },
    },
    {
      name: "Index",
      tipIdx: 8,
      dipIdx: 7,
      pipIdx: 6,
      mcpIdx: 5,
      thresholds: { dip: 45, pip: 70, mcp: 60 },
    },
    {
      name: "Middle",
      tipIdx: 12,
      dipIdx: 11,
      pipIdx: 10,
      mcpIdx: 9,
      thresholds: { dip: 45, pip: 70, mcp: 60 },
    },
    {
      name: "Ring",
      tipIdx: 16,
      dipIdx: 15,
      pipIdx: 14,
      mcpIdx: 13,
      thresholds: { dip: 45, pip: 70, mcp: 60 },
    },
    {
      name: "Pinky",
      tipIdx: 20,
      dipIdx: 19,
      pipIdx: 18,
      mcpIdx: 17,
      thresholds: { dip: 45, pip: 70, mcp: 60 },
    },
  ];

  // Function to calculate joint angles for a finger
  const jointAngles = (landmarks, finger) => {
    if (!landmarks) {
      return { dipAngle: null, pipAngle: null, mcpAngle: null };
    }

    const tip = landmarks[finger.tipIdx];
    const dip = landmarks[finger.dipIdx];
    const pip = landmarks[finger.pipIdx];
    const mcp = landmarks[finger.mcpIdx];
    const wrist = landmarks[0]; // wrist landmark

    const tipToDip = { x: tip.x - dip.x, y: tip.y - dip.y, z: tip.z - dip.z };
    const dipToPip = { x: dip.x - pip.x, y: dip.y - pip.y, z: dip.z - pip.z };
    const pipToMcp = { x: pip.x - mcp.x, y: pip.y - mcp.y, z: pip.z - mcp.z };
    const mcpToWrist = {
      x: mcp.x - wrist.x,
      y: mcp.y - wrist.y,
      z: mcp.z - wrist.z,
    };

    return {
      dipAngle: angle(tipToDip, dipToPip),
      pipAngle: angle(dipToPip, pipToMcp),
      mcpAngle: angle(pipToMcp, mcpToWrist),
    };
  };

  // Function to determine if a finger is extended
  const isFingerExtended = (landmarks, finger) => {
    if (!landmarks) return false;

    const angles = jointAngles(landmarks, finger);

    if (finger.name === "Thumb") {
      // Check thumb opposition with pinky base
      const pinkyBase = landmarks[17];
      const thumbTip = landmarks[finger.tipIdx];
      const thumbDip = landmarks[finger.dipIdx];

      const tipDistance = distance(thumbTip, pinkyBase);
      const dipDistance = distance(thumbDip, pinkyBase);

      return (
        // angles.dipAngle < finger.thresholds.dip ||
        // angles.pipAngle < finger.thresholds.pip ||
        // angles.mcpAngle < finger.thresholds.mcp ||
        tipDistance > dipDistance
      );
    } else {
      // For other fingers, all joints must meet thresholds
      return (
        angles.dipAngle < finger.thresholds.dip &&
        angles.pipAngle < finger.thresholds.pip &&
        angles.mcpAngle < finger.thresholds.mcp
      );
    }
  };

  // Validate input and process each hand's data
  return handData.map(({ landmarks, handType, confidence }) => {
    if (!landmarks || landmarks.length < 21) {
      return {
        handType,
        confidence,
        error: "Invalid landmarks data",
        states: [],
      };
    }

    return {
      handType,
      confidence,
      states: fingersConfig.map((finger) => ({
        finger: finger.name,
        extended: isFingerExtended(landmarks, finger),
      })),
    };
  });
}

export { getFingerStates };
