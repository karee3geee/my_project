const http = require("http");
const fs   = require("fs");
const path = require("path");
const PORT = 3000;
const MIME = {
  ".html":"text/html; charset=utf-8", ".css":"text/css", ".js":"text/javascript",
  ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".png":"image/png", ".webp":"image/webp",
  ".svg":"image/svg+xml", ".json":"application/json", ".pdf":"application/pdf",
  ".mp4":"video/mp4", ".webm":"video/webm"
};
http.createServer((req, res) => {
  let p = req.url.split("?")[0]; if (p === "/") p = "/index.html";
  if (p === "/admin" || p === "/admin/") p = "/admin.html";
  const file = path.join(__dirname, p);
  const mime = MIME[path.extname(file).toLowerCase()] || "application/octet-stream";
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(err.code==="ENOENT"?404:500,{"Content-Type":"text/html"}); res.end("<h1>"+(err.code==="ENOENT"?"404 Not Found":"Server Error")+"</h1>"); }
    else { res.writeHead(200,{"Content-Type":mime,"Cache-Control":"no-cache"}); res.end(data); }
  });
}).listen(PORT, () => console.log("Server running at http://localhost:" + PORT + "/"));