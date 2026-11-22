# 影音入库箱 · 官网（Gitee Pages 免费版）

这是一个纯静态官网，给国内小白用户看的。没有后端、没有统计、没有第三方脚本。

## 文件结构

```
index.html                        官网首页（单文件，图片已内嵌）
downloads/yingyin-box-v5.7.html   影音入库箱 v5.7 网页版
downloads/yingyin-box-v5.7.zip    影音入库箱 v5.7 完整包
README.md                         本说明
LICENSE                           MIT 许可证
```

## 上传到 Gitee Pages（零成本）

1. 打开 [Gitee](https://gitee.com/) 注册账号，按提示完成实名认证。
2. 新建一个**公开仓库**，例如 `yingyin` 或 `media-box`。
3. 把本目录里的全部文件上传到仓库根目录，保持 `downloads/` 文件夹结构。
4. 打开仓库页面 → **服务** → **Gitee Pages**。
5. 部署分支选 `master`（或你的默认分支），部署目录填 `/`，勾选“强制使用 HTTPS”，点**启动**。
6. 等 1–5 分钟，访问：

```
https://你的用户名.gitee.io/仓库名/
```

例如 `https://yourname.gitee.io/yingyin/`。

> Gitee Pages 免费版每次更新后，需要回到 Pages 页面手动点一次“更新”。自定义域名属于付费 Pro 功能，免费版用 `gitee.io` 子域名即可，不需要备案。

## 改作者信息

打开 `index.html`，拉到最底部，找到：

```js
const SITE_CONFIG = {
  author: "影音入库箱作者",
  email: "",
  giteeRepo: "",
  githubRepo: ""
};
```

- `author`：改成你的昵称，页面“关于作者”会同步显示。
- `email`：想公开联系邮箱就填；留空则只显示仓库反馈入口。
- `giteeRepo` / `githubRepo`：留空会自动识别当前 Gitee Pages 仓库；用自定义域名时再手动填完整地址。

## 更新版本

1. 替换 `downloads/` 里的网页版和 zip。
2. 在 `index.html` 里搜索并替换：版本号 `v5.7`、日期 `2026-11-22`、文件大小 `53 KB` / `140 KB`。
3. 在“技术验证信息”里更新两个 SHA-256。
4. 上传到 Gitee，回到 Gitee Pages 点“更新”。

## 可选：海外/技术用户备用站

如果要额外放一个 Cloudflare Pages 或 GitHub Pages 镜像：

- Cloudflare Pages：免费，但中国大陆没有节点，晚高峰可能较慢，适合备用，不适合当主入口。
- GitHub Pages：免费，但 `github.io` 在国内不稳定，建议只作为源码仓库，不要当主下载入口。

## 说明

- 本产品使用 TMDB API，但未获得 TMDB 认可或认证。
- Jellyfin、Emby、OpenList 为各自商标，本文仅说明兼容性，不代表官方合作。
- 本站不接入统计工具。
