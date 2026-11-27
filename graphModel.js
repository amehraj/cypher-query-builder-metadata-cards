
const graphEdges = [

  {
    from: "Organization",
    relationship: "HAS_DEVELOPED_AI_MODEL",
    to: "AI_Model"
  },

  {
    from: "Organization",
    relationship: "HAS_DEVELOPED_SOFTWARE_SYSTEM",
    to: "Software_System"
  },

  {
    from: "Organization",
    relationship: "OWNS_DATA",
    to: "Data"
  },

  {
    from: "Software_System",
    relationship: "HAS_DATA",
    to: "Data"
  },

  {
    from: "Software_System",
    relationship: "HAS_AI_MODEL",
    to: "AI_Model"
  },

  {
    from: "Software_System",
    relationship: "HAS_SOFTWARE_USER",
    to: "Software_User"
  },

  {
    from: "Software_System",
    relationship: "HAS_SOFTWARE_COMPONENT",
    to: "Software_Component"
  },



  {
    from: "Software_User",
    relationship: "SOFTWARE_USER_ROLE_TYPE_OF",
    to: "Software_User_Role_Type"
  },

  {
    from: "Software_User",
    relationship: "ASSIGNED_USER",
    to: "Software_User"
  },

  {
    from: "Software_User_Role_Type",
    relationship: "HAS_ACCESS",
    to: "Software_Component"
  },

  {
    from: "Software_Component",
    relationship: "HAS_FUNCTION",
    to: "Function_Type"
  },

  {
    from: "Software_Component",
    relationship: "ACCESS_AI_MODEL",
    to: "AI_Model"
  },

  {
    from: "Software_Component",
    relationship: "ACCESS_DATA",
    to: "Data"
  },

  {
    from: "AI_Model",
    relationship: "TRAINED_ON",
    to: "Data"
  },

  {
    from: "AI_Model",
    relationship: "AI_MODEL_INTENDED_USE_TYPE",
    to: "Use_Type"
  },

  {
    from: "AI_Model",
    relationship: "AI_MODEL_MISUSE_TYPE",
    to: "Use_Type"
  },

  {
    from: "AI_Model",
    relationship: "AI_MODEL_INTENDED_USE_DOMAIN",
    to: "Domain"
  },

  {
    from: "AI_Model",
    relationship: "AI_MODEL_MISUSE_DOMAIN",
    to: "Domain"
  },

  {
    from: "AI_Model",
    relationship: "AI_MODEL_INTENDED_USER",
    to: "User_Type"
  },

  {
    from: "AI_Model",
    relationship: "AI_MODEL_MISUSE_USER",
    to: "User_Type"
  },

  {
    from: "AI_Model",
    relationship: "AI_MODEL_BIAS_TYPE",
    to: "Bias_Type"
  },

  {
    from: "AI_Model",
    relationship: "AI_MODEL_RISK_MITIGATION_TYPE",
    to: "Mitigation_Type"
  },

  {
    from: "AI_Model",
    relationship: "AI_MODEL_BIAS_MITIGATION_TYPE",
    to: "Mitigation_Type"
  },

  {
    from: "AI_Model",
    relationship: "AI_MODEL_RISK_SEVERITY",
    to: "Severity"
  },

  {
    from: "AI_Model",
    relationship: "AI_MODEL_RISK_FACTOR",
    to: "Factor"
  },

  {
    from: "Data",
    relationship: "DATA_INTENDED_USE_TYPE",
    to: "Use_Type"
  },

  {
    from: "Data",
    relationship: "DATA_MISUSE_TYPE",
    to: "Use_Type"
  },

  {
    from: "Data",
    relationship: "DATA_INTENDED_USE_DOMAIN",
    to: "Domain"
  },

  {
    from: "Data",
    relationship: "DATA_MISUSE_DOMAIN",
    to: "Domain"
  },

  {
    from: "Data",
    relationship: "DATA_INTENDED_USER",
    to: "User_Type"
  },

  {
    from: "Data",
    relationship: "DATA_MISUSE_USER",
    to: "User_Type"
  },

  {
    from: "Data",
    relationship: "DATA_BIAS_TYPE",
    to: "Bias_Type"
  },

  {
    from: "Data",
    relationship: "DATA_BIAS_MITIGATION_TYPE",
    to: "Mitigation_Type"
  },

  {
    from: "Data",
    relationship: "DATA_RISK_MITIGATION_TYPE",
    to: "Mitigation_Type"
  },

  {
    from: "Data",
    relationship: "DATA_RISK_SEVERITY",
    to: "Severity"
  },

  {
    from: "Data",
    relationship: "DATA_RISK_FACTOR",
    to: "Factor"
  }

];

// Properties of each node label. The graph model follows the metadata card knowledge graph project
// (cardgraph/graph/schema.py): card nodes have a name and an id, and graphs built by that project
// also a card_id; the sample import package (neo4j_data_importer) uses the same names.
// The first one listed is the label's value, used when a target names no property.
const nodeProperties = {
  AI_Model: ["name", "ai_model_id", "card_id", "model_developer", "training_data_id", "software_system_id"],
  Data: ["name", "data_id", "card_id", "data_owner", "software_system_id"],
  Use_Type: ["use_type", "use_type_id"],
  Domain: ["domain_name", "domain_id"],
  User_Type: ["user_type", "user_type_id"],
  Organization: ["organization_name", "organization_id"],
  Software_System: ["software_system", "software_system_id", "organization_id"],
  Software_Component: ["name", "software_component_id", "card_id", "software_system_id"],
  Software_User: ["name", "software_user_id", "card_id", "software_system_id", "assigned_user"],
  Software_User_Role_Type: ["software_user_role", "software_user_role_type_id"],
  Bias_Type: ["bias_type", "bias_type_id"],
  Mitigation_Type: ["mitigation_type", "mitigation_type_id"],
  Severity: ["severity", "severity_id"],
  Factor: ["factor", "factor_id"],
  Function_Type: ["function_type", "function_type_id"]
};

module.exports = {
  graphEdges,
  nodeProperties
};
