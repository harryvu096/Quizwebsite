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

html = html.replace(/<link rel="stylesheet" href="css\/style\.css(\?[^"]*)?">/,
  "<style>\n" + css + "\n</style>");
html = html.replace(/<script src="data\/mcqs\.js(\?[^"]*)?<\/script>\s*<script src="js\/app\.js(\?[^"]*)?"><\/script>\s*<script src="js\/compiler\.js(\?[^"]*)?"><\/script>/,
  "<script>\n" + data + "\n</script>\n<script>\n" + app + "\n</script>\n<script>\n" + comp + "\n</script>");
fs.writeFileSync(path.join(__dirname, "..", "standalone.html"), html);
console.log("standalone.html built:", (html.length / 1024).toFixed(0), "KB");
