const fs = require("fs");
const path = require("path");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm"
};

module.exports = (req, res) => {
  let p = req.url.split("?")[0];

  // Remove /api from the beginning
  if (p === "/api" || p.startsWith("/api/")) {
    p = p.substring(4) || "/";
  }

  if (p === "/") p = "/index.html";
  if (p === "/admin" || p === "/admin/") p = "/admin.html";

  const filePath = path.join(
    __dirname,
    "..",
    p.replace(/^\//, "")
  );

  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end("404 Not Found");
      return;
    }

    res.setHeader("Content-Type", mime);
    res.setHeader("Cache-Control", "no-cache");
    res.end(data);
  });
};