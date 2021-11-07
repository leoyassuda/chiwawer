const pino = require('pino');
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});
const yup = require("yup");
const monk = require("monk");
const { nanoid } = require("nanoid");

require("dotenv").config();

const db = monk(process.env.MONGO_URI);
const urls = db.get("urls");

db.then(() => {
  // TODO: see a better structure for class logs
  logger.info({
    db: {
      message: "Connected correctly to server",
      location: "api/urls/index.js",
      method: "db.callback.connection",
    },
    event: {
      type: "request",
      tag: "db",
    },
  });
});

urls.createIndex(
  {
    alias: 1,
  },
  {
    unique: true,
  }
);

const schema = yup.object().shape({
  alias: yup
    .string()
    .trim()
    .matches(/^[\w\-]+$/i),
  url: yup.string().trim().url().required(),
});

module.exports = async (req, res) => {
  let { alias, url } = req.body;

  try {
    await schema.validate({
      alias,
      url,
    });
    if (url.includes('chiwawer.vercel.app') || url.includes('tinyly.link')) {
      throw new Error("Stop it. 🛑🙅‍♀️");
    }
    if (!alias) {
      alias = nanoid(5);
    } else {
      const existing = await urls.findOne({
        alias,
      });
      if (existing) {
        throw new Error("Alias already in use! 🤷‍♀️");
      }
    }
    alias = alias.toLowerCase();
    const newUrl = {
      url,
      alias,
    };
    const created = await urls.insert(newUrl);

    logger.info({
      db: {
        message: "Created url",
        location: "api/urls/index.js",
        method: "db.urls.insert",
      },
      event: {
        type: "request",
        tag: "db",
      },
    });

    res.json(created);
  } catch (error) {
    logger.error({
      api: {
        message: "Error to create url",
        location: "api/urls/index.js",
        method: "db.urls.insert",
        stack: error.message,
      },
      event: {
        type: "request",
        tag: "db",
      },
    });
    res.status(500).send({
      message: "Something is wrong to create a url",
      error: error.message,
    });
  }
};
