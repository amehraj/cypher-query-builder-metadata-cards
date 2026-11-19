// Sample knowledge graph built by hand from the four files in metadata_cards/.
// Graph model: schema.js (same as the metadata card knowledge graph project).
// Load it with `npm run seed` (database in .env), or paste it into the Neo4j Aura Query tab.
// Start from an empty database. Every statement uses MERGE, so running the file twice does not
// duplicate anything.
//
// Values are taken from the cards and written in the graph's reference spelling (for example
// "view_record" -> "View Record"). Lines marked INTERPRETATION are a reading of the card, not a
// value the card names directly. Not in the cards: the software system and its owner (the TAYS
// hospital scenario), the users' display names, and validity dates of system links.

// ---- organisations and the software system ------------------------------------------------
MERGE (o:Organization {organization_id: "organization_tays"}) SET o.organization_name = "TAYS";
MERGE (o:Organization {organization_id: "organization_nvidia"}) SET o.organization_name = "NVIDIA";       // model_1 model_details.provider
MERGE (o:Organization {organization_id: "organization_google"}) SET o.organization_name = "Google";       // data_2 authorship.publisher google_llc
MERGE (s:Software_System {software_system_id: "software_system_tays"}) SET s.software_system = "TAYS Software System";
MATCH (o:Organization {organization_id: "organization_tays"}), (s:Software_System {software_system_id: "software_system_tays"})
MERGE (o)-[:HAS_DEVELOPED_SOFTWARE_SYSTEM]->(s);

// ---- model_1: EmotionNet (model_cards.json) ------------------------------------------------
MERGE (m:AI_Model {ai_model_id: "ai_model_model_1"}) SET m.card_id = "model_1", m.name = "EmotionNet";
MATCH (o:Organization {organization_id: "organization_nvidia"}), (m:AI_Model {ai_model_id: "ai_model_model_1"})
MERGE (o)-[:HAS_DEVELOPED_AI_MODEL]->(m);
// intended_use.primary / secondary: task, users, domain
MATCH (m:AI_Model {ai_model_id: "ai_model_model_1"})
MERGE (u1:Use_Type {use_type: "Emotion Classification"})     MERGE (m)-[:AI_MODEL_INTENDED_USE_TYPE]->(u1)
MERGE (u2:Use_Type {use_type: "Transfer Learning"})          MERGE (m)-[:AI_MODEL_INTENDED_USE_TYPE]->(u2)
MERGE (d1:Domain {domain_name: "Facial Emotion Recognition"}) MERGE (m)-[:AI_MODEL_INTENDED_USE_DOMAIN]->(d1)
MERGE (d2:Domain {domain_name: "Custom Emotion Datasets"})    MERGE (m)-[:AI_MODEL_INTENDED_USE_DOMAIN]->(d2)
MERGE (r1:User_Type {user_type: "Developer"})                MERGE (m)-[:AI_MODEL_INTENDED_USER]->(r1)
MERGE (r2:User_Type {user_type: "Video Analytics Engineer"}) MERGE (m)-[:AI_MODEL_INTENDED_USER]->(r2)
MERGE (r3:User_Type {user_type: "Researcher"})               MERGE (m)-[:AI_MODEL_INTENDED_USER]->(r3)
MERGE (r4:User_Type {user_type: "ML Engineer"})              MERGE (m)-[:AI_MODEL_INTENDED_USER]->(r4);
// ethical_considerations.bias.excluded_attributes (race, gender, skin type)
MATCH (m:AI_Model {ai_model_id: "ai_model_model_1"})
MERGE (b:Mitigation_Type {mitigation_type: "Excluding Attributes"}) MERGE (m)-[:AI_MODEL_BIAS_MITIGATION_TYPE]->(b);
// safety.risks (misclassification, misuse in sensitive domains), safety.concerns (unstable or occluded landmarks)
MATCH (m:AI_Model {ai_model_id: "ai_model_model_1"})
MERGE (f1:Factor {factor: "Misclassification"}) MERGE (m)-[:AI_MODEL_RISK_FACTOR]->(f1)
MERGE (f2:Factor {factor: "Misuse"})            MERGE (m)-[:AI_MODEL_RISK_FACTOR]->(f2)
MERGE (f3:Factor {factor: "Contextual"})        MERGE (m)-[:AI_MODEL_RISK_FACTOR]->(f3);
// INTERPRETATION: factors.hardware and factors.software list the platforms the model depends on
MATCH (m:AI_Model {ai_model_id: "ai_model_model_1"})
MERGE (f4:Factor {factor: "Hardware"}) MERGE (m)-[:AI_MODEL_RISK_FACTOR]->(f4)
MERGE (f5:Factor {factor: "Software"}) MERGE (m)-[:AI_MODEL_RISK_FACTOR]->(f5);
// safety.measures (encrypted weights, hardware-bound deployment)
MATCH (m:AI_Model {ai_model_id: "ai_model_model_1"})
MERGE (x:Mitigation_Type {mitigation_type: "Security hardening"}) MERGE (m)-[:AI_MODEL_RISK_MITIGATION_TYPE]->(x);
// training_data.dataset is Multi-PIE, which has no data card here: no TRAINED_ON relationship.

