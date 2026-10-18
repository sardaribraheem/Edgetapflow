// Local production-export server. Final preview-channel QA still verifies Firebase Hosting itself.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname } from "node:path";
const root = resolve("out");
const types = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".svg":"image/svg+xml", ".png":"image/png", ".webp":"image/webp", ".ico":"image/x-icon", ".txt":"text/plain", ".xml":"application/xml", ".json":"application/json", ".woff2":"font/woff2" };
createServer(async (req,res) => {
  let path;
  try { path = decodeURIComponent(new URL(req.url,"http://localhost").pathname); }
  catch { res.writeHead(400).end(); return; }
  const file = resolve(root, `.${path}`);
  if (file !== root && !file.startsWith(root+"/")) { res.writeHead(403).end(); return; }
  let target = path === "/" ? resolve(root,"index.html") : file;
  let status = 200;
  const exists = async f => { try { return (await stat(f)).isFile(); } catch { return false; } };
  if (!await exists(target)) {
    if (await exists(file+".html")) target = file+".html";
    else if (path.startsWith("/u/")) target = resolve(root,"profile.html");
    else { target = resolve(root,"404.html"); status = 404; }
  }
  try {
    const body = await readFile(target);
    res.writeHead(status,{"Content-Type":types[extname(target)] || "application/octet-stream", "X-Content-Type-Options":"nosniff", ...(path.startsWith("/card-previews/") ? {"Cache-Control":"public, max-age=31536000, immutable"} : {})});
    res.end(body);
  } catch { res.writeHead(500).end("Build the production export first."); }
}).listen(Number(process.env.PORT || 3000),"127.0.0.1", () => console.log("Production export QA: http://127.0.0.1:"+(process.env.PORT || 3000)));
