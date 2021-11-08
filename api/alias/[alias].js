// Import Dependencies
const pino = require('pino');
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});
const url = require("url");
const MongoClient = require("mongodb").MongoClient;

// Create cached connection variable
let cachedDb = null;

async function connectToDatabase(uri) {
  // If the database connection is cached,
  // use it instead of creating a new connection
  if (cachedDb) {
    logger.info('Using cacheDb ...');
    return cachedDb;
  }

  // If no connection is cached, create a new one
  const client = await MongoClient.connect(uri,
    {
      useUnifiedTopology: true,
      useNewUrlParser: true
    });

  const db = await client.db(url.parse(uri).pathname.substr(1));

  // Cache the database connection and return the connection
  cachedDb = db;
  return db;
}

module.exports = async (req, res) => {
  const alias = req.query.alias;
  const query = {
    alias: alias,
  };

  logger.info('Requesing alias redirect', query);

  const db = await connectToDatabase(process.env.MONGO_URI);

  const collection = await db.collection("urls");

  const url = await collection.findOne(query);

  if (url) {
    logger.info({
      db: {
        message: "Find one by alias",
        location: "api/alias/[alias].js",
        method: "findOne",
        query: query,
        data: url,
      },
      event: {
        type: "request",
        tag: "db",
      },
    });

    res.setHeader("Cache-Control", "s-maxage=3600");
    return res.status(200).redirect(url.url);
  }

  const proto = req.headers['x-forwarded-proto'] + req.headers['x-forwarded-port'];
  const host = req.headers['x-vercel-deployment-url'] + '/#/aliasNotFound?aliasError=' + query.alias;

  res.setHeader("Cache-Control", "s-maxage=3600");
  res.status(200).redirect(proto + host);

};
