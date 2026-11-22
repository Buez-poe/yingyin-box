# 影音入库箱 · 中文说明

[English README](README.md) · 在线地址：**https://yingyin-box-site.pages.dev/**

纯静态官网 + 一个最小的 Cloudflare Pages Function（只处理邮件表单）。没有统计、没有第三方脚本。

## 文件结构

```
index.html                        官网首页（单文件，图片已内嵌）
src/shell.html                    软件 HTML 外壳
src/app.js                        软件主逻辑（未压缩）
src/i18n.js                       软件中英文词典
tools/build.mjs                   可复现构建：注入 commit、压缩、拼单文件
tools/make-shell.mjs              从旧版单文件抽壳
build.ps1 / build.sh              构建入口
downloads/yingyin-box-v6.0.html   影音入库箱 v6.0 网页版
downloads/yingyin-box-v6.0.zip    影音入库箱 v6.0 完整包（含使用说明、NFO 示例、manifest 规范）
docs/VERIFY.md                    校验与验签命令
docs/THREAT-MODEL.md              威胁模型一页纸
docs/MANIFEST.md                  manifest.json 规范
functions/api/contact.js          /api/contact 反馈转发（Pages Function）
README.md                         English README
README.zh-CN.md                   本说明（中文）
LICENSE                           MIT 许可证，版权人 a-splash-of-water
```

## v6.0 的核心变化

- 每个 zip 里带 `manifest.json`：记录 version / commit / openlistBase / 条目路径 / 源文件 mtime、size / 标题 / 年份 / 季集 / tmdbid / URL 模板 / 封面来源；不含 Key、密码。
- 下次导入上次 manifest，工具只生成新增和变化条目；未变化跳过，manifest 里有但本次没找到的只列出、默认不删。
- 默认「只新增、不覆盖」：本地 poster.jpg、手写 NFO 不被覆盖；覆盖需要显式开关 + 二次确认。
- strm 写路径模板，不写当时签发的裸直链；换 `openlistBase` 重跑即可复活旧库。
- 页面角落显示「本版构建自 <commit>」，可点击跳到仓库 commit；同一 commit 也写进 manifest。
- 已下载的离线 HTML 永久可用、永不回连、永不因版本更新失效；若未来增加付费服务，已发布版本功能不锁。


## 界面语言

官网和软件右上角都有 `EN / 中文` 切换按钮：官网整页文案、邮件弹窗和主视觉截图会一起切换；软件会切换界面标签、按钮、提示、弹窗和常见日志。语言选择保存在浏览器 `localStorage`（键名 `yingyin_ui_lang`），默认中文，不改变软件原有功能。

English is available via the `EN / 中文` button in the top-right corner of both the website and the app. The choice is stored in `localStorage` (`yingyin_ui_lang`); Chinese remains the default.

## 当前部署

- 平台：Cloudflare Pages（Direct Upload 直传）
- 项目名：`yingyin-box-site`
- 生产分支：`main`
- 在线域名：`https://yingyin-box-site.pages.dev/`
- 无需备案，免费额度足够这个静态站使用。

> Gitee Pages 已于 2024 年下线，不能再作为网页托管；本仓库只保留源码和官网文件。

## 更新线上站点

在项目根目录执行：

```powershell
.\更新官网.ps1
```

它会同步静态文件、复制 `functions/`、推送 Gitee，并用 Wrangler 部署到 Cloudflare Pages。也可以在本目录执行：

```powershell
npx wrangler pages deploy . --project-name yingyin-box-site --branch main
```

需要先在本机配置 Cloudflare 的 `CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID`，Token 只放在本机环境变量或临时文件里，不要提交到仓库。

> 邮件直发表单依赖 `functions/`，必须用 Wrangler 部署；Cloudflare 控制台的“拖拽上传”不会编译 Functions。

## 邮件直发表单

`functions/api/contact.js` 是 Cloudflare Pages Function，负责接收弹窗表单并调用 Resend 发信。Cloudflare Pages 项目需要两个 Secret：

- `CONTACT_TO`：收件邮箱，不写进网页源码。
- `RESEND_API_KEY`：Resend 的发送权限 API Key，只存在 Cloudflare Secret。

可选：

- `CONTACT_FROM`：默认 `影音入库箱官网 <onboarding@resend.dev>`；绑定自己的域名后可以换成自己的发信地址。

设置 Secret：

```powershell
npx wrangler pages secret put CONTACT_TO --project-name yingyin-box-site
npx wrangler pages secret put RESEND_API_KEY --project-name yingyin-box-site
```

不要把 API Key 写进 `index.html`、README、仓库或聊天记录。缺少 `RESEND_API_KEY` 时，接口会返回 503，页面会提示改用“直接打开邮箱”或“复制内容”。

## 改作者信息

打开 `index.html`，拉到最底部，找到：

```js
const SITE_CONFIG = {
  author: "a-splash-of-water",
  emailB64: "你的邮箱的Base64",
  giteeRepo: "https://gitee.com/a-splash-of-water/yingyin-box",
  githubRepo: ""
};
```

- `author`：作者昵称，“关于作者”会同步显示。
- `emailB64`：联系邮箱的 Base64，避免源码出现明文；首屏“邮箱联系”会打开站内写信窗口，常见问题和“关于作者”里保留直接打开邮箱的入口。页面正文不显示邮箱地址。
- `giteeRepo` / `githubRepo`：源码仓库地址。

## 更新版本

1. 在 `gitee-site` 下执行 `.\build.ps1`，产物是 `downloads/yingyin-box-v6.0.html`。
2. 重新打包 `影音入库箱 v6.0/` 目录为 `downloads/yingyin-box-v6.0.zip`。
3. 生成站点根 `SHA256SUMS`，按 `docs/VERIFY.md` 签名。
4. 在 `index.html` 里替换 `__ZIP_SIZE__`、`__ZIP_SHA256__`、`__HTML_SHA256__`、`__BUILD_COMMIT__`。
5. 先在本地打开 `index.html` 检查中英文；再运行 `.\更新官网.ps1` 部署。

发布记录只追加，不覆盖旧版本哈希；见 `docs/VERIFY.md` 表。

## 说明

- 本产品使用 TMDB API，但未获得 TMDB 认可或认证。
- Jellyfin、Emby、OpenList 为各自商标，本文仅说明兼容性，不代表官方合作。
- 本站不接入统计工具。
