const express = require("express");
const favicon = require("serve-favicon");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const yup = require("yup");
const monk = require("monk");
const { nanoid } = require("nanoid");

require("dotenv").config();

const db = monk(process.env.MONGO_URI);
const urls = db.get("urls");
urls.createIndex(
  {
    slug: 1,
  },
  {
    unique: true,
  }
);

const app = express();
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());
app.use(express.static("./public"));

// app.get("/", (req, res) => {
//   res.json({
//     message: "shortfy-url | Short Urls for your",
//   });
// });

// app.get("/url/:id", (req, res) => {
//   // TODO: get short url by id
// });

app.get("/:id", async (req, res, next) => {
  const { id: slug } = req.params;

  console.log(">>> params: ", req.params);

  try {
    const url = await urls.findOne({
      slug,
    });

    console.log(">>> slog:", slug);
    console.log(">>> url:", url);

    if (url) {
      console.log(">>>>>>>>>>>>>> url:", url.url);
      res.redirect(url.url);
    }
    res.redirect(`/?error=${slug} not found`);
  } catch (error) {
    console.log("<<<<<< error", error);
    res.redirect(`/?error=Link not found`);
  }
});

const schema = yup.object().shape({
  slug: yup
    .string()
    .trim()
    .matches(/[\w\-]/i),
  url: yup.string().trim().url().required(),
});

app.post("/url", async (req, res, next) => {
  let { slug, url } = req.body;
  try {
    await schema.validate({
      slug,
      url,
    });
    if (!slug) {
      slug = nanoid(5);
    }
    slug = slug.toLowerCase();
    const newUrl = {
      url,
      slug,
    };
    const created = await urls.insert(newUrl);
    res.json(created);
  } catch (error) {
    if (error.message.startsWith("E11000")) {
      error.message = "Slug in use. 🍔";
    }
    next(error);
  }
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
