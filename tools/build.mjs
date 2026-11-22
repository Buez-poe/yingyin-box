import fs from "node:fs";
import path from "node:path";
import { execFileSync, execSync } from "node:child_process";

const root = path.resolve(process.argv[2] || ".");
const src = path.join(root, "src");
const shellPath = path.join(src, "shell.html");
const appPath = path.join(src, "app.js");
const i18nPath = path.join(src, "i18n.js");
const outDir = path.join(root, "downloads");
const version = "v6.0";
const outPath = path.join(outDir, `yingyin-box-${version}.html`);
const onlinePath = path.join(root, "app.html");

function gitCommit() {
  if (process.env.BUILD_COMMIT) return process.env.BUILD_COMMIT.trim();
  const candidates = [
    process.env.GIT_EXE,
    "git",
    path.join(process.env.LOCALAPPDATA || "", "Temp", "MinGit-2.56.1", "cmd", "git.exe"),
  ].filter(Boolean);
  for (const exe of candidates) {
    try {
      const out = execFileSync(exe, ["-C", root, "rev-parse", "--short=12", "HEAD"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
      if (out) return out;
    } catch {}
  }
  return "local";
}

function minify(code) {
  try {
    const out = execSync(
      "npx --yes terser@5.44.0 -c -m --comments false",
      { input: code, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
    );
    return out.trim();
  } catch (e) {
    console.warn("terser failed, using formatted JS:", e.message);
    return code;
  }
}

const commit = gitCommit();
const now = new Date();
const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
const buildDate = process.env.BUILD_DATE || localDate;
const app = fs
  .readFileSync(appPath, "utf8")
  .replaceAll("__BUILD_COMMIT__", commit)
  .replaceAll("__BUILD_DATE__", buildDate);
const i18n = fs.readFileSync(i18nPath, "utf8");
let shell = fs
  .readFileSync(shellPath, "utf8")
  .replaceAll("__BUILD_COMMIT__", commit)
  .replaceAll("__BUILD_DATE__", buildDate);

const safe = (code) => code.replace(/<\/script/gi, "<\\/script");
const appMin = safe(minify(app));
const i18nMin = safe(minify(i18n));
shell = shell.replace(
  "<script>/*__APP_JS__*/</script>",
  () => `<script>${appMin}</script>`,
);
shell = shell.replace(
  "<script>/*__I18N_JS__*/</script>",
  () => `<script>${i18nMin}</script>`,
);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, shell, "utf8");
fs.writeFileSync(onlinePath, shell, "utf8");
console.log(JSON.stringify({ outPath, onlinePath, bytes: Buffer.byteLength(shell), commit, buildDate }, null, 2));
