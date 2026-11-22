# 威胁模型一页纸

每个凭据/数据：从哪来 / 存在哪 / 活多久 / 谁可能碰到 / 怎么一键清掉。

| 数据 | 从哪来 | 存在哪 | 活多久 | 谁可能碰到 | 怎么清 |
|---|---|---|---|---|---|
| TMDB Key / Token | 用户手动填 | 默认 localStorage；勾选会话模式后只在内存 | 到用户清除或刷新 | 同源脚本、浏览器扩展、共用电脑；作者收不到 | 「清除 TMDB Key」/「清除全部本地数据」 |
| OpenList 账号密码 | 用户手动填 | 只在当前页面内存 | 刷新即失效 | 页面脚本、用户自己的 OpenList；作者收不到 | 关闭页面 |
| OpenList token | OpenList 登录返回 | 只在内存 | 刷新/改地址后失效 | 页面脚本、OpenList | 重新连接 |
| 生成出的 strm | 工具按路径生成 | 写进 zip / 写入媒体库 | 永久，除非删除 | 拿到 zip 的人；可能含 `sign=` / `token=` / `pwd=` | 删除 strm；改 `openlistBase` 重跑 |
| manifest.json | 工具生成 | 跟着 zip / 媒体库目录 | 永久 | 拿到 zip 的人 | 删除 manifest |
| 反馈表单内容 | 用户填写 | 经 `/api/contact` 转发到作者邮箱 | 按邮箱策略 | 作者、邮件服务商 | 不在页面持久化；联系作者删除 |

## 明确的安全边界

- 没有接收视频 / Key / OpenList 凭据的业务后端。
- 视频与目录只在浏览器和用户自己的 OpenList 之间流动。
- TMDB Key 只发给 TMDB（或用户自填的 TMDB 反代）。
- OpenList 密码只发给用户自己填的 OpenList。
- 唯一例外是反馈表单：称呼与留言经转发接口送给作者，不接触视频、目录、Key 或 OpenList 凭据；提交前可在 DevTools → Network 看到完整 payload。
- 不加载第三方脚本；在线版有 CSP，`default-src 'self'`，`connect-src` 只放行 TMDB 与 http/https（OpenList 地址由用户自填，无法静态白名单）。
- 生成的 strm 若含鉴权参数，页面提示，zip 请勿外传。

## 不在威胁模型内

- 用户自己的浏览器被恶意扩展完全控制；
- 用户把含凭据的 zip 主动公开；
- 网盘服务商根据 IP / 播放行为做风控；
- TMDB / OpenList / Jellyfin / Emby 自身的安全问题。
