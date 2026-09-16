const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = process.argv[2];
const port = Number(process.argv[3] || 4321);
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ttf": "font/ttf",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".txt": "text/plain",
};

http
  .createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    let file = path.join(root, url);
    if (url.endsWith("/")) file = path.join(file, "index.html");
    if (!file.startsWith(root)) {
      res.writeHead(403).end();
      return;
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        console.log("404", url);
        res.writeHead(404, { "content-type": "text/plain" }).end("not found");
        return;
      }
      console.log("200", url);
      res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream" });
      res.end(data);
    });
  })
  .listen(port, () => console.log(`serving ${root} on http://localhost:${port}`));
