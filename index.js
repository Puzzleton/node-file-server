require("dotenv").config();

console.log(process.env);

const express = require("express");
const app = express();

const fs = require("fs");

const uuid = require("uuid/v4");
const password = process.env.PASSWORD || uuid();
const auth = require("./helpers/auth");

// const privateKey = fs.readFileSync("server.key").toString();
// const certificate = fs.readFileSync("server.crt").toString();
// const credentials = { key: privateKey, cert: certificate };

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <link rel="stylesheet" href="/styles.css" />
        <title>${process.env.TITLE}</title>
      </head>

      <body>
        <form action="/file">
          <h1>${process.env.TITLE}</h1>
          <input type="text" name="password" placeholder="Password" />
          <input type="submit" value="Login" />
        </form>
      </body>
    </html>
  `);
});

app.get("/styles.css", (req, res) => {
  res.sendFile("styles.css", { root: "./" });
});

app.get("/upload", auth(password), (req, res) => {});

app.get("/file", auth(password), (req, res) => {
  const items = fs.readdirSync(`./public`);
  let response = `
      <html>
        <head>
          <link rel="stylesheet" href="/styles.css" />
          <title>${process.env.TITLE}</title>
        </head>

        <body>
          <div>
    `;

  for (var i = 0; i < items.length; i++) {
    const itemStats = fs.statSync(`./public/${items[i]}`);
    if (items[i] !== ".DS_Store") {
      response = response.concat(`
          <div>
            <a href="/file/${items[i]}?password=${req.query.password}">
              ${items[i]}${itemStats.isDirectory() ? "/" : ""}
            </a>
          </div>
        `);
    }
  }

  response = response.concat(`
          </div>
        </body>
      </html>
    `);

  res.send(response);
});

app.get("/file/*", auth(password), (req, res) => {
  const path = req.params[0] ? req.params[0] : "index.html";

  const stats = fs.statSync(`./public/${path}`);
  if (stats.isDirectory()) {
    const items = fs.readdirSync(`./public/${path}`);
    const pathArray = path.split("/");
    const parentDirectory = pathArray.slice(0, pathArray.length - 1).join("/");
    let response = `
      <html>
        <head>
          <link rel="stylesheet" href="/styles.css" />
          <title>${process.env.TITLE}</title>
        </head>

        <body>
          <div>
            <div>
              <a href="/file/${parentDirectory}?password=${
      req.query.password
    }">../</a>
            </div>
    `;

    for (var i = 0; i < items.length; i++) {
      const itemStats = fs.statSync(`./public/${path}/${items[i]}`);
      if (items[i] !== ".DS_Store") {
        response = response.concat(`
          <div>
            <a href="/file/${path}/${items[i]}?password=${
          req.query.password
        }">${items[i]}${itemStats.isDirectory() ? "/" : ""}
            </a>
          </div>
        `);
      }
    }

    response = response.concat(`
          </div>
        </body>
      </html>
    `);

    res.send(response);
  } else {
    res.sendFile(path, { root: "./public" });
  }
});

const server = app.listen(process.env.PORT || 8080, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log(`running http://${host}:${port}`);
  console.log(`password: ${password}`);
});
