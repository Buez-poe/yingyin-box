# manifest.json 规范（schema `yingyin-box.manifest/1`）

`manifest.json` 放在每个生成 zip 的根目录，跟着媒体库目录走，不写 localStorage。它的作用是让下一次重跑能精确 diff，而不是靠文件名猜。

## 顶层字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `schema` | string | 固定 `yingyin-box.manifest/1` |
| `version` | string | 生成它的工具版本，如 `v6.0` |
| `commit` | string | 构建来源 commit；与页面角落那行一致 |
| `buildDate` | string | 构建日期 `YYYY-MM-DD` |
| `generatedAt` | string | 本次生成时间 ISO 8601 |
| `openlistBase` | string | 生成 strm 时用的 OpenList / 播放地址根 |
| `outputRoot` | string | 目标媒体库目录 |
| `tmdb.used` | boolean | 本次是否用了 TMDB |
| `tmdb.language` | string | 元数据语言 |
| `stats.generated` | number | 本次生成条数 |
| `stats.skipped` | number | 未变化跳过条数 |
| `stats.changed` | number | 源文件变化重写条数 |
| `stats.deleted` | number | manifest 里有、本次没找到的条数（默认不删） |
| `entries` | array | 条目列表 |

## entries[] 字段

| 字段 | 说明 |
|---|---|
| `relativePath` | 在媒体库里的落点，如 `剧名/Season 01/剧名 S01E01.strm` |
| `source.name` | 云盘源文件名 |
| `source.size` | 源文件字节数（OpenList 提供时） |
| `source.mtime` | 源文件修改时间（OpenList 提供时） |
| `title` | 解析出的标题 |
| `year` | 解析出的年份，可为空 |
| `season` | 季号，两位字符串 |
| `episode` | 集号，数字；电影为 0 |
| `tmdbid` | TMDB ID；未匹配为空 |
| `urlTemplate` | 写进 strm 的 URL 模板 |
| `cover` | `local` / `tmdb` / `title` / 空 |

## 不含什么

- 不含 TMDB Key / Token；
- 不含 OpenList 账号密码；
- 不含视频内容；
- 可以含 `sign=` / `token=` / `pwd=` 的 strm 模板——这种 zip 请勿外传。

## 兼容策略

- 读取时忽略未知字段，缺字段按空处理；
- `schema` 不匹配时拒绝导入并提示；
- 旧 manifest 没有 `source.size/mtime` 时，按文件名 + 路径判断，可能把变化条目误判为未变化；建议保留源文件信息。
