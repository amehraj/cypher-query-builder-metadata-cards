const test = require('node:test');
const assert = require('node:assert/strict');

const { buildQuery } = require('../queryBuilder');

test('buildQuery supports multiple target conditions with AND clauses', () => {
  const { cypher, params } = buildQuery({
    analysisNode: 'Software_System',
    targets: [
      {
        targetNode: 'Severity',
        targetRelationship: 'DATA_RISK_SEVERITY',
        targetProperty: 'severity',
        targetValue: 'High'
      },
      {
        targetNode: 'Domain',
        targetRelationship: 'AI_MODEL_INTENDED_USE_DOMAIN',
        targetProperty: 'domain_name',
        targetValue: 'Object Recognition'
      }
    ]
  });

  assert.match(cypher, /MATCH \(sof0:Software_System\)/);
  assert.match(cypher, /MATCH \(sof0\)-\[:HAS_DATA\]->\([^)]*:Data\)/);
  assert.match(cypher, /\[:DATA_RISK_SEVERITY\]/);
  assert.match(cypher, /\[:HAS_AI_MODEL\]/);
  assert.match(cypher, /\[:AI_MODEL_INTENDED_USE_DOMAIN\]/);
  assert.match(cypher, /WHERE .*\.severity = \$value0 AND .*\.domain_name = \$value1/s);
  assert.deepEqual(params, { value0: 'High', value1: 'Object Recognition' });
  assert.match(cypher, /RETURN DISTINCT sof0/);
});

// Issue 1: two conditions ending at the same label must not be forced onto one node.
test('conditions ending at the same label get their own variables', () => {
  const { cypher } = buildQuery({
    analysisNode: 'Software_System',
    targets: [
      { targetNode: 'Use_Type', targetRelationship: 'DATA_INTENDED_USE_TYPE', targetValue: 'Medical Diagnosis' },
      { targetNode: 'Use_Type', targetRelationship: 'AI_MODEL_INTENDED_USE_TYPE', targetValue: 'Emotion Classification' }
    ]
  });
  const dataUse = cypher.match(/\[:DATA_INTENDED_USE_TYPE\]->\((\w+):Use_Type\)/)[1];
  const modelUse = cypher.match(/\[:AI_MODEL_INTENDED_USE_TYPE\]->\((\w+):Use_Type\)/)[1];
  assert.notEqual(dataUse, modelUse);
  assert.match(cypher, new RegExp(`${dataUse}\\.use_type = \\$value0 AND ${modelUse}\\.use_type = \\$value1`));
});

test('conditions through the same route share that hop (the same dataset)', () => {
  const { cypher } = buildQuery({
    analysisNode: 'Software_System',
    targets: [
      { targetNode: 'Severity', targetRelationship: 'DATA_RISK_SEVERITY', targetValue: 'High' },
      { targetNode: 'Use_Type', targetRelationship: 'DATA_INTENDED_USE_TYPE', targetValue: 'Medical Diagnosis' }
    ]
  });
  assert.equal((cypher.match(/\[:HAS_DATA\]/g) || []).length, 1);
});

// Issue 2: values travel as parameters; labels, relationships and properties are checked.
test('values are parameters, never part of the query text', () => {
  const tricky = 'High\\" OR true //';
  const { cypher, params } = buildQuery({
    analysisNode: 'Software_System',
    targets: [{ targetNode: 'Severity', targetRelationship: 'DATA_RISK_SEVERITY', targetValue: tricky }]
  });
  assert.ok(!cypher.includes('OR true'));
  assert.equal(params.value0, tricky);
});

test('unknown labels, relationships and properties are refused', () => {
  const base = { analysisNode: 'Software_System' };
  assert.throws(() => buildQuery({ ...base, targets: [{ targetNode: 'Severity) DETACH DELETE (x', targetValue: 'High' }] }), /Unknown targetNode/);
  assert.throws(() => buildQuery({ analysisNode: 'Nope', targets: [{ targetNode: 'Severity', targetValue: 'High' }] }), /Unknown analysisNode/);
  assert.throws(() => buildQuery({ ...base, targets: [{ targetNode: 'Severity', targetRelationship: 'NOT_A_REL', targetValue: 'High' }] }), /Unknown targetRelationship/);
  assert.throws(() => buildQuery({ ...base, targets: [{ targetNode: 'Domain', targetProperty: 'domain', targetValue: 'x' }] }), /not a property of Domain/);
  // a relationship that exists but does not lead to the target node is an error, not a silent other path
  assert.throws(() => buildQuery({ ...base, targets: [{ targetNode: 'Severity', targetRelationship: 'DATA_INTENDED_USE_TYPE', targetValue: 'High' }] }), /No path/);
});

// Issue 4: the property defaults to the label's value property from the graph model.
test('the property defaults to the label value property', () => {
  const { cypher } = buildQuery({
    analysisNode: 'AI_Model',
    targets: [{ targetNode: 'Domain', targetRelationship: 'AI_MODEL_INTENDED_USE_DOMAIN', targetValue: 'Healthcare' }]
  });
  assert.match(cypher, /\.domain_name = \$value0/);
});

// Graph model of the metadata card knowledge graph project: ASSIGNED_USER, card names in `name`.
test('the graph model uses ASSIGNED_USER and card names in name', () => {
  const { cypher } = buildQuery({
    analysisNode: 'Software_User',
    targets: [{ targetNode: 'Software_User', targetRelationship: 'ASSIGNED_USER', targetValue: 'Doctor 1' }]
  });
  assert.match(cypher, /\[:ASSIGNED_USER\]->\(\w+:Software_User\)/);
  assert.match(cypher, /\.name = \$value0/);
  assert.throws(() => buildQuery({
    analysisNode: 'Software_User',
    targets: [{ targetNode: 'Software_User', targetRelationship: 'ASSIGNED_DOCTOR', targetValue: 'x' }]
  }), /Unknown targetRelationship/);
});

test('every entry of analysis_requirement_list.js builds a query', () => {
  const list = require('../analysis_requirement_list');
  assert.equal(new Set(list.map(r => r.id)).size, list.length);
  for (const entry of list) {
    assert.ok(entry.requirement && Array.isArray(entry.expected), `entry ${entry.id}`);
    const { cypher, params } = buildQuery(entry.request);
    assert.equal(Object.keys(params).length, entry.request.targets.length, `entry ${entry.id}`);
    assert.match(cypher, /RETURN DISTINCT/);
  }
});
