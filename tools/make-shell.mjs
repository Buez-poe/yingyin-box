import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] || ".");
const raw = path.join(root, "downloads", "yingyin-box-v5.7.html");
const out = path.join(root, "src", "shell.html");
const html = fs.readFileSync(raw, "utf8");
const s1 = html.indexOf("<script>");
const e1 = html.indexOf("</script>", s1);
const s2 = html.indexOf("<script>", e1);
const e2 = html.indexOf("</script>", s2);
if (s1 < 0 || e1 < 0 || s2 < 0 || e2 < 0) throw new Error("script markers not found");
const shell =
  html.slice(0, s1) +
  "<script>/*__APP_JS__*/</script>" +
  html.slice(e1 + "</script>".length, s2) +
  "<script>/*__I18N_JS__*/</script>" +
  html.slice(e2 + "</script>".length);
fs.writeFileSync(out, shell, "utf8");
console.log("shell bytes", Buffer.byteLength(shell));
