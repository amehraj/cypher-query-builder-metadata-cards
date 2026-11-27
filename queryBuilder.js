const { findPath, findPathToNodeWithOutgoingRelationship } = require("./pathFinder");
const { graphEdges, nodeProperties } = require("./graphModel");

const LABELS = new Set(Object.keys(nodeProperties));
const RELATIONSHIPS = new Set(graphEdges.map(edge => edge.relationship));

// Labels and relationship types cannot be query parameters, so they are checked against the
// graph model before they are written into the query; values always travel as parameters.
function checkLabel(label, role) {
  if (!LABELS.has(label)) {
    throw new Error(`Unknown ${role} "${label}". Known labels: ${[...LABELS].join(", ")}`);
  }
}

function resolveProperty(label, property) {
  const known = nodeProperties[label];
  if (property === undefined || property === null || property === "") {
    return known[0];
  }
  if (!known.includes(property)) {
    throw new Error(`"${property}" is not a property of ${label}. Its properties: ${known.join(", ")}`);
  }
  return property;
}

function buildQuery(request) {
  const { analysisNode, conditions } = request;

  if (!Array.isArray(conditions) || conditions.length === 0) {
    throw new Error("A request needs a non-empty conditions array");
  }
  if (!analysisNode) {
    throw new Error("An analysisNode is required to build a query");
  }
  checkLabel(analysisNode, "analysisNode");

  const resolvedTargets = conditions.map((condition) => {
    const {
      targetNode: conditionTargetNode,
      targetProperty: conditionTargetProperty,
      targetValue: conditionTargetValue,
      targetRelationship: conditionTargetRelationship
    } = condition;

    if (!conditionTargetNode || conditionTargetValue === undefined) {
      throw new Error("Each target condition must include targetNode and targetValue");
    }
    checkLabel(conditionTargetNode, "targetNode");
    const property = resolveProperty(conditionTargetNode, conditionTargetProperty);

    let path = null;
    if (conditionTargetRelationship) {
      if (!RELATIONSHIPS.has(conditionTargetRelationship)) {
        throw new Error(`Unknown targetRelationship "${conditionTargetRelationship}"`);
      }
      const found = findPathToNodeWithOutgoingRelationship(analysisNode, conditionTargetRelationship, conditionTargetNode);
      if (!found) {
        throw new Error(
          `No path from ${analysisNode} that ends with ${conditionTargetRelationship} into ${conditionTargetNode}`
        );
      }
      path = found.path.concat(found.outgoingEdge);
    } else {
      path = findPath(analysisNode, conditionTargetNode);
      if (!path) {
        throw new Error(`No path found from ${analysisNode} to ${conditionTargetNode}`);
      }
    }

    return { property, value: conditionTargetValue, path };
  });

  // One variable per node position: a hop reached by the same route (the same relationships from
  // the analysis node) is shared by every condition that takes it, so two conditions through the
  // same dataset hold on the same dataset. The final value node of each condition gets its own
  // variable, so two conditions ending at the same label (e.g. Use_Type reached through Data and
  // through AI_Model) never have to be the same node.
  const variables = new Map();
  let counter = 0;

  function variable(key, label) {
    if (!variables.has(key)) {
      variables.set(key, label.toLowerCase().replace(/[^a-z]/g, "").substring(0, 3) + counter++);
    }
    return variables.get(key);
  }

  const analysisVariable = variable("root", analysisNode);
  const lines = [`MATCH (${analysisVariable}:${analysisNode})`];
  const emitted = new Set();
  const params = {};
  const whereClauses = [];

  resolvedTargets.forEach((condition, index) => {
    let fromKey = "root";
    condition.path.forEach((edge, step) => {
      const isLast = step === condition.path.length - 1;
      const toKey = isLast ? `target${index}` : `${fromKey}/${edge.relationship}>${edge.to}`;
      const line = `MATCH (${variables.get(fromKey)})-[:${edge.relationship}]->(${variable(toKey, edge.to)}:${edge.to})`;
      if (!emitted.has(line)) {
        lines.push(line);
        emitted.add(line);
      }
      fromKey = toKey;
    });
    const param = `value${index}`;
    params[param] = condition.value;
    whereClauses.push(`${variables.get(`target${index}`)}.${condition.property} = $${param}`);
  });

  lines.push(`WHERE ${whereClauses.join(" AND ")}`);
  // DISTINCT: an element reached through several matching paths is returned once.
  lines.push(`RETURN DISTINCT ${analysisVariable}`);

  return { cypher: lines.join("\n") + "\n", params };
}

module.exports = {
  buildQuery
};
