const express = require("express");
const session = require("express-session");
const favicon = require("serve-favicon");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const yup = require("yup");
const monk = require("monk");
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
const { nanoid } = require("nanoid");

require("dotenv").config();

const db = monk(process.env.MONGO_URI);
const urls = db.get("urls");
urls.createIndex(
  {
    alias: 1,
  },
  {
    unique: true,
  }
);

const sessionConfig = {
  secret: "roufroufrouf",
  name: "chiwawer",
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: "strict",
  },
};

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sessionConfig.cookie.secure = true; // serve secure cookies
}

app.use(session(sessionConfig));
app.use(favicon(path.join(__dirname, "public", "ico/favicon.ico")));
app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());
app.use(express.static("./public"));

const notFoundPath = path.join(__dirname, "public/404.html");

app.get("/:id", async (req, res, next) => {
  const { id: alias } = req.params;
  try {
    const url = await urls.findOne({ alias });
    if (url) {
      return res.redirect(url.url);
    }
    return res.status(404).sendFile(notFoundPath);
  } catch (error) {
    return res.status(404).sendFile(notFoundPath);
  }
});

const schema = yup.object().shape({
  alias: yup
    .string()
    .trim()
    .matches(/^[\w\-]+$/i),
  url: yup.string().trim().url().required(),
});

app.post(
  "/url",
  slowDown({
    windowMs: 30 * 1000,
    delayAfter: 1,
    delayMs: 500,
  }),
  rateLimit({
    windowMs: 30 * 1000,
    max: 1,
  }),
  async (req, res, next) => {
    let { alias, url } = req.body;
    try {
      await schema.validate({
        alias,
        url,
      });
      if (url.includes("https://shortner-urls.vercel.app")) {
        throw new Error("Stop it. 🛑");
      }
      if (!alias) {
        alias = nanoid(5);
      } else {
        const existing = await urls.findOne({ alias });
        if (existing) {
          throw new Error("Alias in use. 🍔");
        }
      }
      alias = alias.toLowerCase();
      const newUrl = {
        url,
        alias,
      };
      const created = await urls.insert(newUrl);
      res.json(created);
    } catch (error) {
      next(error);
    }
  }
);

app.use((req, res, next) => {
  res.status(404).sendFile(notFoundPath);
});

app.use((error, req, res, next) => {
  if (error.status) {
    res.status(error.status);
  } else {
    res.status(500);
  }
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : error.stack,
  });
});

const port = process.env.PORT || 1337;

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
