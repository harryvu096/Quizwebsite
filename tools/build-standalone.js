/* =====================================================================
   Builds standalone.html — a SINGLE-FILE build of the whole site
   (CSS + JS + all MCQ data inlined). Perfect for:
   - sharing on WhatsApp / downloading to a phone and opening directly
   - viewing through https://htmlpreview.github.io/?<raw-url>
   Usage: node tools/build-standalone.js
   ===================================================================== */
const fs = require("fs");
const path = require("path");
const R = p => fs.readFileSync(path.join(__dirname, "..", p), "utf8");

let html = R("index.html");
const css = R("css/style.css");
const data = R("data/mcqs.js");
const app = R("js/app.js");
const comp = R("js/compiler.js");

for (const [n, c] of [["css", css], ["data", data], ["app", app], ["compiler", comp]]) {
  if (c.includes("</script")) throw new Error(n + " contains </script — cannot inline");
}

const ci = html.indexOf('<link rel="stylesheet" href="css/style.css');
if(ci>=0){ const ce = html.indexOf('>', ci); html = html.slice(0,ci) + "<style>\n" + css + "\n</style>" + html.slice(ce+1); }
const si = html.indexOf('<script src="data/mcqs.js');
if(si>=0){
  const cs = html.indexOf('<script src="js/compiler.js', si);
  const se = html.indexOf('</script>', cs) + 9;
  html = html.slice(0,si) + "<script>\n" + data + "\n</script>\n<script>\n" + app + "\n</script>\n<script>\n" + comp + "\n</script>" + html.slice(se);
}
fs.writeFileSync(path.join(__dirname, "..", "standalone.html"), html);
console.log("standalone.html built:", (html.length / 1024).toFixed(0), "KB");
