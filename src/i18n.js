/* 影音入库箱 v6.0 · 中英文界面切换（离线、单文件、无依赖） */
(function () {
  "use strict";

  var STORE_KEY = "yingyin_ui_lang";
  var HAS_CN = /[\u4e00-\u9fff]/;
  var SKIP_TAGS = { script: 1, style: 1, noscript: 1, code: 1, pre: 1 };
  var ATTRS = ["title", "placeholder", "aria-label", "alt"];
  var lang = "zh";
  var applying = false;
  var textCache = new WeakMap();
  var attrCache = new WeakMap();

  var DICT = {
    影音入库箱: "Yingyin Box",
    "把云盘影音整理成 Jellyfin / Emby 能直接识别的媒体库：播放文件、影片信息、封面与字幕，全部在本机浏览器完成。":
      "Turn cloud media into a Jellyfin / Emby-ready library—playback files, metadata, covers, and subtitles, all processed locally in your browser.",
    "批量生成播放文件 + 封面": "Batch generate playback files + covers",
    批量打包字幕: "Batch package subtitles",
    "OpenList 未连接 · 点这里检查": "OpenList not connected · Click to check",
    "生成播放文件 + 封面": "Generate playback files + covers",
    "先选视频目录，工具会自动识别剧集或电影，并生成 Jellyfin / Emby 能直接识别的播放文件、封面和影片信息。":
      "Choose a video folder first. The tool detects TV series or movies and generates Jellyfin / Emby-ready playback files, covers, and metadata.",
    "① 选择云盘视频目录": "① Choose a cloud video folder",
    "还没选择视频目录——点上方「① 选择云盘视频目录」即可。":
      "No video folder selected yet—click “① Choose a cloud video folder” above.",
    "② 保存到媒体库（剧集文件夹）": "② Save to media library (TV folder)",
    "剧集一般填 /媒体库/剧集，电影填 /媒体库/电影；填你实际的媒体库路径。":
      "For TV, usually /媒体库/剧集; for movies, /媒体库/电影. Enter your actual library path.",
    默认自动完成: "Automatic by default",
    "：同时生成播放文件、影片信息和封面，不用勾选。":
      ": playback files, metadata, and covers are generated together—no checkboxes needed.",
    "没有 TMDB Key：只生成基础影片信息和本地封面，没有简介、评分和官方海报。":
      "Without a TMDB key: only basic metadata and local covers; no overviews, ratings, or official posters.",
    "去申请 Key": "Get a key",
    "③ 开始生成（播放文件 + 封面）": "③ Generate (playback files + covers)",
    "高级设置（一般不用改）": "Advanced settings (usually leave as-is)",
    "生成参数（剧名 / 季号）": "Generation options (title / season)",
    云盘视频目录: "Cloud video folder",
    "一般无需手填：点上方「选择云盘目录」，或点摘要里的目录行即可浏览选择。":
      "Usually no manual entry: click “Choose cloud folder” above, or click the folder row in the summary to browse.",
    "剧名前缀（生成的文件名）": "Title prefix (generated file name)",
    "季号（S 后面的 1–2 位数字，可留空自动推断）":
      "Season number (1–2 digits after S; leave blank to auto-detect)",
    "留空即可：生成时自动从目录名/文件名推断季号。":
      "Leave blank: the season is inferred from folder/file names during generation.",
    "strm 播放地址": "strm playback URL",
    "媒体服务器能访问到的 OpenList 地址。容器部署保持默认即可；Jellyfin 与 OpenList 不在同一网络时改成 IP。":
      "The OpenList address your media server can reach. Keep the default for container deployments; if Jellyfin and OpenList are on different networks, use an IP.",
    "强制刷新目录列表（刚上传新集时勾选）":
      "Force refresh folder list (check after adding new episodes)",
    "忽略 OpenList 缓存，立即读取最新文件（稍慢）":
      "Ignore OpenList cache and read the latest files immediately (slightly slower)",
    "只生成缺失集：对比媒体库里已有的 strm，跳过已存在的（需填媒体库目录）":
      "Only missing episodes: compare existing .strm files in the library and skip them (library path required)",
    "默认开启。按剧名 + 季号在媒体库里比对同名 strm，只打包新增集；未填媒体库目录时自动降级为全量生成。整部重做时请关掉。":
      "On by default. Compares same-name .strm files by title + season in the library and packages only new episodes. If no library path is set, it falls back to a full run. Turn off to rebuild the whole series.",
    "默认开启。导入上次 manifest 时按 manifest 精确对比新增 / 变化 / 未变化；未导入时按剧名 + 季号比对媒体库里已有的 strm。整部重做时请关掉。":
      "On by default. With an imported manifest it compares additions / changes / unchanged entries precisely; without one it falls back to matching existing .strm files by title + season. Turn off to rebuild the whole series.",
    "生成后直接上传到媒体库（免下载解压）":
      "Upload directly to the media library after generation (no download/unzip)",
    "通过 OpenList 上传接口把 strm 写进上面的目标目录，写完只需在 Jellyfin/Emby 扫库。需目标目录有效且账号有写权限；失败会自动保留 zip 下载兜底。":
      "Writes .strm files to the target folder through the OpenList upload API; then just scan in Jellyfin/Emby. The target must be valid and the account must have write access. On failure, a zip download is kept as fallback.",
    "连接与账号（OpenList）": "Connection & account (OpenList)",
    "测试 OpenList 连接": "Test OpenList connection",
    "OpenList 地址（API）": "OpenList address (API)",
    "改过地址后会重新登录。会自动尝试的候选地址仅含本机回环（127.0.0.1 / localhost）；此处若填公网或他人地址，账号密码将发送给该地址，请确认可信。":
      "Changing the address triggers a new login. Auto-probed candidates are loopback only (127.0.0.1 / localhost). If you enter a public or third-party address here, the username and password will be sent to it—make sure you trust it.",
    账号: "Username",
    密码: "Password",
    "默认 admin/admin。修改后请重新点「连接自检」。密码不写入本机存储，刷新后需重新输入。":
      "Default is admin/admin. After changing it, click “Connection self-test” again. Passwords are not stored locally; re-enter after refresh.",
    导出配置: "Export config",
    导入配置: "Import config",
    复制诊断信息: "Copy diagnostic info",
    "配置只含地址、目录等非敏感项，":
      "Config contains only addresses, folders, and other non-sensitive items—",
    "不含密码、TMDB Key / Token": "no passwords, TMDB keys, or tokens",
    "；诊断信息含地址、参数与最近日志，便于排查。":
      "; diagnostics include addresses, parameters, and recent logs for troubleshooting.",
    "封面与保存（TMDB Key / 保存方式）": "Covers & saving (TMDB key / output)",
    "TMDB API Key（v3，可选）": "TMDB API Key (v3, optional)",
    "清除 TMDB Key": "Clear TMDB key",
    "免费申请：": "Free signup: ",
    "打开 TMDB 申请页 ↗": "Open TMDB signup page ↗",
    "（登录后：设置 → API → 创建 API Key）。Key 只存本机浏览器（localStorage），只会发给上面填的 TMDB 地址。":
      "(After login: Settings → API → Create API Key). The key is stored only in this browser (localStorage) and sent only to the TMDB address above.",
    不填也能用: "Works without a key",
    "：只按文件名生成规范 NFO + 本地标题封面，Jellyfin / Emby 照样能认出剧集结构与集号。":
      ": only standard NFO + local title covers are generated from file names; Jellyfin / Emby can still recognize series structure and episode numbers.",
    "TMDB Access Token（v4，可选，优先于 Key）":
      "TMDB Access Token (v4, optional; takes priority over the key)",
    "TMDB 接口地址": "TMDB API address",
    "国内直连 api.themoviedb.org 常被墙：可填自己的反代地址（Cloudflare Worker / NAS 上的 TMDB 反代），路径保持":
      "Direct access to api.themoviedb.org is often blocked in mainland China: use your own reverse proxy (Cloudflare Worker / TMDB proxy on your NAS), keeping the path ending in",
    "结尾。": ".",
    "TMDB 图片地址": "TMDB image address",
    "图片站被墙时，把它换成能访问的图片反代地址；图片下载失败会自动改用本地标题封面兜底。":
      "If the image host is blocked, use an accessible image proxy. If downloads fail, local title covers are used as fallback.",
    "已自动优化：": "Auto-optimized: ",
    "生成单集 NFO、官方海报 / 背景图 / 季海报；抓不到海报时自动生成本地标题封面；默认打包成一个 zip。":
      "Generates episode NFOs, official posters / backdrops / season posters; creates local title covers when posters can't be fetched; packages into one zip by default.",
    "专家选项（默认已优化，通常不用改）":
      "Expert options (already optimized; usually leave as-is)",
    "同时生成封面和影片信息（推荐）":
      "Generate covers and metadata together (recommended)",
    "生成单集 NFO（每集标题 / 简介 / 播出日期）":
      "Generate episode NFOs (title / overview / air date)",
    "下载官方海报 / 背景图 / 季海报到媒体库":
      "Download official posters / backdrops / season posters to the library",
    "抓不到海报时生成本地标题封面（保证一定有封面）":
      "Create local title covers when posters are unavailable (guarantees a cover)",
    "覆盖已有 NFO / 海报（整库重刮时勾选）":
      "Overwrite existing NFO / posters (check when rescraping the whole library)",
    "直接写入媒体库（逐个上传；不勾选则只生成一个 zip）":
      "Write directly to the library (upload one by one; otherwise just generate a zip)",
    元数据语言: "Metadata language",
    "简体中文（推荐）": "Simplified Chinese (recommended)",
    繁体中文: "Traditional Chinese",
    "选择本地文件夹（可选）": "Choose a local folder (optional)",
    "未选择：默认只生成一个 zip":
      "Not selected: generates a single zip by default",
    "默认把整库 NFO / 海报打成一个 zip（或直接写进你选的本地文件夹），解压/合并到媒体库根目录即可。需要直接写入 OpenList 或覆盖旧文件时，再展开专家选项。":
      "Packs the whole library's NFO / posters into one zip by default (or writes into the local folder you choose); unzip/merge into the library root. Expand expert options only when writing directly to OpenList or overwriting old files.",
    生成好了: "Done",
    "← 再选目录，处理下一部": "← Pick another folder for the next title",
    这些播放文件要放进这个目录: "Put these playback files in this folder",
    "未检测到媒体库目录：请回到上方「② 保存到媒体库」填写后重新生成。":
      "No media library folder detected: go back to “② Save to media library” above, fill it in, and regenerate.",
    复制目录路径: "Copy folder path",
    "在 OpenList 打开此目录 →": "Open this folder in OpenList →",
    接下来这样做: "Next steps",
    "1. 下载并解压 zip → 2. 把每个「剧名 / 片名」文件夹整个放进媒体库（例如 /媒体库/剧集 或 /媒体库/电影）→ 3. 在 Jellyfin / Emby 扫库。":
      "1. Download and unzip the zip → 2. Put each “series / movie” folder into your library (e.g. /媒体库/剧集 or /媒体库/电影) → 3. Scan the library in Jellyfin / Emby.",
    "遇到问题？看这里": "Trouble? Look here",
    "扫不到新集：": "New episodes not showing: ",
    '目录列表可能被 OpenList 缓存（默认约 30 分钟）。勾选"强制刷新目录列表"后重试，或到 OpenList 网页手动刷新该目录。':
      "The folder list may be cached by OpenList (about 30 minutes by default). Check “Force refresh folder list” and retry, or refresh that folder manually in OpenList.",
    "连接失败：": "Connection failed: ",
    "先点「连接自检」。若提示 CORS / Failed to fetch，需给 OpenList 反代加跨域响应头，或把本页放到与 OpenList 同域的静态目录访问。":
      "Click “Connection self-test” first. If you see CORS / Failed to fetch, add CORS headers to your OpenList reverse proxy, or host this page in a static folder on the same domain as OpenList.",
    "整部重做：": "Full rebuild: ",
    "才可全量替换旧的 strm 文件；只加新集时别覆盖已有的。":
      "Only then replace all old .strm files; when adding episodes, don't overwrite existing ones.",
    "播放失败：": "Playback failed: ",
    "常见原因不仅是签名过期——还包括管理员 token 轮换、OpenList 地址或端口变更、视频路径改名、媒体服务器无法访问播放地址。请先核对 strm 里的那一行 URL。":
      "Common causes include not just expired signatures, but rotated admin tokens, changed OpenList address/port, renamed video paths, or the media server being unable to reach the playback URL. Check the URL line inside the .strm first.",
    运行日志: "Run log",
    "准备就绪。选择云盘目录后开始。": "Ready. Choose a cloud folder to start.",
    "给已有影片补封面和信息（可选，不重新生成播放文件）":
      "Add covers and metadata to existing titles (optional; no playback files regenerated)",
    "① 选择媒体库并扫描": "① Choose the library and scan",
    "给媒体库里已有的 strm 补 NFO 元信息与封面，不需要重新生成 strm。支持剧集与电影，默认只补缺失项。":
      "Adds NFO metadata and covers to existing .strm entries in the library without regenerating them. Supports TV and movies; fills only missing items by default.",
    "选择媒体库目录（剧集或电影文件夹）":
      "Choose media library folder (TV or movie folder)",
    "还没选媒体库——点上方按钮选到「剧集」根目录（例如 /媒体库/剧集）。":
      "No library selected yet—click the button above and choose the “TV series” root folder (e.g. /媒体库/剧集).",
    "还没选媒体库——点上方按钮选到剧集或电影文件夹（如 /媒体库/剧集），或直接选媒体库总目录，工具会自动识别同级「电影」目录。":
      "No library selected yet—click the button above and choose a TV or movie folder (e.g. /媒体库/剧集), or choose the library root; the tool will auto-detect a sibling “电影” folder.",
    "扫描媒体库（剧集 + 电影）": "Scan media library (TV + movies)",
    "② 确认匹配并刮削": "② Confirm matches and scrape",
    "← 重新选库": "← Choose another library",
    全选: "Select all",
    重新自动匹配: "Auto-match again",
    开始刮削: "Start scraping",
    "准备就绪。先选媒体库目录，再点「扫描媒体库（剧集 + 电影）」。":
      "Ready. Choose a library folder, then click “Scan media library (TV + movies)”.",
    "刮削后还是没封面？Jellyfin / Emby 必做设置":
      "Still no cover after scraping? Required Jellyfin / Emby settings",
    "1. 让服务器优先读本地 NFO": "1. Make the server read local NFO first",
    "Jellyfin：控制台 → 媒体库 → 编辑该库 →「元数据读取器」把":
      "Jellyfin: Dashboard → Libraries → Edit library → “Metadata readers”, move",
    "移到第一位（或只留 Nfo）。": "to the top (or keep only Nfo).",
    "Emby：媒体库 → 编辑 →「元数据」→ 勾选 Nfo 并置顶。":
      "Emby: Libraries → Edit → “Metadata” → check Nfo and move it to the top.",
    "2. 元数据语言设成 简体中文":
      "2. Set metadata language to Simplified Chinese",
    "（否则 TMDB 返回英文，中文剧名容易匹配不上）。":
      " (otherwise TMDB returns English and Chinese titles may fail to match).",
    "3. 图像抓取器勾选「本地图片」":
      "3. Enable “Local Images” in the image fetcher",
    "：Jellyfin 控制台 → 媒体库 → 图像抓取器 → Local Images；Emby 同理。本工具会把 poster.jpg / fanart.jpg 直接写在剧目录（季海报为 season01-poster.jpg）。":
      ": Jellyfin Dashboard → Libraries → Image fetchers → Local Images; same in Emby. This tool writes poster.jpg / fanart.jpg directly into the series folder (season posters as season01-poster.jpg).",
    "4. 刷新已有条目": "4. Refresh existing items",
    "：对剧集点「刷新元数据」→ 勾选「替换所有元数据（含图像）」。只扫库不会重读 NFO。":
      ": click “Refresh metadata” on the series → check “Replace all metadata (including images)”. A library scan alone won't reread NFO.",
    "5. 目录结构必须对": "5. Folder structure must be correct",
    "。本工具按此结构写入；电影是":
      ". This tool writes this structure; for movies it's",
    "没有 TMDB Key 也能用": "Works without a TMDB key",
    "：取消勾选联网项，只写 NFO + 本地封面，服务器完全不联网也能显示剧名、集号、封面。":
      ": uncheck online options; with NFO + local covers only, the server can show titles, episode numbers, and covers entirely offline.",
    "梵想云 / 其他媒体中心": "Fanxiang Cloud / other media centers",
    "：只要支持 NFO（Kodi 规范），同样读取本工具写的 tvshow.nfo / 集 NFO；不支持的，至少本地 poster.jpg 会被当封面。":
      ": any center supporting NFO (Kodi spec) can read tvshow.nfo / episode NFO written here; if not, at least local poster.jpg is used as a cover.",
    扫描已有字幕: "Scan existing subtitles",
    "把媒体库里已生成的外挂字幕打包下载，按通用规范命名，兼容梵想云与 Jellyfin/Emby。":
      "Package and download existing external subtitles in the library, named by common conventions and compatible with Fanxiang Cloud and Jellyfin/Emby.",
    "当前浏览器不支持 GB18030 中文字幕解码。遇到 GBK / GB2312 字幕乱码时，请改用 Chrome / Edge，或先把字幕转成 UTF-8。":
      "This browser doesn't support GB18030 Chinese subtitle decoding. If GBK / GB2312 subtitles look garbled, use Chrome / Edge or convert the subtitles to UTF-8 first.",
    字幕命名方式: "Subtitle naming",
    "与视频同名（推荐 · 梵想云/Jellyfin/Emby 通用）":
      "Match the video name (recommended · works with Fanxiang Cloud/Jellyfin/Emby)",
    保留原文件名: "Keep original file name",
    '"与视频同名"会把字幕改成媒体库里视频条目的名字（含本工具生成的 .strm），并去掉语言后缀。多条语言字幕重名时自动保留 zh/en 标记，避免互相覆盖。':
      "“Match the video name” renames subtitles to the media entry name (including .strm files generated here) and strips language suffixes. When multiple languages collide, zh/en tags are kept to avoid overwriting.",
    扫描字幕文件: "Scan subtitle files",
    打包字幕: "Package subtitles",
    取消本次打包: "Cancel this packaging",
    "扫描不到 / 改媒体库目录": "Can't find subtitles / change library folder",
    "OpenList 地址": "OpenList address",
    媒体库目录: "Media library folder",
    '与 strm 页共用同一目录配置。不知道路径？去"生成 strm"页点选择目录逐级浏览，照着填这里。':
      "Shares the same folder config as the strm page. Don't know the path? Go to the “Generate strm” page, browse folders, and copy the path here.",
    "递归扫描子目录（最多 3 层，适合 Season 目录结构）":
      "Scan subfolders recursively (up to 3 levels; suits Season structures)",
    "打包并发数（1–10）": "Packaging concurrency (1–10)",
    "默认 5。同时控制字幕打包、strm 自动上传与元信息写入的并发；网速慢或 OpenList 不稳定时调小到 2–3。":
      "Default 5. Also controls concurrency for subtitle packaging, strm auto-upload, and metadata writes; lower to 2–3 on slow networks or unstable OpenList.",
    "准备就绪，点「扫描字幕文件」开始。":
      "Ready. Click “Scan subtitle files” to start.",
    "字幕说明 / 什么时候用": "Subtitle notes / when to use",
    本工具打包的是: "This tool packages",
    外挂字幕: "external subtitles",
    "（独立 .srt/.ass/.ssa/.sub 文件），不是从视频里提取字幕。":
      " (standalone .srt/.ass/.ssa/.sub files), not subtitles extracted from video.",
    "通常内嵌字幕能被 Jellyfin / Emby 读出；只有当内嵌字幕读不出来（格式特殊、图形字幕等）时，才需要把现成的外挂字幕放到视频旁边。":
      "Embedded subtitles are usually readable by Jellyfin / Emby; only when they aren't (unusual formats, image-based subtitles, etc.) do you need to place existing external subtitles next to the video.",
    '默认"与视频同名"会把字幕改成视频的名字、自动去掉语言后缀，多语言重名时保留 zh/en 标记避免覆盖。':
      "By default “Match the video name” renames subtitles to the video name, strips language suffixes, and keeps zh/en tags for duplicate languages to avoid overwriting.",
    提示: "Notice",
    知道了: "Got it",
    选择云盘目录: "Choose cloud folder",
    全部目录: "All folders",
    全选本层: "Select all in this level",
    "读取中…": "Loading…",
    "← 上级": "← Up",
    用此目录: "Use this folder",
    取消: "Cancel",
    功能切换: "Switch feature",
    "点击检查 OpenList 连接": "Click to check OpenList connection",
    留空自动推断: "Leave blank to auto-detect",
    "填了才自动匹配简介 / 评分 / 官方海报":
      "Fill it in to auto-match overviews / ratings / official posters",
    "搜索文件夹 / 输入即筛选": "Search folders / type to filter",
    搜索文件夹: "Search folders",
    "正在生成…": "Generating…",
    "正在扫描…": "Scanning…",
    "正在打包…": "Packaging…",
    "正在刮削…": "Scraping…",
    正在连接: "Connecting",
    "连接中…": "Connecting…",
    已连接: "Connected",
    未连接: "Not connected",
    连接失败: "Connection failed",
    生成失败: "Generation failed",
    扫描失败: "Scan failed",
    打包失败: "Packaging failed",
    刮削失败: "Scraping failed",
    上传失败: "Upload failed",
    读取失败: "Read failed",
    未知错误: "Unknown error",
    已复制: "Copied",
    请手动复制: "Copy manually",
    准备就绪: "Ready",
    "正在停止…": "Stopping…",
    已取消: "Cancelled",
    连接超时: "Connection timed out",
    网络错误: "Network error",
    请求超时: "Request timed out",
    上传超时: "Upload timed out",
    分页失败: "Pagination failed",
    运行日志: "Run log",
    "全量生成仍失败。": "Full generation still failed.",
    "账号或密码错误：": "Wrong username or password: ",
    强制刷新目录列表: "Force refresh folder list",
    "未取得 token": "No token received",
    "TMDB 返回失败": "TMDB request failed",
    "连不上 TMDB：": "Can't reach TMDB: ",
    "请手动打开 TMDB": "Open TMDB manually",
    登录失败: "Login failed",
    "登录已过期，重连失败": "Session expired; reconnect failed",
    "连不上 OpenList": "Can't reach OpenList",
    "未填媒体库目录，已跳过上传": "No media library folder; upload skipped",
    "云盘目录为空，请先选择目录。":
      "Cloud folder is empty—choose a folder first.",
    "已生成 ": "Generated ",
    " 个 strm。": " .strm files.",
    " 个 strm": " .strm files",
    个文件: " files",
    张图: " images",
    个字幕: " subtitles",
    个视频: " videos",
    个目录: " folders",
    部剧: " series",
    失败明细: "Failure details",
    上传完成: "Upload complete",
    生成完成: "Generation complete",
    打包完成: "Packaging complete",
    扫描完成: "Scan complete",
    刮削完成: "Scraping complete",
    自动匹配完成: "Auto-match complete",
    连接正常: "Connection OK",
    "连接自检开始 …": "Connection self-test started…",
    "连接尝试 ": "Connection attempt ",
    " 失败：": " failed: ",
    "自检失败：": "Self-test failed: ",
    "（若从 file:// 打开，多为 CORS/预检被拦）":
      "(if opened from file://, usually CORS/preflight blocking)",
    "先检查这 3 件事：": "Check these 3 things first:",
    "OpenList 已经启动了吗？": "Is OpenList running?",
    "「连接与账号」里的地址、账号密码填对了吗？":
      "Are the address, username, and password in “Connection & account” correct?",
    "HTML 是不是直接双击打开的？直接打开时，浏览器可能拦截跨域请求。":
      "Did you open the HTML by double-clicking? When opened directly, the browser may block cross-origin requests.",
    "最后错误：": "Last error: ",
    "不确定怎么处理？点「复制诊断信息」发我。":
      "Not sure what to do? Click “Copy diagnostic info” and send it to me.",
    "⚡ 一键重连": "⚡ Reconnect",
    去检查连接设置: "Check connection settings",
    连接自检: "Connection self-test",
    "正在检测浏览器能力…": "Detecting browser capability…",
    "本浏览器：支持直写目录": "This browser: direct folder write",
    "本浏览器：将退回 zip 下载": "This browser: zip download fallback",
    "本浏览器：只能 zip 下载": "This browser: zip download only",
    本版构建自: "Built from",
    可复现构建: "Reproducible build",
    "只新增、不覆盖": "Only add, never overwrite",
    "导入上次 manifest（可选）": "Import previous manifest (optional)",
    清除已导入: "Clear imported",
    "未导入：将按媒体库已有 strm 做增量对比。导入上次 zip 里的 manifest.json 后，可精确认出新增 / 改名 / 已删。":
      "Not imported: compares against existing .strm files in the library. Import manifest.json from the last zip to detect additions / renames / deletions precisely.",
    清除全部本地数据: "Clear all local data",
    "仅本次会话使用 TMDB Key（不写 localStorage；刷新后需重填）":
      "Use TMDB key for this session only (not written to localStorage; re-enter after refresh)",
    "Key 默认与本工具配置一起存本机 localStorage；勾选上面的会话模式后，只留在当前页面内存里。所有本地数据都可用「清除全部本地数据」一次清掉。":
      "By default the key is stored with this tool's config in local browser localStorage. With session mode above it stays in page memory only. Use “Clear all local data” to remove everything at once.",
    "strm 不写入 OpenList 签名（只写 /d/ 路径模板，换域名改一行即可）":
      "Do not embed OpenList signatures in .strm (write only the /d/ path template; change one line when the domain changes)",
    "覆盖已有 NFO / 海报（默认关闭；打开会二次确认）":
      "Overwrite existing NFO / posters (off by default; asks for confirmation)",
    "离线冻结承诺：": "Offline freeze promise: ",
    "数据边界：": "Data boundary: ",
    "威胁模型一页纸（凭据从哪来 / 存哪 / 活多久 / 怎么清）":
      "One-page threat model (where credentials come from / where stored / lifetime / how to clear)",
    "已下载的离线 HTML 永久可用、永不回连、永不因版本更新失效；在线版可能迭代，本地那份归你。若未来增加付费服务，已发布版本功能不锁。":
      "A downloaded offline HTML keeps working forever, never calls back, and never expires because of a version update. The online copy may evolve; the local copy is yours. If a paid service is added later, already-published versions will not be feature-locked.",
    "没有接收视频 / Key / OpenList 凭据的业务后端。视频与目录只在浏览器和你的 OpenList 之间流动；TMDB Key 只发给 TMDB；OpenList 密码只在当前页面内存里，会发给你自己的 OpenList。唯一例外是官网底部反馈表单：称呼与留言经转发接口送给作者，不接触视频、目录、Key 或 OpenList 凭据，提交前可在 DevTools → Network 看到完整 payload。":
      "No business backend receives videos, keys or OpenList credentials. Videos and folders move only between your browser and your own OpenList; the TMDB key goes only to TMDB; the OpenList password lives only in page memory and goes only to your own OpenList. The one exception is the feedback form at the bottom of the website: a name and message go through the forwarding endpoint to the author, without videos, folders, keys or OpenList credentials, and the full payload is visible in DevTools → Network before submission.",
    "This product uses the TMDB API but is not endorsed or certified by TMDB. 本工具非商业使用；TMDB 海报等资料仅作本地媒体库展示，缓存不超过 6 个月，不得用于训练 AI。Jellyfin / Emby 为其各自项目所有；本工具与它们没有官方合作或认证关系。片源版权与网盘服务条款由使用者自行负责，工具不含任何片源。":
      "This product uses the TMDB API but is not endorsed or certified by TMDB. This tool is non-commercial; TMDB posters and metadata are used only for local media-library display, cached for no more than 6 months, and must not be used to train AI. Jellyfin and Emby belong to their respective projects; this tool has no official partnership or certification with them. Copyright and cloud-drive terms for the media itself are the user's responsibility; the tool contains no media.",
  };

  var PAIRS = Object.keys(DICT)
    .sort(function (a, b) {
      return b.length - a.length;
    })
    .map(function (k) {
      return [k, DICT[k]];
    });

  var RULES = [
    [/^已选 (\d+) \/ 共 (\d+) 部$/, "$1 of $2 selected"],
    [/^开始刮削（(\d+) 部）$/, "Start scraping ($1 titles)"],
    [/^批量生成所选（(\d+)）$/, "Generate selected ($1)"],
    [/^全选本层（(\d+)）$/, "Select all in this level ($1)"],
    [/^已连接 (\d+)$/, "Connected to $1"],
    [/^(\d+) 秒后自动关闭）$/, "closes in $1s"],
    [/^第 (\d+) 集$/, "Episode $1"],
    [/^第 (\d+) 季$/, "Season $1"],
  ];

  var META = {
    zh: {
      title: "影音入库箱 · v6.0",
      desc: "影音入库箱：配合 OpenList 批量生成 strm、打包外挂字幕，并为 Jellyfin/Emby 补 NFO 元信息与封面的单文件工具",
    },
    en: {
      title: "Yingyin Box · v6.0",
      desc: "Yingyin Box: a single-file tool that works with OpenList to batch-generate strm files, package external subtitles, and add NFO metadata and covers for Jellyfin/Emby.",
    },
  };

  function translateValue(raw) {
    if (!HAS_CN.test(raw)) return raw;
    var core = raw.trim();
    var lead = raw.slice(0, raw.indexOf(core));
    var trail = raw.slice(raw.indexOf(core) + core.length);
    if (DICT[core]) return lead + DICT[core] + trail;

    for (var r = 0; r < RULES.length; r++) {
      if (RULES[r][0].test(core))
        return lead + core.replace(RULES[r][0], RULES[r][1]) + trail;
    }

    var out = core;
    for (var i = 0; i < PAIRS.length; i++) {
      var zh = PAIRS[i][0],
        en = PAIRS[i][1];
      if (zh.length >= 4 && out.indexOf(zh) >= 0) out = out.split(zh).join(en);
    }
    return lead + out + trail;
  }

  function skipped(node) {
    var p = node.nodeType === 1 ? node : node.parentNode;
    while (p && p !== document.documentElement) {
      if (p.nodeType === 1) {
        if (p.hasAttribute && p.hasAttribute("data-i18n-skip")) return true;
        if (SKIP_TAGS[String(p.tagName || "").toLowerCase()]) return true;
      }
      p = p.parentNode;
    }
    return false;
  }

  function eachText(root, cb) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || !node.nodeValue.trim())
          return NodeFilter.FILTER_REJECT;
        return skipped(node)
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT;
      },
    });
    var list = [];
    while (walker.nextNode()) list.push(walker.currentNode);
    list.forEach(cb);
  }

  function eachElement(root, cb) {
    if (root.nodeType === 1) cb(root);
    var list = root.querySelectorAll ? root.querySelectorAll("*") : [];
    for (var i = 0; i < list.length; i++) cb(list[i]);
  }

  function handleText(node) {
    var raw = node.nodeValue;
    if (lang === "en") {
      if (!HAS_CN.test(raw)) return;
      var tr = translateValue(raw);
      if (tr !== raw) {
        textCache.set(node, raw);
        node.nodeValue = tr;
      }
    } else if (textCache.has(node)) {
      var original = textCache.get(node);
      if (node.nodeValue !== original) node.nodeValue = original;
    }
  }

  function handleAttr(el, name) {
    if (!el.getAttribute || skipped(el)) return;
    var raw = el.getAttribute(name);
    if (raw == null || !raw.trim()) return;
    var map = attrCache.get(el);
    if (!map) {
      map = {};
      attrCache.set(el, map);
    }
    if (lang === "en") {
      if (!HAS_CN.test(raw)) return;
      map[name] = raw;
      var tr = translateValue(raw);
      if (tr !== raw) el.setAttribute(name, tr);
    } else if (map[name] != null) {
      el.setAttribute(name, map[name]);
    }
  }

  function setMetaText(key, value, attr) {
    var el = document.querySelector("meta[" + attr + '="' + key + '"]');
    if (el) el.setAttribute("content", value);
  }

  function updateMeta(next) {
    var m = META[next];
    document.title = m.title;
    setMetaText("description", m.desc, "name");
  }

  function updateToggles() {
    document.querySelectorAll("[data-lang-toggle]").forEach(function (btn) {
      btn.textContent = lang === "en" ? "中文" : "EN";
      btn.setAttribute(
        "aria-label",
        lang === "en" ? "切换到中文" : "Switch to English",
      );
      btn.setAttribute(
        "title",
        lang === "en" ? "切换到中文" : "Switch to English",
      );
    });
  }

  function apply(next, save) {
    applying = true;
    lang = next === "en" ? "en" : "zh";
    document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
    document.documentElement.setAttribute("data-lang", lang);
    updateMeta(lang);
    eachText(document.body, handleText);
    eachElement(document.body, function (el) {
      for (var i = 0; i < ATTRS.length; i++) handleAttr(el, ATTRS[i]);
    });
    updateToggles();
    applying = false;
    if (save) {
      try {
        localStorage.setItem(STORE_KEY, lang);
      } catch (err) {}
    }
  }

  function initialLang() {
    try {
      var stored = localStorage.getItem(STORE_KEY);
      if (stored === "en" || stored === "zh") return stored;
    } catch (err) {}
    try {
      var q = new URLSearchParams(location.search).get("lang");
      if (q === "en" || q === "zh") return q;
    } catch (err) {}
    return "zh";
  }

  document.querySelectorAll("[data-lang-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      apply(lang === "en" ? "zh" : "en", true);
    });
  });

  apply(initialLang(), false);

  var observer = new MutationObserver(function (mutations) {
    if (lang !== "en" || applying) return;
    for (var i = 0; i < mutations.length; i++) {
      var m = mutations[i];
      if (m.type === "characterData") {
        handleText(m.target);
      } else if (m.type === "childList") {
        for (var j = 0; j < m.addedNodes.length; j++) {
          var node = m.addedNodes[j];
          if (node.nodeType === 3) handleText(node);
          else if (node.nodeType === 1) eachText(node, handleText);
        }
      }
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
})();
