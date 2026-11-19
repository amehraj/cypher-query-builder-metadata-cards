
const neo4j = require("neo4j-driver");

require("dotenv").config();

const { buildQuery } = require("./queryBuilder");

// `npm start` runs request.js; `npm start -- <number>` runs that entry of analysis_requirement_list.js.
function chooseRequest(arg) {
  if (arg === undefined) {
    return require("./request");
  }
  const entry = require("./analysis_requirement_list").find(r => String(r.id) === arg);
  if (!entry) {
    throw new Error(`No analysis requirement ${arg} in analysis_requirement_list.js`);
  }
  console.log(`\nAnalysis requirement ${entry.id}: ${entry.requirement}`);
  return entry.request;
}

const request = chooseRequest(process.argv[2]);

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME,
    process.env.NEO4J_PASSWORD
  )
);

async function run() {

  const { cypher, params } =
    buildQuery(request);

  console.log(
    "\nGenerated Cypher:\n"
  );

  console.log(cypher);
  console.log("Parameters:", JSON.stringify(params));

  try {
    const serverInfo = await driver.getServerInfo();
    console.log(`Connected to Neo4j server version: ${serverInfo.version}`);

    const result = await driver.executeQuery(cypher, params);


    const jsonData = result.records.map(record => {
      const obj = {};

      record.keys.forEach(key => {
        const value = record.get(key);

        // Convert Neo4j Node to plain object
        if (value && value.properties) {
          obj[key] = {
            id: value.identity?.toString(),
            labels: value.labels,
            ...value.properties,
          };
        } else {
          obj[key] = value;
        }
      });

      return obj;
    });

    console.log(JSON.stringify(jsonData, null, 2));

  } catch (err) {
    console.error('Error querying Neo4j:', err);
  } finally {
    await driver.close();
  }  
}
run();