// ---- data_1: Patient Records (data_cards.json) ---------------------------------------------
MERGE (d:Data {data_id: "data_data_1"}) SET d.card_id = "data_1", d.name = "Patient Records";
// authorship.publisher is "unknown": owned by the hospital (TAYS) in this scenario
MATCH (o:Organization {organization_id: "organization_tays"}), (d:Data {data_id: "data_data_1"})
MERGE (o)-[:OWNS_DATA]->(d);
// dataset.motivations_and_intentions: intended_use, purpose, domain; summary.user_access
MATCH (d:Data {data_id: "data_data_1"})
MERGE (u1:Use_Type {use_type: "Medical Diagnosis"})          MERGE (d)-[:DATA_INTENDED_USE_TYPE]->(u1)
MERGE (u2:Use_Type {use_type: "Treatment Planning"})         MERGE (d)-[:DATA_INTENDED_USE_TYPE]->(u2)
MERGE (u3:Use_Type {use_type: "Medical Analysis"})           MERGE (d)-[:DATA_INTENDED_USE_TYPE]->(u3)
MERGE (u4:Use_Type {use_type: "Clinical Decision Support"})  MERGE (d)-[:DATA_INTENDED_USE_TYPE]->(u4)
MERGE (dm:Domain {domain_name: "Healthcare"})                MERGE (d)-[:DATA_INTENDED_USE_DOMAIN]->(dm)
MERGE (r1:User_Type {user_type: "Doctor"})                   MERGE (d)-[:DATA_INTENDED_USER]->(r1)
MERGE (r2:User_Type {user_type: "Patient"})                  MERGE (d)-[:DATA_INTENDED_USER]->(r2);
// dataset.extended_use.unsafe_use (educational_model_training)
MATCH (d:Data {data_id: "data_data_1"})
MERGE (x:Use_Type {use_type: "Educational model training"}) MERGE (d)-[:DATA_MISUSE_TYPE]->(x);
// INTERPRETATION: reflections_on_data "misuse_in_non_medical_domains_may_pose_risks_to_individual_privacy"
MATCH (d:Data {data_id: "data_data_1"})
MERGE (x:Domain {domain_name: "Non-Medical"}) MERGE (d)-[:DATA_MISUSE_DOMAIN]->(x)
MERGE (f:Factor {factor: "Privacy"})          MERGE (d)-[:DATA_RISK_FACTOR]->(f);
// INTERPRETATION: summary.sensitivity "high" read as the overall risk severity
MATCH (d:Data {data_id: "data_data_1"})
MERGE (v:Severity {severity: "High"}) MERGE (d)-[:DATA_RISK_SEVERITY]->(v);
// INTERPRETATION: access "restricted", prerequisites "medical_authorization_required", notes on strict privacy guidelines
MATCH (d:Data {data_id: "data_data_1"})
MERGE (x1:Mitigation_Type {mitigation_type: "Usage restrictions"}) MERGE (d)-[:DATA_RISK_MITIGATION_TYPE]->(x1)
MERGE (x2:Mitigation_Type {mitigation_type: "Privacy protection"}) MERGE (d)-[:DATA_RISK_MITIGATION_TYPE]->(x2);

