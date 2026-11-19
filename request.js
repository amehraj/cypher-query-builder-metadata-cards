const request = {
      analysisNode: "Software_System",
      targets: [
        { targetNode: "Use_Type", targetRelationship: "AI_MODEL_INTENDED_USE_TYPE", targetValue: "Emotion Classification" },
        { targetNode: "User_Type", targetRelationship: "AI_MODEL_INTENDED_USER", targetValue: "Developer" },
        { targetNode: "Use_Type", targetRelationship: "DATA_INTENDED_USE_TYPE", targetValue: "Medical Diagnosis" },
        { targetNode: "Domain", targetRelationship: "DATA_INTENDED_USE_DOMAIN", targetValue: "Healthcare" }
      ]
};

module.exports = request;