const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { statements } = require('../seed');
const { graphEdges, nodeProperties } = require('../schema');

const text = fs.readFileSync(path.join(__dirname, '..', 'graph', 'seed.cypher'), 'utf8');
const queries = statements(text);

test('the seed file splits into statements without comments', () => {
  assert.ok(queries.length > 20);
  for (const q of queries) {
    assert.ok(!q.includes('//'), q.slice(0, 60));
    assert.match(q, /^(MERGE|MATCH)/);
  }
});

test('the seed file only uses labels, relationships and properties of the graph model', () => {
  const relationships = new Set(graphEdges.map(e => e.relationship));
  for (const [, rel] of text.matchAll(/\[:([A-Z_]+)\]/g)) {
    assert.ok(relationships.has(rel), `unknown relationship ${rel}`);
  }
  for (const [, label, props] of text.matchAll(/\(\w+:([A-Za-z_]+)\s*\{([^}]*)\}\)/g)) {
    assert.ok(label in nodeProperties, `unknown label ${label}`);
    for (const [, prop] of props.matchAll(/(\w+):/g)) {
      const known = nodeProperties[label].concat(['ai_model_id', 'data_id', 'software_component_id', 'software_user_id']);
      assert.ok(known.includes(prop), `${prop} is not a property of ${label}`);
    }
  }
});
