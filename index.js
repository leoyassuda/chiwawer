const express = require("express");
const favicon = require("serve-favicon");
const path = require("path");
const cors = require("cors");
const logger = require("pino")();

require("dotenv").config();

const app = express();

const allowlist = ["http://localhost", "https://chiwawer.vercel.app"];

app.use((req, res, next) => {
  //Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
  res.header("Access-Control-Allow-Origin", allowlist);
  //Quais são os métodos que a conexão pode realizar na API
  res.header("Access-Control-Allow-Methods", "GET,POST");
  app.use(cors());
  next();
});

app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(express.json());
app.use(express.static("./public"));

const notFoundPath = path.join(__dirname, "public/404.html");

app.get("/:id", async (req, res, next) => {
  const { id: alias } = req.params;

  logger.info({
    db: {
      message: "Get url bt Alias",
      location: "server/index.js",
      method: "get by alias",
      data: alias,
    },
    event: {
      type: "request",
      tag: "server",
    },
  });

  try {
    await fetch(`/api/alias/${alias}`)
      .then(function (response) {
        if (response.ok) {
          const result = response.json();
          return res.redirect(result.url);
        } else {
          return res.status(404).sendFile(notFoundPath);
        }
      })
      .catch(function (error) {
        logger.error({
          api: {
            message: "Error to fetch url by alias",
            location: "server/index.js",
            method: "get[id]",
            stack: error,
          },
          event: {
            type: "request",
            tag: "server",
          },
        });
        return res.status(404).sendFile(notFoundPath);
      });
  } catch (error) {
    return res.status(404).sendFile(notFoundPath);
  }
});

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
  logger.info({
    db: {
      message: `Listening at http://localhost:${port}`,
      location: "server/index.js",
      method: "app.listen",
    },
    event: {
      type: "request",
      tag: "server",
    },
  });
  console.log(`Listening at http://localhost:${port}`);
});
