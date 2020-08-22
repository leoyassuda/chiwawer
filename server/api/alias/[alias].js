const path = require("path");
const logger = require("pino")();
const monk = require("monk");

require("dotenv").config();

const notFoundPath = path.join(__dirname, "public/404.html");
const db = monk(process.env.MONGO_URI);
const urls = db.get("urls");

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

// api/[alias].js
module.exports = async (req, res) => {
  const alias = req.query.alias;

  try {
    const url = await urls.findOne({
      alias,
    });
    return url;
  } catch (error) {
    logger.error({
      api: {
        message: "Error find one [alias]",
        location: "api/alias/[alias].js",
        method: "db.urls.findOne",
        stack: error,
      },
      event: {
        type: "request",
        tag: "db",
      },
    });
    res.status(500).send({
      message: "Something is wrong to find one url",
      error: error,
    });
  } finally {
    db.close();
  }
};
