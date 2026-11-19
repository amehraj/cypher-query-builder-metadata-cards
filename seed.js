// Loads graph/seed.cypher into the Neo4j database configured in .env: `npm run seed`.
// The statements run in one transaction, so a failure leaves the database unchanged.
const fs = require("node:fs");
const path = require("node:path");
const neo4j = require("neo4j-driver");

require("dotenv").config();

// One statement per ";" at the end of a line; "//" comments are removed first
// (the seed file has no "//" inside strings).
function statements(text) {
  return text
    .split("\n")
    .map(line => line.replace(/\/\/.*$/, "").trimEnd())
    .join("\n")
    .split(/;\s*$/m)
    .map(s => s.trim())
    .filter(Boolean);
}

async function seed() {
  const file = path.join(__dirname, "graph", "seed.cypher");
  const queries = statements(fs.readFileSync(file, "utf8"));
  const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
  );
  const session = driver.session();
  try {
    await session.executeWrite(async tx => {
      for (const query of queries) {
        await tx.run(query);
      }
    });
    const counts = await session.run("MATCH (n) RETURN count(n) AS nodes");
    const rels = await session.run("MATCH ()-[r]->() RETURN count(r) AS relationships");
    console.log(`Loaded ${queries.length} statements from graph/seed.cypher: ` +
      `${counts.records[0].get("nodes")} nodes, ${rels.records[0].get("relationships")} relationships in the database.`);
  } finally {
    await session.close();
    await driver.close();
  }
}

if (require.main === module) {
  seed().catch(err => {
    console.error("Seeding failed, nothing was written:", err.message);
    process.exitCode = 1;
  });
}

module.exports = { statements };
