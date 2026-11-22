# 影音入库箱 · 官网

在线地址：**https://yingyin-box-site.pages.dev/**

纯静态官网，给国内小白用户看。没有后端、没有统计、没有第三方脚本。

## 文件结构

```
index.html                        官网首页（单文件，图片已内嵌）
downloads/yingyin-box-v5.7.html   影音入库箱 v5.7 网页版
downloads/yingyin-box-v5.7.zip    影音入库箱 v5.7 完整包
README.md                         本说明
LICENSE                           MIT 许可证
部署说明.txt                      部署与更新步骤
```

## 当前部署

- 平台：Cloudflare Pages（Direct Upload 直传）
- 项目名：`yingyin-box-site`
- 生产分支：`main`
- 在线域名：`https://yingyin-box-site.pages.dev/`
- 无需备案，免费额度足够这个静态站使用。

> Gitee Pages 已于 2024 年下线，不能再作为网页托管；本仓库只保留源码和官网文件。

## 更新线上站点

在本目录执行：

```powershell
npx wrangler pages deploy . --project-name yingyin-box-site --branch main
```

需要先在本机配置 Cloudflare 的 `CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID`，Token 只放在本机环境变量或临时文件里，不要提交到仓库。

也可以在 Cloudflare 控制台进入 `Workers & Pages → yingyin-box-site → 创建新部署`，选择“上传静态文件”，把本目录整体拖进去。

## 改作者信息

打开 `index.html`，拉到最底部，找到：

```js
const SITE_CONFIG = {
  author: "影音入库箱作者",
  email: "3037422104@qq.com",
  giteeRepo: "https://gitee.com/a-splash-of-water/yingyin-box",
  githubRepo: ""
};
```

- `author`：作者昵称，“关于作者”会同步显示。
- `email`：公开联系邮箱；关于作者和常见问题里有邮件入口。
- `giteeRepo` / `githubRepo`：源码仓库地址。

## 更新版本

1. 替换 `downloads/` 里的网页版和 zip。
2. 在 `index.html` 里搜索并替换：版本号 `v5.7`、日期 `2026-11-22`、文件大小 `53 KB` / `140 KB`。
3. 在“技术验证信息”里更新两个 SHA-256。
4. 重新执行上面的 `wrangler pages deploy` 命令。

## 说明

- 本产品使用 TMDB API，但未获得 TMDB 认可或认证。
- Jellyfin、Emby、OpenList 为各自商标，本文仅说明兼容性，不代表官方合作。
- 本站不接入统计工具。
