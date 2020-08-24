const logger = require("pino")();
const monk = require("monk");

require("dotenv").config();

let cachedDB;

async function connectMongo(uri) {
  if (cachedDB) {
    return cachedDB;
  }

  const db = await monk(uri);

  db.then(() => {
    // TODO: see a better structure for class logs
    logger.info({
      db: {
        message: "Connected correctly to server",
        location: "api/alias/[alias].js",
        method: "db.callback.connection",
      },
      event: {
        type: "request",
        tag: "db",
      },
    });
  });

  cachedDB = db;
  return db;
}

// api/[alias].js
module.exports = async (req, res) => {
  const alias = req.query.alias;

  logger.info({
    db: {
      message: "api get url by alias",
      location: "api/alias/[alias].js",
      method: "find by alias",
      data: alias,
    },
    event: {
      type: "request",
      tag: "api",
    },
  });

  try {
    const db = await connectMongo(process.env.MONGO_URI);
    const urls = db.get("urls");

    const url = await urls.findOne(
      {
        alias,
      },
      {
        timeout: false,
      }
    );

    logger.info({
      db: {
        message: "api get url by alias",
        location: "api/alias/[alias].js",
        method: "findOne",
        data: url,
      },
      event: {
        type: "request",
        tag: "db",
      },
    });

    return url;
  } catch (error) {
    logger.error({
      api: {
        message: "Error find one [alias]",
        location: "api/alias/[alias].js",
        method: "db.urls.findOne",
        stack: error.message,
      },
      event: {
        type: "request",
        tag: "db",
      },
    });
    res.status(500).send({
      message: "Something is wrong to find one url",
      error: error.message,
    });
  }
};