// ---- data_2: Open Images Extended MIAP (data_cards.json) ------------------------------------
MERGE (d:Data {data_id: "data_data_2"}) SET d.card_id = "data_2", d.name = "Open Images Extended MIAP";
MATCH (o:Organization {organization_id: "organization_google"}), (d:Data {data_id: "data_data_2"})
MERGE (o)-[:OWNS_DATA]->(d);
// dataset.motivations_and_intentions: intended_use, domain
MATCH (d:Data {data_id: "data_data_2"})
MERGE (u1:Use_Type {use_type: "Person Detection"})       MERGE (d)-[:DATA_INTENDED_USE_TYPE]->(u1)
MERGE (u2:Use_Type {use_type: "Fairness Evaluation"})    MERGE (d)-[:DATA_INTENDED_USE_TYPE]->(u2)
MERGE (u3:Use_Type {use_type: "Object Detection"})       MERGE (d)-[:DATA_INTENDED_USE_TYPE]->(u3)
MERGE (d1:Domain {domain_name: "Machine Learning"})      MERGE (d)-[:DATA_INTENDED_USE_DOMAIN]->(d1)
MERGE (d2:Domain {domain_name: "Object Recognition"})    MERGE (d)-[:DATA_INTENDED_USE_DOMAIN]->(d2);
// dataset.extended_use.unsafe_use (gender_classification, age_classification)
MATCH (d:Data {data_id: "data_data_2"})
MERGE (x1:Use_Type {use_type: "Gender Classification"}) MERGE (d)-[:DATA_MISUSE_TYPE]->(x1)
MERGE (x2:Use_Type {use_type: "Age Classification"})    MERGE (d)-[:DATA_MISUSE_TYPE]->(x2);
// INTERPRETATION: validation_methods.skew_notes (gender and age presentation skewed) as a sampling bias,
// and the sensitive attributes age and gender as a bias-related risk factor
MATCH (d:Data {data_id: "data_data_2"})
MERGE (b:Bias_Type {bias_type: "Selection/Sampling"}) MERGE (d)-[:DATA_BIAS_TYPE]->(b)
MERGE (f:Factor {factor: "Bias-related"})             MERGE (d)-[:DATA_RISK_FACTOR]->(f);

// ---- software components (component_cards.json) --------------------------------------------
MERGE (c:Software_Component {software_component_id: "software_component_component_1"}) SET c.card_id = "component_1", c.name = "View Record Component";
MERGE (c:Software_Component {software_component_id: "software_component_component_2"}) SET c.card_id = "component_2", c.name = "Add Record Component";
MERGE (c:Software_Component {software_component_id: "software_component_component_3"}) SET c.card_id = "component_3", c.name = "Delete Record Component";
MERGE (c:Software_Component {software_component_id: "software_component_component_4"}) SET c.card_id = "component_4", c.name = "Use Model Component";
// action -> function; data_consent_check -> Check Data Consent; data_source / model_source -> access
MATCH (c1:Software_Component {software_component_id: "software_component_component_1"}),
      (c2:Software_Component {software_component_id: "software_component_component_2"}),
      (c3:Software_Component {software_component_id: "software_component_component_3"}),
      (c4:Software_Component {software_component_id: "software_component_component_4"}),
      (d:Data {data_id: "data_data_1"}), (m:AI_Model {ai_model_id: "ai_model_model_1"})
