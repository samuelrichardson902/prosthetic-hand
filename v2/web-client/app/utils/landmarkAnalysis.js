function getFingerStates(handData) {
  // Helper function to calculate angle between two vectors
  const angle = (v1, v2) => {
    const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    const mag1 = Math.hypot(v1.x, v1.y, v1.z);
    const mag2 = Math.hypot(v2.x, v2.y, v2.z);
    return (Math.acos(dot / (mag1 * mag2)) * 180) / Math.PI;
  };

  // Define finger configurations with thresholds
  const fingersConfig = [
    {
      name: "Thumb",
      tipIdx: 4,
      dipIdx: 3,
      pipIdx: 2,
      mcpIdx: 1,
      thresholds: { dip: 30, pip: 30, mcp: 30 },
    },
    {
      name: "Index",
      tipIdx: 8,
      dipIdx: 7,
      pipIdx: 6,
      mcpIdx: 5,
      thresholds: { dip: 55, pip: 55, mcp: 55 },
    },
    {
      name: "Middle",
      tipIdx: 12,
      dipIdx: 11,
      pipIdx: 10,
      mcpIdx: 9,
      thresholds: { dip: 55, pip: 55, mcp: 55 },
    },
    {
      name: "Ring",
      tipIdx: 16,
      dipIdx: 15,
      pipIdx: 14,
      mcpIdx: 13,
      thresholds: { dip: 55, pip: 55, mcp: 55 },
    },
    {
      name: "Pinky",
      tipIdx: 20,
      mcpIdx: 17,
      pipIdx: 18,
      dipIdx: 19,
      thresholds: { dip: 55, pip: 55, mcp: 55 },
    },
  ];

  // Function to calculate joint angles for a finger
  const jointAngles = (landmarks, finger) => {
    const tip = landmarks[finger.tipIdx];
    const dip = landmarks[finger.dipIdx];
    const pip = landmarks[finger.pipIdx];
    const mcp = landmarks[finger.mcpIdx];
    const wst = landmarks[0]; // wrist landmark

    const tipToDip = { x: tip.x - dip.x, y: tip.y - dip.y, z: tip.z - dip.z };
    const dipToPip = { x: dip.x - pip.x, y: dip.y - pip.y, z: dip.z - pip.z };
    const pipToMcp = { x: pip.x - mcp.x, y: pip.y - mcp.y, z: pip.z - mcp.z };
    const mcpToWst = { x: mcp.x - wst.x, y: mcp.y - wst.y, z: mcp.z - wst.z };

    return {
      dipAngle: angle(tipToDip, dipToPip),
      pipAngle: angle(dipToPip, pipToMcp),
      mcpAngle: angle(pipToMcp, mcpToWst),
    };
  };

  // Function to determine if a finger is extended
  const isFingerExtended = (landmarks, finger) => {
    const angles = jointAngles(landmarks, finger);
    return (
      angles.dipAngle < finger.thresholds.dip &&
      angles.pipAngle < finger.thresholds.pip &&
      angles.mcpAngle < finger.thresholds.mcp
    );
  };

  return handData.map(({ landmarks, handType, confidence }) => ({
    handType,
    confidence,
    states: fingersConfig.map((finger) => ({
      finger: finger.name,
      jointAngles: jointAngles(landmarks, finger),
      extended: isFingerExtended(landmarks, finger),
    })),
  }));
}

export { getFingerStates };
