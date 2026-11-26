// Analysis requirements that combine several node types, written two ways: as text and as a
// request in the request.js format. Run one with `npm start -- <number>` (for example
// `npm start -- 3`); `npm start` alone runs request.js. Each request can also be copied into
// request.js as it is.
//
// `expected` is the answer on the sample graph loaded by `npm run seed` (graph/seed.cypher).
//
// How conditions combine: all conditions must hold (AND). Conditions that travel the same route
// share the nodes on it: two conditions through the system's data must hold on the same dataset
// (requirement 4 shows this). Conditions ending at the same kind of node (for example two use
// types) are matched separately. Each condition follows the shortest route in the graph model:
// from an organisation, an AI model is reached as "developed by" and data as "owned by", not
// through a software system the organisation owns.

const analysisRequirements = [
  {
    id: 1,
    requirement:
      "Which software systems use an AI model intended for emotion classification by developers, " +
      "and also use data intended for medical diagnosis in healthcare?",
    nodeTypes: ["Software_System", "AI_Model", "Data", "Use_Type", "User_Type", "Domain"],
    request: {
      analysisNode: "Software_System",
      targets: [
        { targetNode: "Use_Type", targetRelationship: "AI_MODEL_INTENDED_USE_TYPE", targetValue: "Emotion Classification" },
        { targetNode: "User_Type", targetRelationship: "AI_MODEL_INTENDED_USER", targetValue: "Developer" },
        { targetNode: "Use_Type", targetRelationship: "DATA_INTENDED_USE_TYPE", targetValue: "Medical Diagnosis" },
        { targetNode: "Domain", targetRelationship: "DATA_INTENDED_USE_DOMAIN", targetValue: "Healthcare" }
      ]
    },
    expected: ["Hospital Software System"]
  },
  {
    id: 2,
    requirement:
      "Which software systems use an AI model with misclassification as a risk factor that is mitigated by " +
      "security hardening, together with data of high risk severity protected by privacy measures?",
    nodeTypes: ["Software_System", "AI_Model", "Data", "Factor", "Mitigation_Type", "Severity"],
    request: {
      analysisNode: "Software_System",
      targets: [
        { targetNode: "Factor", targetRelationship: "AI_MODEL_RISK_FACTOR", targetValue: "Misclassification" },
        { targetNode: "Mitigation_Type", targetRelationship: "AI_MODEL_RISK_MITIGATION_TYPE", targetValue: "Security hardening" },
        { targetNode: "Severity", targetRelationship: "DATA_RISK_SEVERITY", targetValue: "High" },
        { targetNode: "Mitigation_Type", targetRelationship: "DATA_RISK_MITIGATION_TYPE", targetValue: "Privacy protection" }
      ]
    },
    expected: ["Hospital Software System"]
  },
  {
    id: 3,
    requirement:
      "Which organisations own data that is intended for person detection, has a sampling bias, and must not " +
      "be used for gender classification?",
    nodeTypes: ["Organization", "Data", "Use_Type", "Bias_Type"],
    request: {
      analysisNode: "Organization",
      targets: [
        { targetNode: "Use_Type", targetRelationship: "DATA_INTENDED_USE_TYPE", targetValue: "Person Detection" },
        { targetNode: "Bias_Type", targetRelationship: "DATA_BIAS_TYPE", targetValue: "Selection/Sampling" },
        { targetNode: "Use_Type", targetRelationship: "DATA_MISUSE_TYPE", targetValue: "Gender Classification" }
      ]
    },
    expected: ["Google"]
  },
  {
    id: 4,
    requirement:
      "Which software systems use one dataset that both has a sampling bias and must not be used for " +
      "educational model training?",
    nodeTypes: ["Software_System", "Data", "Bias_Type", "Use_Type"],
    request: {
      analysisNode: "Software_System",
      targets: [
        { targetNode: "Bias_Type", targetRelationship: "DATA_BIAS_TYPE", targetValue: "Selection/Sampling" },
        { targetNode: "Use_Type", targetRelationship: "DATA_MISUSE_TYPE", targetValue: "Educational model training" }
      ]
    },
    // Both conditions travel through the system's data, so they must hold on the same dataset. The sampling
    // bias belongs to Open Images Extended MIAP and the misuse to Patient Records: no single dataset has both.
    expected: []
  },
  {
    id: 5,
    requirement:
      "Which software components insert records and check data consent while accessing data intended for " +
      "clinical decision support?",
    nodeTypes: ["Software_Component", "Function_Type", "Data", "Use_Type"],
    request: {
      analysisNode: "Software_Component",
      targets: [
        { targetNode: "Function_Type", targetRelationship: "HAS_FUNCTION", targetValue: "Insert Record" },
        { targetNode: "Function_Type", targetRelationship: "HAS_FUNCTION", targetValue: "Check Data Consent" },
        { targetNode: "Use_Type", targetRelationship: "DATA_INTENDED_USE_TYPE", targetValue: "Clinical Decision Support" }
      ]
    },
    expected: ["Add Record Component"]
  },
  {
    id: 6,
    requirement:
      "Which software components use an AI model that lists misuse as a risk factor and is intended for " +
      "facial emotion recognition?",
    nodeTypes: ["Software_Component", "AI_Model", "Factor", "Domain"],
    request: {
      analysisNode: "Software_Component",
      targets: [
        { targetNode: "Factor", targetRelationship: "AI_MODEL_RISK_FACTOR", targetValue: "Misuse" },
        { targetNode: "Domain", targetRelationship: "AI_MODEL_INTENDED_USE_DOMAIN", targetValue: "Facial Emotion Recognition" }
      ]
    },
    expected: ["Use Model Component"]
  },
  {
    id: 7,
    requirement:
      "Which user roles can access a component that views records of data with high risk severity and a " +
      "privacy risk factor?",
    nodeTypes: ["Software_User_Role_Type", "Software_Component", "Function_Type", "Data", "Severity", "Factor"],
    request: {
      analysisNode: "Software_User_Role_Type",
      targets: [
        { targetNode: "Function_Type", targetRelationship: "HAS_FUNCTION", targetValue: "View Record" },
        { targetNode: "Severity", targetRelationship: "DATA_RISK_SEVERITY", targetValue: "High" },
        { targetNode: "Factor", targetRelationship: "DATA_RISK_FACTOR", targetValue: "Privacy" }
      ]
    },
    expected: ["Doctor", "Patient"]
  },
  {
    id: 8,
    requirement:
      "Which user roles can use an emotion classification model that lists misclassification as a risk factor? " +
      "Users in these roles see the model's output and must be able to recognise its errors.",
    nodeTypes: ["Software_User_Role_Type", "Software_Component", "AI_Model", "Use_Type", "Factor"],
    request: {
      analysisNode: "Software_User_Role_Type",
      targets: [
        { targetNode: "Use_Type", targetRelationship: "AI_MODEL_INTENDED_USE_TYPE", targetValue: "Emotion Classification" },
        { targetNode: "Factor", targetRelationship: "AI_MODEL_RISK_FACTOR", targetValue: "Misclassification" }
      ]
    },
    expected: ["Doctor"]
  },
  {
    id: 9,
    requirement:
      "Which software systems have users with the doctor role and components that use an AI model, while " +
      "the system's data is intended for doctors?",
    nodeTypes: ["Software_System", "Software_User", "Software_User_Role_Type", "Software_Component", "Function_Type", "Data", "User_Type"],
    request: {
      analysisNode: "Software_System",
      targets: [
        { targetNode: "Software_User_Role_Type", targetRelationship: "SOFTWARE_USER_ROLE_TYPE_OF", targetValue: "Doctor" },
        { targetNode: "Function_Type", targetRelationship: "HAS_FUNCTION", targetValue: "Use AI Model" },
        { targetNode: "User_Type", targetRelationship: "DATA_INTENDED_USER", targetValue: "Doctor" }
      ]
    },
    expected: ["Hospital Software System"]
  },
  {
    id: 10,
    requirement:
      "Which organisations have developed an AI model that excludes attributes to mitigate bias and depends " +
      "on hardware as a risk factor?",
    nodeTypes: ["Organization", "AI_Model", "Mitigation_Type", "Factor"],
    request: {
      analysisNode: "Organization",
      targets: [
        { targetNode: "Mitigation_Type", targetRelationship: "AI_MODEL_BIAS_MITIGATION_TYPE", targetValue: "Excluding Attributes" },
        { targetNode: "Factor", targetRelationship: "AI_MODEL_RISK_FACTOR", targetValue: "Hardware" }
      ]
    },
    expected: ["NVIDIA"]
  }
];

module.exports = analysisRequirements;