MERGE (view:Function_Type {function_type: "View Record"})        MERGE (c1)-[:HAS_FUNCTION]->(view)
MERGE (add:Function_Type {function_type: "Insert Record"})       MERGE (c2)-[:HAS_FUNCTION]->(add)
MERGE (consent:Function_Type {function_type: "Check Data Consent"}) MERGE (c2)-[:HAS_FUNCTION]->(consent)
MERGE (del:Function_Type {function_type: "Delete Record"})       MERGE (c3)-[:HAS_FUNCTION]->(del)
MERGE (use:Function_Type {function_type: "Use AI Model"})        MERGE (c4)-[:HAS_FUNCTION]->(use)
MERGE (c1)-[:ACCESS_DATA]->(d)
MERGE (c2)-[:ACCESS_DATA]->(d)
MERGE (c3)-[:ACCESS_DATA]->(d)
MERGE (c4)-[:ACCESS_AI_MODEL]->(m);
// access_roles: the role has access to the component
MATCH (c1:Software_Component {software_component_id: "software_component_component_1"}),
      (c2:Software_Component {software_component_id: "software_component_component_2"}),
      (c3:Software_Component {software_component_id: "software_component_component_3"}),
      (c4:Software_Component {software_component_id: "software_component_component_4"})
MERGE (patient:Software_User_Role_Type {software_user_role: "Patient"})
MERGE (doctor:Software_User_Role_Type {software_user_role: "Doctor"})
MERGE (patient)-[:HAS_ACCESS]->(c1)
MERGE (doctor)-[:HAS_ACCESS]->(c1)
MERGE (patient)-[:HAS_ACCESS]->(c2)
MERGE (patient)-[:HAS_ACCESS]->(c3)
MERGE (doctor)-[:HAS_ACCESS]->(c4);

// ---- software users (user_cards.json) ------------------------------------------------------
// Names come from the role and order (the cards give ids only).
MERGE (u:Software_User {software_user_id: "software_user_user_1"}) SET u.card_id = "user_1", u.name = "Patient 1";
MERGE (u:Software_User {software_user_id: "software_user_user_2"}) SET u.card_id = "user_2", u.name = "Doctor 1";
MERGE (u:Software_User {software_user_id: "software_user_user_3"}) SET u.card_id = "user_3", u.name = "Patient 2";
MATCH (u1:Software_User {software_user_id: "software_user_user_1"}),
      (u2:Software_User {software_user_id: "software_user_user_2"}),
      (u3:Software_User {software_user_id: "software_user_user_3"})
MERGE (patient:Software_User_Role_Type {software_user_role: "Patient"})
MERGE (doctor:Software_User_Role_Type {software_user_role: "Doctor"})
MERGE (u1)-[:SOFTWARE_USER_ROLE_TYPE_OF]->(patient)
MERGE (u2)-[:SOFTWARE_USER_ROLE_TYPE_OF]->(doctor)
MERGE (u3)-[:SOFTWARE_USER_ROLE_TYPE_OF]->(patient)
// assigned_user: user_1 -> user_2. user_3's card names itself (user_3) as its assigned user, which
// looks like a typo for user_2; it is kept as the card states.
MERGE (u1)-[:ASSIGNED_USER]->(u2)
MERGE (u3)-[:ASSIGNED_USER]->(u3);
// user_2's assigned_patient (user_1) has no relationship of its own in the graph model.

// ---- what the system uses ------------------------------------------------------------------
MATCH (s:Software_System {software_system_id: "software_system_tays"})
MATCH (m:AI_Model {ai_model_id: "ai_model_model_1"})
MATCH (d1:Data {data_id: "data_data_1"}), (d2:Data {data_id: "data_data_2"})
MATCH (c:Software_Component) WHERE c.software_component_id STARTS WITH "software_component_component_"
WITH s, m, d1, d2, collect(c) AS components
MATCH (u:Software_User) WHERE u.software_user_id STARTS WITH "software_user_user_"
WITH s, m, d1, d2, components, collect(u) AS users
MERGE (s)-[:HAS_AI_MODEL]->(m)
MERGE (s)-[:HAS_DATA]->(d1)
MERGE (s)-[:HAS_DATA]->(d2)
FOREACH (c IN components | MERGE (s)-[:HAS_SOFTWARE_COMPONENT]->(c))
FOREACH (u IN users | MERGE (s)-[:HAS_SOFTWARE_USER]->(u));
