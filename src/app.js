!(function () {
  "use strict";
  const e = {
      VERSION: "v6.0",
      BUILD_COMMIT: "__BUILD_COMMIT__",
      BUILD_DATE: "__BUILD_DATE__",
      MANIFEST_FILE: "manifest.json",
      MANIFEST_SCHEMA: "yingyin-box.manifest/1",
      CFG_KEY: "wb_avtool_cfg_v3",
      TMDB_HELP: "https://www.themoviedb.org/settings/api",
      USER: "admin",
      PWD: "admin",
      CANDIDATES: [
        "http://127.0.0.1:5244",
        "http://127.0.0.1:25862",
        "http://127.0.0.1:15806",
        "http://localhost:5244",
      ],
      PLAY_BASE: "http://openlist:5244",
      API_BASE: "http://127.0.0.1:5244",
      TIMEOUT_LOGIN: 6e3,
      TIMEOUT_API: 12e3,
      TIMEOUT_FETCH: 15e3,
      PER_PAGE: 500,
      MAX_DEPTH: 3,
      MAX_FILES: 2e4,
      CONCURRENCY: 5,
      VIDEXT: [
        ".mkv",
        ".mp4",
        ".ts",
        ".avi",
        ".mov",
        ".flv",
        ".wmv",
        ".rmvb",
        ".webm",
      ],
      SUB_RE: /\.(srt|ass|ssa|sub|idx)$/i,
      SKIP_DIR:
        /人脸|照片|图片|备份|驱动|系统|system|photo|face|thumb|cache|\.git|应用收藏|openlist/i,
      NOISE_RE:
        /\b(?:4k|2160p|1080p|720p|576p|480p|x264|x265|h\.?264|h\.?265|hevc|10bit|8bit|hdr10?|ddp?5[._-]?1|dd5[._-]?1|aac|truehd|atmos|bluray|bdrip|webrip|web-?dl|remux|cd[1-9]|disk[1-9]|ncop|nced|sample)\b|超高清|sdr/gi,
      MEDIA_HINT:
        /\b(?:10|20)\d{2}p\b|\b4k\b|web-?dl|bluray|bdrip|webrip|remux|x26[45]|h\.?26[45]|hevc|10bit|hdr|atmos|truehd|ddp?5/i,
      NON_MEDIA:
        /^(?:img|vid|pxl|dvc|dsc|mov|video|screencast|screen\s?record)?[ _-]?(?:\d{6,}|\d{4}[-_.]\d{1,2}[-_.]\d{1,2})(?:[ _-]\d{2,6})?\b/i,
      NON_MEDIA_WORD:
        /手机视频|屏幕录制|录屏|screenshot|微信视频|mmexport|dcim|camera|相机拍摄|手机拍摄|用.{0,24}的方式(?:打开|记录)|vlog|探店|开箱|职场/i,
      BAD_NUMS: new Set([264, 265, 480, 576, 720, 1080, 1440, 2160]),
      IDS: [
        "cloudDir",
        "namePrefix",
        "season",
        "playHost",
        "apiBase",
        "baseUrl2",
        "libDir",
        "libDir2",
        "subMode",
        "userName",
        "forceRefresh",
        "subRecursive",
        "incremental",
        "concurrency",
        "autoUpload",
        "tmdbKey",
        "tmdbToken",
        "tmdbApi",
        "tmdbImg",
        "tmdbLang",
        "metaEpNfo",
        "metaImages",
        "metaCover",
        "metaOverwrite",
        "metaUpload",
        "stripSign",
        "tmdbSession",
      ],
    },
    t = (e) => document.getElementById(e),
    n = () =>
      '<a class="tmdb-help" href="' +
      e.TMDB_HELP +
      '" target="_blank" rel="noopener noreferrer">打开 TMDB 申请页 ↗</a>',
    r = ["cloudDir", "namePrefix", "season"],
    o = ["tmdbKey", "tmdbToken"],
    a = "tabStrm",
    s = "tabSub",
    i = "strmLog",
    l = "subLog",
    c = "subAlert",
    d = "subProgress",
    u = "mask",
    m = "pickMask";
  let f = e.API_BASE,
    p = null,
    h = "",
    g = "/",
    b = [],
    y = 0,
    k = [],
    v = new Map(),
    w = "strm",
    S = [],
    E = [],
    x = [],
    _ = [],
    D = !1,
    T = null,
    L = !1,
    I = null,
    importedManifest = null,
    importedManifestName = "",
    activeManifest = null,
    lastPreflight = null,
    preflightResolver = null,
    overwriteModeConfirmed = false;
  const C = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "`": "&#96;",
  };
  function N(e) {
    return String(null == e ? "" : e).replace(/[&<>"'`]/g, (e) => C[e]);
  }
  const B = (e) => String(null == e ? "" : e).replace(/\.[^./\\]+$/, ""),
    M = (e, t = 2) => String(null == e ? "" : e).padStart(t, "0");
  function A(e) {
    let t = String(null == e ? "" : e)
      .replace(/^(?:\.\.[\\/])+/, "")
      .replace(/[\\/:*?"<>|\x00-\x1f\x7f]/g, "_")
      .replace(/^\.+|\.+$/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);
    return (
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i.test(t) && (t = "_" + t),
      t || "unnamed"
    );
  }
  function O(e) {
    let t = String(null == e ? "" : e)
      .trim()
      .replace(/\\/g, "/");
    if (!t) return "/";
    t = t.replace(/\/{2,}/g, "/");
    const n = [];
    for (const e of t.split("/"))
      e && "." !== e && (".." !== e ? n.push(e) : n.length && n.pop());
    return ((t = "/" + n.join("/")), "/" === t ? "/" : t.replace(/\/+$/, ""));
  }
  const P = (e, t) => O(O(e) + "/" + String(t).replace(/^\/+/, ""));
  function R(e) {
    const t = String(null == e ? "" : e)
      .trim()
      .replace(/\/+$/, "");
    if (!t) return "";
    try {
      const e = new URL(t);
      return "http:" !== e.protocol && "https:" !== e.protocol
        ? ""
        : e.origin + e.pathname.replace(/\/+$/, "");
    } catch (e) {
      return "";
    }
  }
  function U(e) {
    try {
      const t = new URL(String(e)).hostname
        .toLowerCase()
        .replace(/^\[|\]$/g, "");
      if ("localhost" === t || "::1" === t) return !0;
      let n = t;
      const r = t.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
      r && (n = r[1]);
      const o = t.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i);
      o &&
        (n =
          (parseInt(o[1], 16) >> 8) +
          "." +
          (255 & parseInt(o[1], 16)) +
          "." +
          (parseInt(o[2], 16) >> 8) +
          "." +
          (255 & parseInt(o[2], 16)));
      const a = n.split(".");
      if (4 === a.length && a.every((e) => /^\d{1,3}$/.test(e) && +e <= 255)) {
        const [e, t] = a.map(Number);
        return (
          127 === e ||
          10 === e ||
          (192 === e && 168 === t) ||
          (172 === e && t >= 16 && t <= 31) ||
          (169 === e && 254 === t) ||
          (100 === e && t >= 64 && t <= 127)
        );
      }
      return !(!/^f[cd]/.test(t) && !/^fe[89ab]/.test(t));
    } catch (e) {
      return !1;
    }
  }
  function H(e, t) {
    try {
      return new TextDecoder(e).decode(t);
    } catch (e) {
      return null;
    }
  }
  const F = (function () {
    try {
      return (new TextDecoder("gb18030"), !0);
    } catch (e) {
      return !1;
    }
  })();
  function j(e) {
    const t = e instanceof Uint8Array ? e : new Uint8Array(e || []);
    let n = null;
    if (t.length >= 3 && 239 === t[0] && 187 === t[1] && 191 === t[2])
      return H("utf-8", t.subarray(3)) || new TextDecoder("utf-8").decode(t);
    if (t.length >= 2 && 255 === t[0] && 254 === t[1])
      return H("utf-16le", t.subarray(2)) || H("utf-8", t);
    if (
      t.length >= 2 &&
      254 === t[0] &&
      255 === t[1] &&
      ((n = H("utf-16be", t.subarray(2))), null !== n)
    )
      return n;
    try {
      return new TextDecoder("utf-8", { fatal: !0 }).decode(t);
    } catch (e) {}
    if (t.length >= 4 && t.length % 2 == 0) {
      const e = Math.min(t.length, 512);
      let r = 0,
        o = 0,
        a = 0,
        s = 0;
      for (let n = 0; n < e; n += 2) {
        const e = t[n],
          i = t[n + 1];
        (0 === e && o++,
          0 === i && r++,
          i >= 78 && i <= 159 && a++,
          e >= 78 && e <= 159 && s++);
      }
      const i = Math.ceil(e / 2);
      if ((r > 0.3 * i || a > 0.5 * i) && ((n = H("utf-16le", t)), null !== n))
        return n;
      if ((o > 0.3 * i || s > 0.5 * i) && ((n = H("utf-16be", t)), null !== n))
        return n;
    }
    return (
      (n = H("gb18030", t)),
      null !== n ? n : new TextDecoder("utf-8").decode(t)
    );
  }
  const z = new Set(["ok", "ok-t", "err", "err-t", "warn", "warn-t"]),
    $ = (e) => (z.has(e) ? e : "");
  function K(e, n, r) {
    const o = $(r),
      a = t(e);
    if (
      a &&
      (a.insertAdjacentHTML(
        "beforeend",
        '\n<span class="' + o + '">' + N(n) + "</span>",
      ),
      (a.scrollTop = a.scrollHeight),
      "err" === o || "err-t" === o)
    ) {
      const e = a.closest("details.logbox");
      e && (e.open = !0);
    }
  }
  function q(e, n, r) {
    if (!n || !n.length) return;
    const o = t(e);
    if (!o) return;
    const a = $(r),
      s = document.createDocumentFragment();
    (n.forEach((e) => {
      const t = document.createElement("span");
      (a && (t.className = a),
        (t.textContent = "\n" + String(null == e ? "" : e)),
        s.appendChild(t));
    }),
      o.appendChild(s),
      (o.scrollTop = o.scrollHeight));
  }
  function W() {
    const n = parseInt(t("concurrency") && t("concurrency").value, 10);
    return Number.isFinite(n) ? Math.max(1, Math.min(10, n)) : e.CONCURRENCY;
  }
  async function G(e) {
    try {
      return (await navigator.clipboard.writeText(e), !0);
    } catch (t) {
      try {
        const t = document.createElement("textarea");
        ((t.value = e),
          (t.style.position = "fixed"),
          (t.style.opacity = "0"),
          document.body.appendChild(t),
          t.select());
        const n = document.execCommand("copy");
        return (document.body.removeChild(t), n);
      } catch (e) {
        return !1;
      }
    }
  }
  function J() {
    let t = null;
    try {
      t = window.open(e.TMDB_HELP, "_blank");
    } catch (e) {}
    if (t)
      try {
        t.opener = null;
      } catch (e) {}
    else
      re(
        "info",
        "请手动打开 TMDB",
        '<div class="hint">浏览器没有自动打开新标签页。复制下面网址，粘贴到浏览器地址栏打开即可：</div><input class="tmdb-url" readonly value="' +
          e.TMDB_HELP +
          '">',
        [
          {
            label: "复制网址",
            style: "primary",
            fn: async () => {
              (await G(e.TMDB_HELP))
                ? re(
                    "ok",
                    "已复制",
                    "申请网址已复制，粘贴到浏览器地址栏打开即可。",
                  )
                : re(
                    "info",
                    "请手动复制",
                    "浏览器未允许自动复制，请选中上面输入框里的网址手动复制。",
                  );
            },
          },
          { label: "关闭" },
        ],
      );
  }
  function V(e) {
    ((t("cloudDir").value = e), (k = []), ie.clear());
    try {
      st();
    } catch (e) {}
  }
  function Y(e) {
    const n = t("connStatus");
    if (!n) return;
    n.textContent = e;
    const r = /失败|错误|不可用|需重新连接/.test(e)
      ? "err"
      : /已连接/.test(e)
        ? "ok"
        : /正在|连接中/.test(e)
          ? "busy"
          : "idle";
    n.setAttribute("data-state", r);
  }
  function X(e, n, r) {
    const o = t(e);
    o &&
      ((o.className = "alert " + n),
      (o.innerHTML = r),
      (o.style.display = ""),
      o.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  }
  function Z(e) {
    const n = t(e);
    n && (n.style.display = "none");
  }
  function Q(e) {
    const n = t(e);
    if (!n) return;
    const r = "DETAILS" === n.tagName ? n : n.querySelector("details.adv");
    if (!r) return;
    let o = r.parentElement;
    for (; o; )
      ("DETAILS" === o.tagName && (o.open = !0), (o = o.parentElement));
    ((r.open = !0), r.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  }
  function ee(e, n, r) {
    const o = t(e);
    if (!o) return;
    o.style.display = n >= r ? "none" : "block";
    const a = o.querySelector("i");
    a && (a.style.width = (r ? Math.min(100, (n / r) * 100) : 0) + "%");
  }
  let te = null,
    ne = !1;
  function re(e, n, r, o, a) {
    ((T = document.activeElement), te && (clearInterval(te), (te = null)));
    const s = t("dIcon");
    ((s.className = "d-icon " + e),
      (s.textContent =
        "err" === e ? "✕" : "warn" === e ? "!" : "ok" === e ? "✓" : "i"),
      (t("dTitle").textContent = n),
      (t("dBody").innerHTML = r));
    const i = t("dActions");
    ((i.innerHTML = ""),
      (o && o.length ? o : [{ label: "知道了", style: "primary" }]).forEach(
        (e) => {
          const t = document.createElement("button");
          ((t.className = "mbtn" + (e.style ? " " + e.style : "")),
            (t.textContent = e.label),
            (t.onclick = () => {
              (oe(), e.step && Q(e.step), e.fn && e.fn());
            }),
            i.appendChild(t));
        },
      ),
      (t(u).style.display = "flex"));
    try {
      t("dTitle").focus();
    } catch (e) {
      i.firstChild && i.firstChild.focus();
    }
    if (a > 0 && i.lastChild) {
      const e = i.lastChild,
        t = e.textContent;
      let n = a;
      ((e.textContent = t + "（" + n + " 秒后自动关闭）"),
        (ne = !1),
        (te = setInterval(() => {
          ne ||
            (--n <= 0
              ? oe()
              : (e.textContent = t + "（" + n + " 秒后自动关闭）"));
        }, 1e3)));
    }
  }
  function oe() {
    if (
      (te && (clearInterval(te), (te = null)),
      (ne = !1),
      (t(u).style.display = "none"),
      T && T.focus)
    )
      try {
        T.focus();
      } catch (e) {}
    T = null;
  }
  (t(u).addEventListener("mouseenter", () => {
    ne = !0;
  }),
    t(u).addEventListener("mouseleave", () => {
      ne = !1;
    }),
    t(u).addEventListener("click", (e) => {
      e.target === t(u) && oe();
    }));
  let ae = null;
  function se() {
    if (((t(m).style.display = "none"), ae && ae.focus))
      try {
        ae.focus();
      } catch (e) {}
    ae = null;
  }
  document.addEventListener("keydown", (e) => {
    if (
      ("Escape" === e.key &&
        ("flex" === t(u).style.display
          ? oe()
          : "flex" === t(m).style.display && se()),
      (e.ctrlKey || e.metaKey) && "Enter" === e.key)
    ) {
      const n = "true" === t(s).getAttribute("aria-selected");
      "flex" === t(u).style.display ||
        "flex" === t(m).style.display ||
        D ||
        (e.preventDefault(),
        n
          ? "none" !== t("packSubBtn").style.display
            ? t("packSubBtn").click()
            : t("scanSubBtn").click()
          : "none" !== t("s1").style.display && t("runStrmBtn").click());
    }
    if ("Tab" === e.key && "flex" === t(u).style.display) {
      const n = [...t("dActions").querySelectorAll("button")];
      if (!n.length) return;
      const r = n[0],
        o = n[n.length - 1];
      document.activeElement === t("dTitle")
        ? (e.preventDefault(), (e.shiftKey ? o : r).focus())
        : e.shiftKey && document.activeElement === r
          ? (e.preventDefault(), o.focus())
          : e.shiftKey ||
            document.activeElement !== o ||
            (e.preventDefault(), r.focus());
    }
    if ("Tab" === e.key && "flex" === t(m).style.display) {
      const n = [
        ...t(m).querySelectorAll('button,input,[tabindex="0"]'),
      ].filter((e) => !e.disabled && null !== e.offsetParent);
      if (!n.length) return;
      const r = n[0],
        o = n[n.length - 1];
      e.shiftKey && document.activeElement === r
        ? (e.preventDefault(), o.focus())
        : e.shiftKey ||
          document.activeElement !== o ||
          (e.preventDefault(), r.focus());
    }
  });
  const ie = new Map(),
    le = {
      NO_VIDEO: {
        label: "⚡ 一键定位视频目录",
        panel: "strm",
        async apply(n) {
          const r = n.dir || O(t("cloudDir").value);
          if (!r || "/" === r)
            return { ok: !1, reason: "云盘目录为空，请先选择目录。" };
          let o = await _e(r, !0);
          if (o.ok && o.items.some(Te))
            return { ok: !0, detail: "强制刷新后已读到视频", rerun: "strm" };
          const a = o.ok
            ? o.items.filter((t) => t.is_dir && !e.SKIP_DIR.test(t.name))
            : [];
          for (const e of a) {
            const t = await _e(P(r, e.name), !0);
            if (t.ok && t.items.some(Te))
              return (
                V(P(r, e.name)),
                ot(),
                {
                  ok: !0,
                  detail: "已自动定位到含视频的子目录：" + e.name,
                  rerun: "strm",
                }
              );
          }
          return {
            ok: !1,
            reason:
              "当前目录及其一级子目录均未发现视频，请确认云盘路径填到了装视频的那一层。",
          };
        },
        verify: (e) =>
          e && e.ok && e.groups > 0
            ? { ok: !0, msg: "已找到视频并生成 " + e.groups + " 个 strm。" }
            : { ok: !1, msg: (e && e.reason) || "仍未生成文件。" },
      },
      READ_FAIL: {
        label: "⚡ 一键刷新重试",
        panel: "strm",
        apply: (e) => (
          (t("forceRefresh").checked = !0),
          ot(),
          {
            ok: !0,
            detail: "已开启「强制刷新目录」并重试",
            rerun: e.rerun || "strm",
          }
        ),
        verify: (e) =>
          e && e.ok
            ? { ok: !0, msg: "刷新后读取成功。" }
            : {
                ok: !1,
                msg: (e && e.reason) || "刷新后仍失败，请检查路径与账号权限。",
              },
      },
      CONN_FAIL: {
        label: "⚡ 一键重连",
        panel: "strm",
        apply: () => (
          (p = null),
          (h = ""),
          { ok: !0, detail: "正在重新探测 OpenList 地址", rerun: "conn" }
        ),
        verify: (e) =>
          e && e.ok
            ? { ok: !0, msg: "已连接成功：" + f }
            : {
                ok: !1,
                msg:
                  "自动重连失败：" +
                  ((e && e.reason) || h || "未知") +
                  "。CORS 或密码问题需在「连接设置」里修正。",
              },
      },
      SUB_NO_DIR: {
        label: "⚡ 从最近目录带入",
        panel: "sub",
        apply() {
          const e = (function () {
            try {
              const e = JSON.parse(
                localStorage.getItem("wb_avtool_recent_dirs") || "[]",
              );
              return Array.isArray(e) ? e : [];
            } catch (e) {
              return [];
            }
          })();
          let n =
              e.find((e) => /媒体库|剧集|Media|Season/i.test(e)) || e[0] || "",
            r = "最近目录";
          if (!n) {
            const e = O(t("cloudDir").value),
              o = e.match(/^(.*\/媒体库)/i) || e.match(/^(.*\/剧集)/i);
            o && ((n = o[1]), (r = "云盘路径推断的媒体库根"));
          }
          return n && "/" !== n
            ? ((t("libDir").value = n),
              (t("libDir2").value = n),
              ot(),
              { ok: !0, detail: "已" + r + "带入：" + n, rerun: "sub" })
            : {
                ok: !1,
                reason:
                  "找不到可推断的媒体库目录，请在「媒体库目录」手动填写（错误弹窗已为你展开该输入框）。",
              };
        },
        verify: (e) =>
          e && e.ok
            ? { ok: !0, msg: "已重新扫描到字幕。" }
            : {
                ok: !1,
                msg: "带入后仍无结果，请确认该目录确实是存放字幕的媒体库目录。",
              },
      },
      SUB_NO_FILE: {
        label: "⚡ 一键递归重扫",
        panel: "sub",
        apply: () =>
          t("subRecursive").checked
            ? {
                ok: !1,
                reason:
                  "已开启递归仍未找到字幕，请把目录填到 Season 一级，或确认字幕文件确实存在。",
              }
            : ((t("subRecursive").checked = !0),
              ot(),
              {
                ok: !0,
                detail: "已开启递归扫描子目录（最多 " + e.MAX_DEPTH + " 层）",
                rerun: "sub",
              }),
        verify: (e) =>
          e && e.ok
            ? { ok: !0, msg: "递归扫描找到 " + e.count + " 个字幕。" }
            : { ok: !1, msg: "递归后仍未找到字幕。" },
      },
      NO_NEW: {
        label: "⚡ 一键全量重生成",
        panel: "strm",
        apply: () => (
          (t("incremental").checked = !1),
          ot(),
          { ok: !0, detail: "已关闭增量比对，改为全量生成", rerun: "strm" }
        ),
        verify: (e) =>
          e && e.ok && e.groups > 0
            ? { ok: !0, msg: "已生成 " + e.groups + " 个 strm。" }
            : { ok: !1, msg: (e && e.reason) || "全量生成仍失败。" },
      },
    };
  function ce(e, t, n) {
    return {
      label: n || le[e].label,
      style: "primary",
      fn: () =>
        (async function (e, t) {
          const n = le[e];
          if (n)
            if (D) re("warn", "已有操作进行中", "请等当前操作结束后再试。");
            else {
              D = !0;
              try {
                const e = "sub" === n.panel ? l : i;
                let r;
                K(e, "⚡ 一键修复：" + n.label + " …");
                try {
                  r = await n.apply(t || {});
                } catch (e) {
                  r = { ok: !1, reason: (e && e.message) || "修复执行出错" };
                }
                if (!r.ok)
                  return (
                    re(
                      "warn",
                      "自动修复未完成",
                      N(r.reason) +
                        '<div class="hint">该项无法完全自动处理，按提示处理后可再试。</div>',
                    ),
                    void K(e, "✕ " + r.reason, "err-t")
                  );
                K(e, "✓ 已应用：" + r.detail, "ok-t");
                const o = r.rerun || n.rerun;
                if (!o) return void re("ok", "✓ 已自动修复", N(r.detail));
                let a = null;
                try {
                  "strm" === o
                    ? (a = await lt({ fromFix: !0, internal: !0 }))
                    : "sub" === o
                      ? (a = await kt({ fromFix: !0, internal: !0 }))
                      : "conn" === o && (a = await ye({ force: !0 }));
                } catch (e) {
                  a = { ok: !1, reason: (e && e.message) || "后续操作出错" };
                }
                const s = n.verify
                  ? n.verify(a, r)
                  : { ok: !(!a || !a.ok), msg: (a && a.reason) || "" };
                s.ok
                  ? (re(
                      "ok",
                      "✓ 已自动修复",
                      "<b>" +
                        N(r.detail) +
                        '</b><div class="hint">' +
                        N(s.msg || "问题已解决。") +
                        "</div>",
                    ),
                    K(e, "✓ 修复验证通过：" + s.msg, "ok-t"))
                  : (re(
                      "warn",
                      "自动修复后仍有问题",
                      "<b>已执行：</b>" +
                        N(r.detail) +
                        "<br><b>结果：</b>" +
                        N(s.msg || (a && a.reason) || "未知") +
                        '<div class="hint">可点「复制诊断信息」反馈，或按提示处理。</div>',
                    ),
                    K(e, "✕ 修复验证失败：" + s.msg, "err-t"));
              } finally {
                D = !1;
              }
            }
          else
            re(
              "err",
              "无法自动修复",
              "未识别的问题类型（" + N(e) + "），请复制诊断信息反馈。",
            );
        })(e, t),
    };
  }
  function de(t) {
    const n = (function (t) {
      const n = B(String(t || ""));
      let r,
        o = "";
      const a = [
        ...n.matchAll(
          /[Ss]\s*(\d{1,3})\s*[Ee]\s*(\d{1,6})(?:[\s\-~&]*E?\s*(\d{1,6}))?(?:\s*[Ee]\s*(\d{1,6}))?/g,
        ),
      ];
      if (a.length) {
        o = a[0][1].padStart(2, "0");
        const e = [];
        for (const t of a)
          if (
            (e.push(parseInt(t[2], 10)),
            t[4] && e.push(parseInt(t[4], 10)),
            t[3] && +t[3] > +t[2] && +t[3] - +t[2] <= 24)
          )
            for (let n = +t[2]; n <= +t[3]; n++) e.push(n);
          else t[3] && +t[3] === +t[2] && e.push(+t[3]);
        return { season: o, eps: [...new Set(e)].sort((e, t) => e - t) };
      }
      if ((r = n.match(/第\s*(\d{1,6})\s*(?:[-~到]\s*(\d{1,6})\s*)?集/))) {
        const e = +r[1],
          t = r[2] ? +r[2] : e,
          n = [];
        for (let r = e; r <= t && r - e <= 24; r++) n.push(r);
        return { season: o, eps: n };
      }
      if ((r = n.match(/[\[【]\s*(\d{1,4})\s*[\]】]/)))
        return { season: o, eps: [+r[1]] };
      if (
        (r = n.match(
          /(?:^|[^A-Za-z])[Ee][Pp]?[ ._-]*(\d{1,4})(?:\s*[-~]\s*(\d{1,4}))?(?!\d)/,
        ))
      ) {
        if (r[2]) {
          const e = +r[1],
            t = +r[2],
            n = [];
          for (let r = e; r <= t && t - e <= 24; r++) n.push(r);
          return { season: o, eps: n };
        }
        return { season: o, eps: [+r[1]] };
      }
      const s = n
          .replace(e.NOISE_RE, " ")
          .replace(/[\[【][^\]】]*[\]】]/g, " ")
          .replace(/[._]+/g, " ")
          .replace(/\s+/g, " ")
          .trim(),
        i = [],
        l = /(?:^|[\s(\[-])([0-9]{1,4})(?=$|[\s)\]])/g;
      for (; (r = l.exec(s)); ) {
        const t = +r[1];
        t >= 1 &&
          t <= 999 &&
          !/^(19|20)\d{2}$/.test(r[1]) &&
          !e.BAD_NUMS.has(t) &&
          i.push(t);
      }
      return { season: o, eps: i.length ? [i[i.length - 1]] : [] };
    })(t);
    return (
      (n.eps = (n.eps || []).filter(
        (e) => Number.isInteger(e) && e >= 1 && e <= 1e4,
      )),
      n
    );
  }
  function ue(e) {
    const t = O(e).split("/").filter(Boolean);
    for (let e = t.length - 1; e >= 0; e--) {
      const n = t[e];
      let r =
        n.match(/[Ss]eason\s*(\d{1,2})/i) ||
        n.match(/第\s*(\d{1,2})\s*季/) ||
        n.match(/(?:^|[^A-Za-z])S(\d{1,2})(?!\d)/i);
      if (r) return M(+r[1]);
    }
    return "";
  }
  function me(t, n) {
    const r = B(String(t || ""));
    let o = "";
    const a = r.match(/[Ss]\s*(\d{1,3})\s*[Ee]\s*\d{1,6}/);
    return (
      a && +a[1] <= 999 && (o = M(+a[1])),
      !o && n && (o = ue(n)),
      {
        title:
          r
            .split(/[. _\-]?[Ss]\s*\d{1,3}\s*[Ee]\s*\d{1,6}/i)[0]
            .replace(/[\[【][^\]】]*[\]】]/g, " ")
            .replace(/[（(][^）)]*[）)]/g, " ")
            .replace(e.NOISE_RE, " ")
            .replace(/[._\s-](?:19|20)\d{2}(?=$|[._\s-])/g, " ")
            .replace(/第\s*\d{1,4}\s*集/g, " ")
            .replace(/[Ee][Pp]?\s*\d{1,4}/g, " ")
            .replace(/[-—–]{2,}/g, " ")
            .replace(/[._]+/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .replace(/^[\s\-—–]+|[\s\-—–]+$/g, "") || "",
        season: o,
      }
    );
  }
  const fe =
    /(?:[._\- ]?(zho|zh|chi|zhs|zht|zh-hans|zh-hant|chs|cht|sc|tc|cn|en|eng|jp|jpn|ko|kor|简|繁|简体|繁体|中文|双语))+$/i;
  function pe(e) {
    const t = String(e || ""),
      n = t.match(fe);
    return n
      ? {
          base: t.slice(0, n.index).replace(/[._\- ]+$/, ""),
          lang: (n[1] || "").toLowerCase(),
        }
      : { base: t, lang: "" };
  }
  function he(t, n, r) {
    const o = new Map(),
      a = [];
    let s = 0;
    const i = n.map((e) => ({
      raw: B(e.name),
      norm: B(e.name).replace(/\s+/g, " ").trim(),
    }));
    for (const n of t) {
      const t = (n.name.match(e.SUB_RE) || [])[1] || "srt",
        l = B(n.name);
      let c,
        d = pe(l);
      if (
        ((d.base && d.base.trim()) || (d = { base: l, lang: "" }), "keep" === r)
      )
        c = l;
      else {
        const e =
          i.find((e) => e.norm === d.base) ||
          i.find((e) => e.norm === l) ||
          i.find(
            (e) => e.raw.replace(/[._]/g, " ") === d.base.replace(/[._]/g, " "),
          );
        c = e ? e.raw : d.base;
      }
      c = A(c);
      let u = c + "." + t;
      if (o.has(u)) {
        s++;
        const e = d.lang || "zho";
        u = c + "." + e + "." + t;
        let n = 2;
        for (; o.has(u); ) u = c + "." + e + n++ + "." + t;
      }
      (o.set(u, !0), a.push({ file: n, target: u, ext: t, lang: d.lang }));
    }
    return { items: a, conflicts: s };
  }
  async function ge(n) {
    const r = new AbortController(),
      o = setTimeout(() => r.abort(), e.TIMEOUT_LOGIN),
      a = t("userName").value.trim() || e.USER,
      s = t("userPwd").value || e.PWD;
    try {
      const e = await fetch(n.replace(/\/+$/, "") + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: a, password: s }),
        signal: r.signal,
      });
      let t;
      try {
        t = await e.json();
      } catch (t) {
        return {
          ok: !1,
          error: "登录接口未返回 JSON（HTTP " + e.status + "）",
        };
      }
      if (!e.ok) return { ok: !1, error: "HTTP " + e.status };
      if (void 0 !== t.code && 200 !== t.code)
        return {
          ok: !1,
          error:
            401 === t.code
              ? "账号或密码错误："
              : t.message || t.msg || "登录失败 code " + t.code,
        };
      const o = t.data && t.data.token;
      return o ? { ok: !0, token: o } : { ok: !1, error: "未取得 token" };
    } catch (e) {
      return {
        ok: !1,
        error:
          "AbortError" === e.name
            ? "连接超时"
            : (e.message || "网络错误") +
              "（若从 file:// 打开，多为 CORS/预检被拦）",
      };
    } finally {
      clearTimeout(o);
    }
  }
  let be = null;
  async function ye(n) {
    return (
      (n = n || {}),
      p && !n.force
        ? { ok: !0 }
        : be ||
          ((be = (async () => {
            const n = [
              R(t("apiBase").value) || e.API_BASE,
              ...e.CANDIDATES,
            ].filter((e, t, n) => e && n.indexOf(e) === t);
            h = "";
            for (let e = 0; e < n.length; e++) {
              Y("正在连接 " + n[e] + "（" + (e + 1) + "/" + n.length + "）…");
              const r = await ge(n[e]);
              if (r.ok)
                return (
                  (f = n[e].replace(/\/+$/, "")),
                  (p = r.token),
                  (t("apiBase").value = f),
                  ot(),
                  Y("已连接 " + f),
                  { ok: !0 }
                );
              ((h = n[e] + "：" + r.error),
                K(
                  i,
                  "连接尝试 " + (e + 1) + "/" + n.length + " 失败：" + r.error,
                  "warn-t",
                ));
            }
            return (Y("连接失败"), { ok: !1, error: h });
          })().finally(() => {
            be = null;
          })),
          be)
    );
  }
  function ke() {
    const base = (t("apiBase").value || "").trim();
    const err = h || "";
    const httpsPageHttpBase = "https:" === location.protocol && /^http:\/\//i.test(base);
    let diagnosis, fix;
    if (httpsPageHttpBase || /mixed content|已被阻止|insecure/i.test(err)) {
      diagnosis = "混合内容被浏览器阻断：当前页面是 https，OpenList 地址是 http。";
      fix = "用下载后的本地版（file://）打开，或给 OpenList 配 https；不要用在线 https 版连内网 http。";
    } else if (/CORS|Failed to fetch|NetworkError|跨域/i.test(err)) {
      diagnosis = "CORS 未放行，或根本连不上这个地址。";
      fix = "在 OpenList 反代加 Access-Control-Allow-Origin、Allow-Methods: GET, POST, PUT, OPTIONS、Allow-Headers: Authorization, Content-Type, File-Path；也确认地址和端口没错。";
    } else if (/401|账号或密码错误|凭据/i.test(err)) {
      diagnosis = "401：地址通了，但账号或密码不对。";
      fix = "核对 OpenList 用户名密码，或换一个 token；不要把密码发到任何公开区。";
    } else if (/超时|timeout/i.test(err)) {
      diagnosis = "连接超时：地址填错、端口不通，或 OpenList 没启动。";
      fix = "先在浏览器打开 OpenList 首页，确认能访问，再回来填同一个地址。";
    } else {
      diagnosis = "没有拿到可用响应。";
      fix = "先确认 OpenList 已启动、地址端口正确；仍不行就复制诊断信息。";
    }
    re(
      "err",
      "连不上 OpenList",
      "<b>诊断：</b>" + N(diagnosis) +
        '<div class="hint" style="margin-top:8px"><b>怎么修：</b>' + N(fix) + "</div>" +
        '<div class="hint" style="margin-top:8px">最后错误：' + N(err || "未知") + "</div>" +
        '<div class="hint" style="margin-top:6px">不确定怎么处理？点「复制诊断信息」发我。</div>',
      [
        ce("CONN_FAIL", {}),
        { label: "去检查连接设置", step: "advConn" },
        { label: "知道了" },
      ],
    );
  }
  async function ve(t, n, r) {
    const o = { "Content-Type": "application/json" },
      a = (r = r || {}).token || p;
    a && (o.Authorization = a);
    const s = new AbortController(),
      i = setTimeout(() => s.abort(), r.timeout || e.TIMEOUT_API);
    try {
      const e = await fetch(f + t, {
        method: n ? "POST" : "GET",
        headers: o,
        body: n ? JSON.stringify(n) : void 0,
        signal: s.signal,
      });
      let r;
      try {
        r = await e.json();
      } catch (t) {
        return {
          ok: !1,
          kind: "parse",
          error: "响应不是 JSON（HTTP " + e.status + "）",
        };
      }
      return e.ok
        ? void 0 !== r.code && 200 !== r.code
          ? {
              ok: !1,
              kind: 401 === r.code || 403 === r.code ? "auth" : "biz",
              code: r.code,
              error: r.message || r.msg || "接口返回 " + r.code,
            }
          : { ok: !0, data: r.data }
        : {
            ok: !1,
            kind: "http",
            status: e.status,
            error: "HTTP " + e.status,
            data: r,
          };
    } catch (e) {
      return {
        ok: !1,
        kind: "AbortError" === e.name ? "timeout" : "network",
        error: "AbortError" === e.name ? "请求超时" : e.message || "网络错误",
      };
    } finally {
      clearTimeout(i);
    }
  }
  async function we(e, t, n) {
    let r = await ve(e, t, n);
    return (
      r.ok ||
        "auth" !== r.kind ||
        ((await ye({ force: !0 })).ok && (r = await ve(e, t, n))),
      r
    );
  }
  async function Se(e) {
    const t = await we("/api/fs/mkdir", { path: O(e) });
    return t.ok || 500 === t.code || (t.error && /exist|存在/i.test(t.error));
  }
  async function Ee(t, n, r) {
    const o = r || 0,
      a = new AbortController(),
      s = setTimeout(() => a.abort(), e.TIMEOUT_FETCH);
    try {
      const e = {
          Authorization: p,
          "File-Path": encodeURIComponent(O(t)),
          "Content-Type": "application/octet-stream",
        },
        r =
          n instanceof Uint8Array || n instanceof Blob
            ? n
            : String(null == n ? "" : n),
        s = await fetch(f + "/api/fs/put", {
          method: "PUT",
          headers: e,
          body: r,
          signal: a.signal,
        });
      let i;
      try {
        i = await s.json();
      } catch (e) {
        return s.ok
          ? { ok: !0 }
          : { ok: !1, error: "响应非 JSON（HTTP " + s.status + "）" };
      }
      if (401 === s.status || 403 === s.status)
        return o < 1 && (await ye({ force: !0 })).ok
          ? Ee(t, n, o + 1)
          : { ok: !1, error: "登录已过期，重连失败" };
      if (!s.ok) return { ok: !1, error: "HTTP " + s.status };
      if (void 0 !== i.code && 200 !== i.code) {
        const e = i.message || i.msg || "code " + i.code;
        return (401 === i.code || 403 === i.code) &&
          o < 1 &&
          (await ye({ force: !0 })).ok
          ? Ee(t, n, o + 1)
          : { ok: !1, error: e };
      }
      return { ok: !0 };
    } catch (e) {
      return o < 1 && "AbortError" !== e.name
        ? Ee(t, n, o + 1)
        : {
            ok: !1,
            error:
              "AbortError" === e.name ? "上传超时" : e.message || "上传失败",
          };
    } finally {
      clearTimeout(s);
    }
  }
  async function xe(e, n, manifest) {
    const r = W(),
      o = e
        .filter((e) => e.libDir && e.prefix)
        .map((e) => ({
          target: P(ht(e.libDir, e.prefix, e.season), e.filename),
          content: e.content,
          filename: e.filename,
          libDir: O(e.libDir),
        })),
      a = e.length - o.length;
    if (!o.length)
      return { ok: 0, fail: 0, skipped: a, msg: "未填媒体库目录，已跳过上传" };
    const s = [...new Set(o.map((e) => e.target.replace(/\/[^/]*$/, "")))];
    for (const e of s)
      if (!(await Se(e)))
        return {
          ok: 0,
          fail: o.length,
          skipped: a,
          msg: "目标目录无法创建或无写权限：" + e,
        };
    (K(n, "自动上传 " + o.length + " 个 strm（并发 " + r + "）…"),
      (t("strmProgress").style.display = "block"),
      (t("strmProgress").querySelector("i").style.width = "0%"));
    const i = await Qe(
      o,
      r,
      async (e) => {
        const t = await Ee(e.target, e.content);
        return t.ok ? { ok: !0 } : { error: e.filename + "：" + t.error };
      },
      (e, n) => {
        t("strmProgress").querySelector("i").style.width =
          Math.round((e / n) * 100) + "%";
      },
    );
    t("strmProgress").style.display = "none";
    const l = i.filter((e) => e && e.ok).length,
      c = i.filter((e) => e && e.error).map((e) => e.error);
    let manifestResult = null;
    if (manifest && o.length) {
      if (c.length) {
        manifestResult = {
          ok: false,
          target: P(o[0].libDir, "manifest.json"),
          error: "有 " + c.length + " 个 strm 上传失败，manifest 未写回，避免下次误判为已存在",
        };
        K(n, "manifest 未写回：本次有 strm 上传失败，先修好失败项再重跑", "warn-t");
      } else {
        const target = P(o[0].libDir, "manifest.json"),
          merged = await manifestForLibraryRoot(o[0].libDir, manifest);
        if (!merged) {
          manifestResult = {
            ok: false,
            target,
            error:
              "读取现有媒体库 manifest 失败，本次不写回，避免覆盖其他剧集的条目",
          };
          K(
            n,
            "manifest 未写回：读取现有媒体库 manifest 失败，不能安全合并",
            "warn-t",
          );
        } else {
          const wrote = await Ee(target, manifestFileOf(merged).content);
          manifestResult = {
            ok: !!wrote.ok,
            target,
            error: wrote.error || "",
          };
          wrote.ok
            ? K(
                n,
                "✓ manifest 已合并写回媒体库根目录：" +
                  target +
                  "（" +
                  merged.entries.length +
                  " 条）",
                "ok-t",
              )
            : K(n, "manifest 写回失败：" + (wrote.error || "未知错误"), "warn-t");
        }
      }
    }
    return {
      ok: l,
      fail: c.length,
      skipped: a,
      msg: c.slice(0, 3).join("；"),
      failList: c,
      manifest: manifestResult,
    };
  }
  async function _e(n, r) {
    const o = O(n),
      a = void 0 === r ? t("forceRefresh").checked : r,
      s = await we("/api/fs/list", {
        path: o,
        page: 1,
        per_page: e.PER_PAGE,
        refresh: !!a,
      });
    if (!s.ok) return s;
    const i = s.data || {},
      l = (i.content || []).slice(),
      c = i.total || l.length;
    let d = 2,
      u = 0;
    for (; l.length < c && u++ < 200; ) {
      const t = await we("/api/fs/list", {
        path: o,
        page: d,
        per_page: e.PER_PAGE,
        refresh: !1,
      });
      if (!t.ok) return { ok: !0, items: l, incomplete: !0, error: Ce(t) };
      const n = (t.data && t.data.content) || [];
      if (!n.length)
        return { ok: !0, items: l, incomplete: !0, error: "分页返回空页" };
      (l.push(...n), d++);
    }
    return { ok: !0, items: l };
  }
  async function De(t, n, r, o) {
    o = o || {};
    const a =
      (0 === n && o.rootItems && o.rootItems[t]) ||
      (await _e(t, 0 === n && o.refresh));
    if (!a.ok) return a;
    a.incomplete &&
      o.onSkip &&
      o.onSkip(t, "目录列表不完整（" + (a.error || "分页失败") + "）");
    for (const e of a.items) r.push(Object.assign({}, e, { __dir: t }));
    if (r.length > e.MAX_FILES)
      return { ok: !1, error: "扫描文件数超过上限，请缩小目录范围" };
    if (n < e.MAX_DEPTH)
      for (const s of a.items.filter((e) => e.is_dir)) {
        if (e.SKIP_DIR.test(s.name)) continue;
        const a = await De(P(t, s.name), n + 1, r, o);
        a.ok || (o.onSkip && o.onSkip(P(t, s.name), Ce(a)));
      }
    return { ok: !0 };
  }
  const Te = (t) =>
    !t.is_dir && e.VIDEXT.some((e) => t.name.toLowerCase().endsWith(e));
  function Le(t, n) {
    if (!Te(t)) return !1;
    const r = String(t.__dir || n || ""),
      o = String(t.name || ""),
      a = B(o);
    return !(
      e.NON_MEDIA.test(a) ||
      e.NON_MEDIA_WORD.test(a) ||
      e.NON_MEDIA_WORD.test(r) ||
      (!e.MEDIA_HINT.test(a) &&
        !de(o).eps.length &&
        (!/\b(?:19|20)\d{2}\b/.test(a) || /^\d{6,}$/.test(a)) &&
        !/season\s*\d+|第\s*\d+\s*季|s\d{1,2}\b/i.test(r) &&
        !/[\u4e00-\u9fff]{2,}/.test(a) &&
        (!/^[A-Za-z][A-Za-z0-9 ._'\-]{2,}$/.test(a) ||
          /^(?:video|movie|clip|new|untitled|test|sample|temp|dsc|img)\b/i.test(
            a,
          )))
    );
  }
  function Ie(e, t) {
    const n = [],
      r = [];
    for (const o of e) Le(o, t) ? n.push(o) : r.push(o.name);
    return { media: n, excluded: r };
  }
  function Ce(e) {
    return e.error + (e.code ? "（code " + e.code + "）" : "");
  }
  const Ne = "wb_avtool_recent_dirs";
  function Be() {
    try {
      const e = JSON.parse(localStorage.getItem(Ne) || "[]");
      return Array.isArray(e)
        ? e.filter((e) => "string" == typeof e).slice(0, 6)
        : [];
    } catch (e) {
      return [];
    }
  }
  function Me(e) {
    if (!e || "/" === e) return;
    const t = Be().filter((t) => t !== e);
    t.unshift(e);
    try {
      localStorage.setItem(Ne, JSON.stringify(t.slice(0, 6)));
    } catch (e) {}
  }
  function Ae() {
    const n = t("pickSearch").value.trim().toLowerCase();
    return b
      .filter(
        (t) =>
          t.is_dir &&
          !e.SKIP_DIR.test(t.name) &&
          (!n || t.name.toLowerCase().includes(n)),
      )
      .sort((e, t) => e.name.localeCompare(t.name));
  }
  function Oe(e) {
    return ("/" === g ? "" : g) + "/" + e.name;
  }
  function Pe() {
    t("pickCrumb").textContent = g && "/" !== g ? g : "全部目录";
    const e = t("pickList");
    e.innerHTML = "";
    const n = Ae();
    if (!n.length)
      return (
        (e.innerHTML =
          '<div class="picker-empty">' +
          N(
            t("pickSearch").value.trim()
              ? "没有匹配的文件夹"
              : '这一层没有子文件夹，可直接点"用此目录"',
          ) +
          "</div>"),
        void Re()
      );
    for (const t of n) {
      const n = Oe(t),
        r = v.has(n),
        o = document.createElement("button");
      ((o.type = "button"),
        (o.className = "picker-item"),
        (o.innerHTML =
          '<span class="pk' +
          (r ? " on" : "") +
          '" role="checkbox" tabindex="0" aria-checked="' +
          r +
          '" aria-label="勾选「' +
          N(t.name) +
          '」用于批量生成" title="勾选此目录用于批量生成">' +
          (r ? "☑" : "☐") +
          '</span><span class="nm">📁 ' +
          N(t.name) +
          '</span><span class="tg">›</span>'));
      const a = () => {
        (v.has(n) ? v.delete(n) : v.set(n, t.name), Pe(), Ue());
      };
      o.onclick = (e) => {
        e.target && e.target.classList && e.target.classList.contains("pk")
          ? a()
          : He(n);
      };
      const s = o.querySelector(".pk");
      (s &&
        s.addEventListener("keydown", (e) => {
          (" " !== e.key && "Enter" !== e.key) ||
            (e.preventDefault(), e.stopPropagation(), a());
        }),
        e.appendChild(o));
    }
    Re();
  }
  function Re() {
    const e = Ae(),
      n = e.filter((e) => v.has(Oe(e))).length,
      r = t("pickAll");
    r &&
      ((r.checked = e.length > 0 && n === e.length),
      (r.indeterminate = n > 0 && n < e.length),
      (r.disabled = !e.length));
    const o = t("pickAllLabel");
    o &&
      (o.textContent = e.length
        ? "全选本层（" + e.length + "）"
        : "本层无文件夹");
    const a = t("pickCount");
    a &&
      ((a.innerHTML = v.size ? "已选 " + v.size + " · <u>清空</u>" : ""),
      (a.title = v.size ? "点击清空已选目录" : ""));
  }
  function Ue() {
    const e = v.size;
    ((t("pickBatch").style.display = e && "lib" !== w ? "" : "none"),
      (t("pickBatch").textContent = "批量生成所选（" + e + "）"),
      (t("pickUse").style.display = e ? "none" : ""));
    const n = t("pickHint");
    (n && (n.textContent = ""), Re());
  }
  async function He(e) {
    const n = O(e),
      r = ++y;
    ((g = n),
      (t("pickSearch").value = ""),
      (t("pickList").innerHTML = '<div class="picker-empty">读取中…</div>'));
    const o = await _e(n, !1);
    if (r === y) {
      if (!o.ok)
        return (
          (t("pickList").innerHTML =
            '<div class="picker-empty">读取失败：' + N(o.error) + "</div>"),
          void (b = [])
        );
      ((b = o.items || []), Pe());
    }
  }
  async function Fe(e) {
    if (D) return;
    ((w = "lib" === e ? "lib" : "strm"),
      (ae = document.activeElement),
      (t(m).style.display = "flex"),
      (t("pickTitle").textContent =
        "lib" === w ? "选择媒体库目录" : "选择云盘视频目录"),
      (t("pickUse").textContent =
        "lib" === w ? "用此目录作为媒体库" : "用此目录"),
      t("pickList") && t("pickList").classList.toggle("nopick", "lib" === w),
      t("pickAll") &&
        t("pickAll").parentElement &&
        (t("pickAll").parentElement.style.display = "lib" === w ? "none" : ""));
    try {
      t("pickSearch").focus();
    } catch (e) {}
    if (
      ((t("pickSearch").value = ""),
      v.clear(),
      Ue(),
      (function () {
        const e = t("pickRecent");
        if (!e) return;
        const n = Be();
        if (!n.length)
          return ((e.style.display = "none"), void (e.innerHTML = ""));
        ((e.style.display = "block"),
          (e.innerHTML = n
            .map(
              (e) =>
                '<button type="button" class="recent-chip" data-d="' +
                N(e) +
                '" title="' +
                N(e) +
                '">' +
                N(((e) => e.split("/").filter(Boolean).pop() || e)(e)) +
                "</button>",
            )
            .join("")),
          e.querySelectorAll(".recent-chip").forEach((e) => {
            e.onclick = () => He(e.getAttribute("data-d"));
          }));
      })(),
      !(await ye()).ok)
    )
      return (se(), void ke());
    const n =
      "lib" === w
        ? O(t("libDir").value)
        : t("cloudDir")
            .value.trim()
            .replace(/\/[^/]*$/, "") || "/";
    await He(n || "/");
  }
  (t("pickSearch").addEventListener("input", Pe),
    t("pickAll").addEventListener("change", (e) => {
      const t = Ae();
      (e.target.checked
        ? t.forEach((e) => v.set(Oe(e), e.name))
        : t.forEach((e) => v.delete(Oe(e))),
        Pe(),
        Ue());
    }),
    (t("pickBack").onclick = () => {
      He(g.replace(/\/[^/]*$/, "") || "/");
    }),
    (t("pickCancel").onclick = se),
    (t("pickCount").onclick = () => {
      v.size && (v.clear(), Pe(), Ue());
    }),
    t(m).addEventListener("click", (e) => {
      e.target === t(m) && se();
    }),
    (t("pickUse").onclick = async () => {
      const e = g;
      if (!e || "/" === e)
        return void re(
          "warn",
          "先进入视频文件夹",
          '当前在根目录。请点进装视频的文件夹，再点"用此目录"。',
        );
      const n = await _e(e, !1);
      if (!n.ok)
        return void re("err", "读取失败", "无法读取该目录：" + N(n.error));
      if ("lib" === w)
        return (
          (t("libDir").value = e),
          (t("libDir2").value = e),
          Me(e),
          ot(),
          nn(),
          se(),
          void re(
            "ok",
            "媒体库目录已带入",
            "已选择「" +
              N(e) +
              "」。点「扫描库里的剧集」即可列出里面的剧集/电影。",
            [
              {
                label: "去扫描",
                style: "green",
                fn: () => t("metaScanBtn").click(),
              },
            ],
          )
        );
      const r = n.items.filter(Te);
      ((t("cloudDir").value = e), Me(e), ie.clear(), (k = r));
      const o = me(r.length ? r[0].name : e.split("/").pop(), e);
      (o.title && (t("namePrefix").value = o.title),
        o.season && (t("season").value = o.season),
        st(),
        ot(),
        se(),
        re(
          "ok",
          "目录已带入",
          "已选择「" +
            N(e) +
            "」" +
            (r.length
              ? "，找到 " + r.length + " 个视频，剧名和季号已自动填好。"
              : "。这个目录没检测到视频，生成前请确认里面有视频文件。"),
          [
            {
              label: "去生成",
              style: "green",
              fn: () =>
                t("s1").scrollIntoView({ behavior: "smooth", block: "start" }),
            },
          ],
        ));
    }),
    document.addEventListener("click", (e) => {
      if (e.target.closest("#dirRow")) return void Fe();
      const n = e.target.closest("#connStatus");
      n &&
        ["idle", "err"].indexOf(n.getAttribute("data-state")) >= 0 &&
        !D &&
        t("checkBtn").click();
    }),
    (t("scanBtn").onclick = Fe));
  const je = (() => {
    const e = new Uint32Array(256);
    for (let t = 0; t < 256; t++) {
      let n = t;
      for (let e = 0; e < 8; e++) n = 1 & n ? 3988292384 ^ (n >>> 1) : n >>> 1;
      e[t] = n >>> 0;
    }
    return e;
  })();
  function ze(e) {
    let t = 4294967295;
    for (let n = 0; n < e.length; n++) t = je[255 & (t ^ e[n])] ^ (t >>> 8);
    return (4294967295 ^ t) >>> 0;
  }
  const $e = new TextEncoder(),
    Ke = (e) => [255 & e, (e >>> 8) & 255],
    qe = (e) => [255 & e, (e >>> 8) & 255, (e >>> 16) & 255, (e >>> 24) & 255],
    We = 0,
    Ge = 33,
    Je = 27525120;
  function Ve(e) {
    if (e.length > 65535) throw new Error("文件数超过 65535，需 ZIP64");
    const t = new Set(),
      n = [];
    for (const r of e) {
      if (t.has(r.name)) throw new Error("zip 内出现重复文件名：" + r.name);
      t.add(r.name);
      const e = $e.encode(r.name);
      if (e.length > 65535) throw new Error("文件名过长：" + r.name);
      const o =
        r.content instanceof Uint8Array
          ? r.content
          : $e.encode(String(null == r.content ? "" : r.content));
      if (o.length > 4294967295)
        throw new Error("单文件超过 4GB，需 ZIP64：" + r.name);
      n.push({ name: e, data: o, crc: ze(o) });
    }
    const r = [],
      o = [];
    let a = 0;
    for (const { name: e, data: t, crc: s } of n) {
      const n = [].concat(
        qe(67324752),
        Ke(20),
        Ke(2048),
        Ke(0),
        Ke(We),
        Ke(Ge),
        qe(s),
        qe(t.length),
        qe(t.length),
        Ke(e.length),
        Ke(0),
      );
      r.push(new Uint8Array(n), e, t);
      const i = [].concat(
        qe(33639248),
        Ke(20),
        Ke(20),
        Ke(2048),
        Ke(0),
        Ke(We),
        Ke(Ge),
        qe(s),
        qe(t.length),
        qe(t.length),
        Ke(e.length),
        Ke(0),
        Ke(0),
        Ke(0),
        Ke(0),
        qe(Je),
        qe(a),
      );
      (o.push(new Uint8Array(i), e), (a += n.length + e.length + t.length));
    }
    const s = o.reduce((e, t) => e + t.length, 0),
      i = [].concat(
        qe(101010256),
        Ke(0),
        Ke(0),
        Ke(e.length),
        Ke(e.length),
        qe(s),
        qe(a),
        Ke(0),
      ),
      l = [...r, ...o, new Uint8Array(i)],
      c = new Uint8Array(l.reduce((e, t) => e + t.length, 0));
    let d = 0;
    for (const e of l) (c.set(e, d), (d += e.length));
    return new Blob([c], { type: "application/zip" });
  }
  const manifestRelPath = (v) =>
      String(null == v ? "" : v)
        .replace(/\\/g, "/")
        .replace(/^\/+/, ""),
    manifestSource = (f) => ({
      name: String((f && f.name) || ""),
      size: Number((f && f.size) || 0),
      mtime: String(
        (f && (f.modified || f.mtime || f.updated_at || f.created)) || "",
      ),
    });
  function manifestEntry(row) {
    return {
      relativePath: manifestRelPath(
        row.relativePath || row.relPath || row.name,
      ),
      source: manifestSource(row.source || row.file || row.f),
      title: String(row.title || ""),
      year: String(row.year || ""),
      season: String(row.season || ""),
      episode: Number(row.episode || row.ep || 0),
      tmdbid: String(row.tmdbid || row.tmdbId || ""),
      urlTemplate: String(row.urlTemplate || row.content || ""),
      cover: String(row.cover || ""),
    };
  }
  function makeManifest(entries, opts) {
    opts = opts || {};
    const unique = new Map();
    (entries || []).forEach((row) => {
      const e = manifestEntry(row);
      e.relativePath && unique.set(e.relativePath, e);
    });
    const manifest = {
      schema: e.MANIFEST_SCHEMA,
      version: e.VERSION,
      commit: e.BUILD_COMMIT,
      buildDate: e.BUILD_DATE,
      generatedAt: new Date().toISOString(),
      openlistBase: String(opts.openlistBase || ""),
      outputRoot: String(opts.outputRoot || ""),
      tmdb: {
        used: !!opts.tmdbUsed,
        language: (t("tmdbLang") && t("tmdbLang").value) || "zh-CN",
      },
      stats: {
        generated: Number(opts.generated || 0),
        skipped: Number(opts.skipped || 0),
        changed: Number(opts.changed || 0),
        deleted: Number(opts.deleted || 0),
      },
      entries: [...unique.values()],
    };
    activeManifest = manifest;
    return manifest;
  }
  function manifestFileOf(manifest) {
    return {
      name: e.MANIFEST_FILE,
      content: JSON.stringify(manifest, null, 2) + "\n",
    };
  }
  function packReadmeFile() {
    return {
      name: "放这儿看我.txt",
      content:
        "影音入库箱 " + e.VERSION + " 生成的媒体库索引包\n" +
        "====================================\n\n" +
        "1. 解压到哪一层\n" +
        "   把压缩包里的「剧名」或「电影名」文件夹直接放进 Jellyfin / Emby 的媒体库根目录。\n" +
        "   例：媒体库 /media/tv  →  /media/tv/剧名/Season 01/剧名 S01E01.strm\n\n" +
        "2. 里面有什么\n" +
        "   .strm        播放索引，本身不含视频；播放器会去 OpenList 取流。\n" +
        "   .nfo         Jellyfin / Emby 能识别的元数据，尽量带 <tmdbid>，重扫不靠猜文件名。\n" +
        "   poster.jpg   封面。你本地已有的同名封面优先，本工具默认不覆盖。\n" +
        "   manifest.json 上次生成记录。下次导入它，或从媒体库根目录直读；自动上传会把最新版写回根目录。\n\n" +
        "3. 进媒体库后\n" +
        "   在 Jellyfin / Emby 里对目标库点一次「扫描媒体库」或「刷新元数据」。\n" +
        "   工具不持有媒体服务器账号，也不会替你调用刷新 API。\n\n" +
        "4. 第二周加集\n" +
        "   导入上次的 manifest.json，或点「从媒体库读取 manifest」，再点「预检差异」。\n" +
        "   预检表可改片名 / 年份 / 季 / 集，也可逐条勾选跳过；确认后才生成。\n" +
        "   默认只新增、不覆盖；要整部重做才打开「覆盖模式」，它会二次确认。\n\n" +
        "5. 换 OpenList 域名\n" +
        "   只改 openlistBase，重跑一次，旧 strm 里的路径会跟着换，不必全库重刮。\n\n" +
        "6. 安全\n" +
        "   zip 与 manifest 不含 TMDB Key、OpenList 密码。\n" +
        "   若 strm 含 sign= / token= / pwd=，这个 zip 请不要外传。\n\n" +
        "构建：" + e.BUILD_COMMIT + " · " + e.BUILD_DATE + "\n" +
        "规范：https://gitee.com/a-splash-of-water/yingyin-box/blob/master/docs/MANIFEST.md\n",
    };
  }
  function mergeManifestEntries(oldEntries, newEntries) {
    const map = new Map();
    (oldEntries || []).forEach((row) => {
      const e = manifestEntry(row);
      e.relativePath && map.set(e.relativePath, e);
    });
    (newEntries || []).forEach((row) => {
      const e = manifestEntry(row);
      e.relativePath && map.set(e.relativePath, e);
    });
    return [...map.values()];
  }
  function manifestIndex(manifest) {
    const map = new Map();
    (manifest && manifest.entries ? manifest.entries : []).forEach((row) => {
      const e = manifestEntry(row);
      e.relativePath && map.set(e.relativePath, e);
    });
    return map;
  }
  function manifestEntryChanged(oldEntry, nowRow) {
    if (!oldEntry) return true;
    const a = oldEntry.source || {},
      b = manifestSource((nowRow && nowRow.source) || {});
    if (a.size && b.size && Number(a.size) !== Number(b.size)) return true;
    if (a.mtime && b.mtime && String(a.mtime) !== String(b.mtime)) return true;
    if (a.name && b.name && String(a.name) !== String(b.name)) return true;
    return false;
  }
  function updateManifestMeta(manifest, shows, outputRoot) {
    if (!manifest || !Array.isArray(manifest.entries)) return manifest;
    const list = shows || [];
    manifest.entries.forEach((entry) => {
      const rel = manifestRelPath(entry.relativePath),
        show = list.find((x) => {
          const folder = manifestRelPath(x.folder || x.name || "");
          return folder && (rel === folder || rel.startsWith(folder + "/"));
        });
      if (!show) return;
      entry.title = show.display || show.name || entry.title;
      entry.year = String(show.year || entry.year || "");
      if (show.tmdbId) entry.tmdbid = String(show.tmdbId);
      if ("movie" === show.kind) entry.episode = 0;
      const poster =
        show.exists && show.exists.poster
          ? "local"
          : show.tmdbId
            ? "tmdb"
            : "title";
      entry.cover = poster;
    });
    manifest.generatedAt = new Date().toISOString();
    if (outputRoot) manifest.outputRoot = outputRoot;
    return manifest;
  }
  function setManifestStatus(text, bad) {
    const el = t("manifestStatus");
    if (!el) return;
    el.innerHTML = text;
    el.style.color = bad ? "var(--danger)" : "";
  }
  async function readTextFile(file) {
    if (file && "function" == typeof file.text) return file.text();
    return await new Promise((resolve, reject) => {
      const r = new FileReader();
      ((r.onload = () => resolve(String(r.result || ""))),
        (r.onerror = () => reject(r.error || new Error("读取失败")),
        r.readAsText(file)));
    });
  }
  function applyImportedManifest(data, name) {
    if (!data || !Array.isArray(data.entries))
      throw new Error("不是影音入库箱 manifest：缺少 entries 数组");
    importedManifest = data;
    importedManifestName = name || "manifest.json";
    activeManifest = null;
    setManifestStatus(
      "已导入 <b>" +
        N(importedManifestName) +
        "</b> · " +
        data.entries.length +
        " 条 · " +
        N(data.version || "未知版本") +
        " · " +
        N(data.commit || "无 commit") +
        '<br><span class="hint">重跑时只生成新增和源文件已变化的条目；已存在且未变化的跳过；manifest 里列出但本次没找到的只提示，不删除。自动上传开启时，最新 manifest 会写回媒体库根目录。</span>',
    );
    const clr = t("clearManifestBtn");
    clr && (clr.style.display = "");
  }
  async function autoPreviewAfterManifest(label) {
    label = label || "manifest 已导入";
    if (D) {
      setManifestStatus(
        label + "。当前有任务在运行，完成后再点「预检差异（不生成）」查看变化。",
      );
      return;
    }
    if (!O(t("cloudDir").value)) {
      setManifestStatus(
        label +
          "。已导入；选好视频目录后点「预检差异（不生成）」查看本次变化。",
      );
      return;
    }
    setManifestStatus(
      label + "。正在按当前目录预检差异…（不会生成文件）",
    );
    try {
      const r = await lt({ dryRun: true });
      if (r && r.code === "DRY_RUN")
        setManifestStatus(
          label +
            "。预检完成：" +
            (r.count ? "将生成 " + r.count + " 条" : "没有需要生成的新集") +
            "；未生成任何文件。",
        );
      else
        setManifestStatus(
          label + "。预检未完成，可点「预检差异（不生成）」重试。",
        );
    } catch (e) {
      setManifestStatus(
        label + "。预检失败：" + N(e.message || "未知错误"),
        true,
      );
    }
  }
  async function loadManifestFile(file) {
    try {
      const raw = await readTextFile(file),
        data = JSON.parse(String(raw).replace(/^\uFEFF/, ""));
      applyImportedManifest(data, (file && file.name) || "manifest.json");
      await autoPreviewAfterManifest("本地 manifest 已导入");
    } catch (err) {
      importedManifest = null;
      importedManifestName = "";
      setManifestStatus("导入失败：" + N(err.message), true);
    }
  }
  async function readLibraryManifest(lib) {
    const dir = O(lib);
    if (!dir || "/" === dir) return { ok: false, missing: true, error: "未填媒体库目录" };
    const res = await _e(dir, false);
    if (!res.ok) return { ok: false, error: "读取目录失败：" + Ce(res) };
    const file = (res.items || []).find(
      (x) =>
        !x.is_dir &&
        String(x.name || "").toLowerCase() === e.MANIFEST_FILE.toLowerCase(),
    );
    if (!file)
      return {
        ok: false,
        missing: true,
        error: "媒体库根目录没有 " + e.MANIFEST_FILE,
      };
    const read = await vt(file, P(dir, file.name));
    if (!read.ok) return { ok: false, error: "读取 manifest 失败：" + read.error };
    try {
      const text = new TextDecoder("utf-8").decode(read.buf),
        data = JSON.parse(String(text).replace(/^\uFEFF/, ""));
      if (!data || !Array.isArray(data.entries))
        throw new Error("缺少 entries 数组");
      return { ok: true, data, path: P(dir, file.name) };
    } catch (err) {
      return { ok: false, error: "解析 manifest 失败：" + err.message };
    }
  }
  async function manifestForLibraryRoot(lib, manifest) {
    const read = await readLibraryManifest(lib);
    if (!read.ok) return read.missing ? manifest : null;
    return {
      ...manifest,
      entries: mergeManifestEntries(read.data.entries, manifest.entries),
    };
  }
  async function loadManifestFromLibrary() {
    const lib = O(t("libDir").value);
    if (!lib || "/" === lib)
      return void setManifestStatus(
        "先填写「② 保存到媒体库」的目录，才能从媒体库里读 manifest.json。",
        true,
      );
    if (!(await ye()).ok)
      return void setManifestStatus("OpenList 未连接：" + N(h), true);
    setManifestStatus("正在读取 " + N(P(lib, e.MANIFEST_FILE)) + " …");
    const res = await readLibraryManifest(lib);
    if (!res.ok)
      return void setManifestStatus(
        res.error +
          (res.missing
            ? "。如果上次是手动解压 zip，manifest 在剧名文件夹里，请用「导入上次 manifest」选择它；本次开启自动上传后会写回媒体库根目录。"
            : ""),
        true,
      );
    try {
      applyImportedManifest(res.data, res.path);
      await autoPreviewAfterManifest("媒体库 manifest 已读取");
    } catch (err) {
      setManifestStatus("解析 manifest 失败：" + N(err.message), true);
    }
  }
  function clearImportedManifest() {
    importedManifest = null;
    importedManifestName = "";
    activeManifest = null;
    setManifestStatus(
      "未导入：将按媒体库已有 strm 做增量对比。可导入上次 zip 里的 manifest.json，或从媒体库根目录直读；自动上传开启时最新 manifest 会写回根目录。",
    );
    const clr = t("clearManifestBtn");
    clr && (clr.style.display = "none");
    const inp = t("manifestFile");
    inp && (inp.value = "");
  }
  const PF_STATUS = {
    added: "新增",
    changed: "变化重写",
    new: "待生成",
    skipped: "已跳过",
  };
  function preflightCsv(info) {
    const rows = [["状态", "目标路径", "片名", "年份", "季", "集", "源文件"]];
    (info.rows || []).forEach((r) =>
      rows.push([
        PF_STATUS[r.status] || r.status || "",
        r.relativePath || r.name || "",
        info.title || "",
        info.year || "",
        r.movie ? "" : r.season || "",
        r.movie ? "" : r.episode || "",
        r.source || "",
      ]),
    );
    (info.deletedPaths || []).forEach((p) =>
      rows.push(["manifest 有、本次没找到", p, info.title || "", "", "", "", ""]),
    );
    const csv = rows
      .map((row) =>
        row
          .map((cell) => '"' + String(null == cell ? "" : cell).replace(/"/g, '""') + '"')
          .join(","),
      )
      .join("\r\n");
    return "\uFEFF" + csv;
  }
  function exportPreflightCsv(info) {
    try {
      const blob = new Blob([preflightCsv(info)], {
          type: "text/csv;charset=utf-8",
        }),
        url = URL.createObjectURL(blob),
        a = document.createElement("a");
      ((a.href = url),
        (a.download =
          "preflight-" +
          String(info.title || "library").replace(/[\\/:*?"<>|]/g, "_") +
          ".csv"),
        document.body.appendChild(a),
        a.click(),
        a.remove(),
        setTimeout(() => URL.revokeObjectURL(url), 1200));
    } catch (e) {
      K(i, "导出 CSV 失败：" + (e.message || "未知错误"), "err-t");
    }
  }
  function readPreflightEdits(info) {
    const box = t("preflightBox");
    if (!box) return null;
    const val = (id) => {
        const el = box.querySelector(id);
        return el ? String(el.value || "").trim() : "";
      },
      rows = new Map();
    box.querySelectorAll("tr[data-key]").forEach((tr) => {
      const key = tr.getAttribute("data-key") || "",
        epEl = tr.querySelector('[data-pf="ep"]'),
        skipEl = tr.querySelector('[data-pf="skip"]');
      rows.set(key, {
        ep: epEl ? parseInt(epEl.value, 10) || 0 : 0,
        skip: !!(skipEl && skipEl.checked),
      });
    });
    return {
      title: val("#pfTitle") || info.title || "",
      year: val("#pfYear") || info.year || "",
      season: val("#pfSeason") || info.season || "01",
      rows,
    };
  }
  function applyPreflightEdits(y, info, edits) {
    if (!edits) return null;
    const title = A(edits.title || info.title) || info.title,
      year = String(edits.year || info.year || ""),
      season = M(edits.season || info.season || "01");
    let skipped = 0;
    for (const [key, g] of [...y]) {
      const row = (edits.rows && edits.rows.get(key)) || {};
      if (row.skip) {
        y.delete(key);
        skipped++;
        continue;
      }
      g.title = title;
      if (g.movie) {
        g.name = title + ".strm";
        g.season = season;
      } else {
        const ep = row.ep > 0 ? row.ep : g.ep || 1,
          suffix = (String(g.name).match(/(_\d+)?\.strm$/i) || [])[1] || "";
        ((g.ep = ep),
          (g.season = season),
          (g.name = title + " S" + M(season) + "E" + M(ep) + suffix + ".strm"));
      }
    }
    return { title, year, season, skipped };
  }
  function renderPreflight(info) {
    const box = t("preflightBox");
    if (!box) return;
    lastPreflight = info;
    const rows = info.rows || [],
      canEdit = !!info.editable,
      canExport = canEdit || !!info.dryRun,
      statusLabel = (s) => PF_STATUS[s] || s || "",
      warns = [];
    info.noYear &&
      warns.push(info.noYear + " 个文件名没解析出年份，将走标题兜底");
    info.autoN && warns.push(info.autoN + " 个没集号，已自动续号");
    info.dups && warns.push(info.dups + " 处重复集，已加 _2/_3 后缀");
    info.badNames &&
      warns.push(info.badNames + " 个文件名含可疑字符或过长，已清洗");
    const summary =
      '<div class="pf-grid">' +
      '<div class="pf-row"><b>' +
      info.toGenerate +
      "</b><span>本次将生成</span></div>" +
      '<div class="pf-row"><b>' +
      info.skipped +
      "</b><span>已存在且未变化，跳过</span></div>" +
      '<div class="pf-row"><b>' +
      info.changed +
      "</b><span>源文件已变化，重写</span></div>" +
      '<div class="pf-row"><b>' +
      info.deleted +
      "</b><span>manifest 里有、本次没找到（默认不动）</span></div>" +
      "</div>";
    let html =
      '<div class="pf-head">生成前预检 ' +
      (info.dryRun
        ? '<span class="hint">（仅预检，未生成任何文件）</span>'
        : canEdit
          ? '<span class="hint">（可改片名 / 年份 / 季 / 集；确认后才生成）</span>'
          : '<span class="hint">（只提示）</span>') +
      "</div>" +
      summary +
      (canEdit
        ? '<div class="pf-global">' +
          '<label>片名<input id="pfTitle" type="text" value="' +
          N(info.title || "") +
          '"></label>' +
          '<label>年份<input id="pfYear" type="text" inputmode="numeric" value="' +
          N(info.year || "") +
          '"></label>' +
          '<label>季号<input id="pfSeason" type="text" inputmode="numeric" value="' +
          N(info.season || "") +
          '"></label>' +
          "</div>" +
          '<div class="hint">片名 / 年份 / 季号适用于本目录整部剧；集号可逐条改；取消勾选可跳过该条。改完点「确认生成」才会真正打包。</div>'
        : "");
    if (rows.length) {
      html +=
        '<div class="pf-scroll"><table class="pf-table"><thead><tr><th>状态</th><th>目标路径</th><th>集</th>' +
        (canEdit ? "<th>跳过</th>" : "") +
        "</tr></thead><tbody>";
      rows.slice(0, 200).forEach((r) => {
        html +=
          '<tr data-key="' +
          N(r.key) +
          '"><td class="pf-st">' +
          N(statusLabel(r.status)) +
          '</td><td class="pf-path">' +
          N(r.relativePath || r.name) +
          "</td><td>" +
          (r.movie
            ? "电影"
            : canEdit
              ? '<input class="pf-num" data-pf="ep" type="text" inputmode="numeric" value="' +
                N(r.episode || "") +
                '">'
              : N(r.episode || "")) +
          "</td>" +
          (canEdit
            ? '<td><label class="pf-skip"><input type="checkbox" data-pf="skip">跳过</label></td>'
            : "") +
          "</tr>";
      });
      html += "</tbody></table></div>";
      if (rows.length > 200)
        html +=
          '<div class="hint">仅列出前 200 条；其余 ' +
          (rows.length - 200) +
          " 条按默认规则生成，可导出 CSV 查看全量。</div>";
    }
    if (warns.length)
      html +=
        '<ul class="pf-warn">' +
        warns.map((x) => "<li>" + N(x) + "</li>").join("") +
        "</ul>";
    else if (!rows.length)
      html += '<div class="pf-ok">没有发现需要人工确认的异常。</div>';
    if (info.deletedPaths && info.deletedPaths.length)
      html +=
        '<div class="pf-deleted"><b>manifest 里有、本次没找到（默认保留不动）：</b><ul>' +
        info.deletedPaths
          .slice(0, 8)
          .map((p) => "<li>" + N(p) + "</li>")
          .join("") +
        "</ul></div>";
    if (canEdit)
      html +=
        '<div class="pf-actions"><button type="button" class="btn-primary green" id="pfConfirm">确认生成</button>' +
        '<button type="button" class="mbtn" id="pfCancel">取消</button>' +
        '<button type="button" class="btn-text" id="pfCsv" style="margin:0">导出 CSV</button></div>';
    else if (info.dryRun)
      html +=
        '<div class="pf-actions"><button type="button" class="btn-text" id="pfCsv" style="margin:0">导出 CSV</button></div>' +
        '<div class="hint">这是预检结果，未写入任何文件。点「③ 开始生成」时会再让你确认一次。</div>';
    box.innerHTML = html;
    box.style.display = "";
    if (canExport) {
      const csv = t("pfCsv");
      csv && (csv.onclick = () => exportPreflightCsv(info));
    }
    if (canEdit) {
      const confirm = t("pfConfirm"),
        cancel = t("pfCancel");
      confirm &&
        (confirm.onclick = () => {
          if (!preflightResolver) return;
          const payload = readPreflightEdits(info),
            resolve = preflightResolver;
          preflightResolver = null;
          box.querySelector(".pf-head").innerHTML =
            '生成前预检 <span class="hint">（已确认，正在生成…）</span>';
          const run = t("runStrmBtn");
          run && (run.textContent = "正在生成…");
          resolve(payload);
        });
      cancel &&
        (cancel.onclick = () => {
          const resolve = preflightResolver;
          preflightResolver = null;
          box.style.display = "none";
          const run = t("runStrmBtn");
          run && ((run.disabled = !1), (run.textContent = ut()));
          resolve && resolve(null);
        });
    }
  }

  const Ye = { strmDl: [], subDl: [] };
  function Xe(e) {
    ((Ye[e] || []).forEach((e) => {
      try {
        URL.revokeObjectURL(e);
      } catch (e) {}
    }),
      (Ye[e] = []));
    const n = t(e);
    n && (n.innerHTML = "");
  }
  function Ze(e, n, r, o) {
    const a = URL.createObjectURL(e);
    (Ye[r] || (Ye[r] = []), Ye[r].push(a));
    const s = document.createElement("a");
    ((s.className = "done-link"), (s.href = a));
    const i = n.lastIndexOf("."),
      l = i > 0 ? n.slice(0, i) : n,
      c = i > 0 ? n.slice(i) : "";
    ((s.download = A(l).slice(0, 110) + c),
      (s.textContent = o),
      t(r).appendChild(s));
  }
  function Qe(e, t, n, r, o) {
    const a = new Array(e.length);
    let s = 0,
      i = 0;
    return Promise.all(
      Array.from({ length: Math.min(t, e.length) }, async function () {
        for (; s < e.length && (!o || !o()); ) {
          const t = s++;
          try {
            a[t] = await n(e[t], t);
          } catch (e) {
            a[t] = { error: e.message || "未知错误" };
          }
          (i++, r && r(i, e.length));
        }
      }),
    ).then(() => a);
  }
  function et(e) {
    let t = String(null == e ? "" : e);
    if (!t) return "";
    if (/%[0-9A-Fa-f]{2}/.test(t))
      try {
        if (
          encodeURIComponent(decodeURIComponent(t)).toLowerCase() ===
          t.toLowerCase()
        )
          return t;
      } catch (e) {}
    return encodeURIComponent(t);
  }
  function tt(e, t, n) {
    const r = O(e).split("/").map(encodeURIComponent).join("/"),
      strip = document.getElementById("stripSign"),
      o = strip && strip.checked ? "" : et(t);
    return n.replace(/\/+$/, "") + "/d" + r + (o ? "?sign=" + o : "");
  }
  function nt(e) {
    const n = { strm: [a, "panelStrm"], sub: [s, "panelSub"] };
    ["strm", "sub"].forEach((r) => {
      const o = r === e,
        a = t(n[r][0]),
        s = t(n[r][1]);
      (a &&
        (a.classList.toggle("on", o),
        a.setAttribute("aria-selected", o ? "true" : "false"),
        (a.tabIndex = o ? 0 : -1)),
        s && (s.style.display = o ? "" : "none"));
    });
  }
  ((t(a).onclick = () => nt("strm")),
    (t(s).onclick = () => nt("sub")),
    document.querySelectorAll('[role="tab"]').forEach((e) => {
      e.addEventListener("keydown", (n) => {
        if ("ArrowLeft" === n.key || "ArrowRight" === n.key) {
          n.preventDefault();
          const r = [t(a), t(s)],
            o = r.indexOf(e),
            i = r[(o + ("ArrowRight" === n.key ? 1 : r.length - 1)) % r.length];
          i && (i.focus(), nt("tabStrm" === i.id ? "strm" : "sub"));
        }
      });
    }));
  let rt = !1;
  function ot() {
    try {
      const n = {},
        sessionOnly = !!(t("tmdbSession") && t("tmdbSession").checked);
      (e.IDS.forEach((e) => {
        const o = t(e);
        o &&
          (r.indexOf(e) >= 0 ||
            (sessionOnly &&
              ("tmdbKey" === e || "tmdbToken" === e) &&
              !n[e]) ||
            ("checkbox" === o.type ? (n[e] = o.checked) : (n[e] = o.value)));
      }),
        localStorage.setItem(e.CFG_KEY, JSON.stringify(n)));
    } catch (e) {
      rt || ((rt = !0), Y("本机存储不可用，配置仅本次有效"));
    }
  }
  function at() {
    const e = t("season").value.trim();
    if (!e)
      return (
        (t("seasonHint").textContent =
          "留空即可：生成时自动从目录名/文件名推断季号。"),
        (t("seasonHint").style.color = ""),
        null
      );
    const n = /^\d{1,2}$/.test(e) && +e >= 1 && +e <= 99;
    return (
      (t("seasonHint").textContent = n
        ? "仅接受 1–2 位数字；若目录名为 Season 2 / 第2季，会自动带入。"
        : "季号无效：请输入 1–99 的数字，否则生成的文件名会异常。"),
      (t("seasonHint").style.color = n ? "" : "var(--danger)"),
      n ? M(+e) : null
    );
  }
  function st() {
    const e = O(t("cloudDir").value),
      n = !(!e || "/" === e),
      r = t("runStrmBtn");
    if ((r && (r.style.display = n ? "" : "none"), !n))
      return void (t("strmSummary").innerHTML =
        '<div class="hint" style="margin:0">还没选择视频目录——点上方「① 选择云盘视频目录」即可。</div>');
    const o = N(t("namePrefix").value.trim() || "（未填剧名）"),
      a = t("season").value.trim(),
      s = ue(e),
      i = a ? M(a) : s || "—",
      l = k.length;
    t("strmSummary").innerHTML =
      '<div class="row"><span>剧集</span><b>' +
      o +
      '</b></div><div class="row"><span>季 / 集数</span><b>' +
      ("—" === i ? "—" : "S" + i) +
      (a && s && s !== i ? "（目录推断 " + s + "）" : "") +
      (l ? " · " + l + " 集" : "") +
      '</b></div><div class="row path clickable" id="dirRow" title="点击浏览云盘目录并自动带入"><span>目录</span><b>' +
      N(e) +
      "</b></div>";
  }
  (e.IDS.forEach((e) => {
    const n = t(e);
    n &&
      n.addEventListener("input", () => {
        if (
          ("cloudDir" === e && (k = []),
          ("cloudDir" !== e && "namePrefix" !== e && "season" !== e) || st(),
          "libDir" === e)
        ) {
          const e = t("libDir2");
          (e && (e.value = n.value), nn());
        }
        ("libDir2" === e && ((t("libDir").value = n.value), nn()),
          "apiBase" === e &&
            ((p = null),
            (t("baseUrl2").value = n.value),
            Y("地址已修改，需重新连接。")),
          "baseUrl2" === e &&
            ((p = null),
            (t("apiBase").value = n.value),
            Y("地址已修改，需重新连接。")),
          "season" === e && at(),
          "incremental" === e && st(),
          ot());
      });
  }),
    (t("exportCfgBtn").onclick = function () {
      const n = {};
      (e.IDS.forEach((e) => {
        const a = t(e);
        !a ||
          r.indexOf(e) >= 0 ||
          o.indexOf(e) >= 0 ||
          (n[e] = "checkbox" === a.type ? a.checked : a.value);
      }),
        (n.__version = e.VERSION),
        (n.__commit = e.BUILD_COMMIT));
      const a = new Blob(
          [
            "# 本文件不含凭据 · " +
              e.VERSION +
              " · commit " +
              e.BUILD_COMMIT +
              "\n# 导出于 " +
              new Date().toISOString() +
              "\n" +
              JSON.stringify(n, null, 2),
          ],
          { type: "application/json" },
        ),
        s = URL.createObjectURL(a),
        i = document.createElement("a");
      ((i.href = s),
        (i.download = "影音入库箱_配置.json"),
        i.click(),
        setTimeout(() => URL.revokeObjectURL(s), 3e4));
    }),
    (t("importCfgBtn").onclick = () => t("importCfgFile").click()),
    t("importCfgFile").addEventListener("change", (n) => {
      const a = n.target.files && n.target.files[0];
      (a &&
        (function (n) {
          const a = new FileReader();
          ((a.onload = () => {
            try {
              const n = JSON.parse(
                String(a.result)
                  .replace(/^\uFEFF/, "")
                  .replace(/^\s*#.*$/gm, ""),
              );
              let s = 0;
              (e.IDS.forEach((e) => {
                const a = t(e);
                !a ||
                  r.indexOf(e) >= 0 ||
                  o.indexOf(e) >= 0 ||
                  !(e in n) ||
                  ("checkbox" === a.type && "boolean" == typeof n[e]
                    ? ((a.checked = n[e]), s++)
                    : "string" == typeof n[e] && ((a.value = n[e]), s++));
              }),
                (t("libDir2").value = t("libDir").value),
                (t("baseUrl2").value = t("apiBase").value),
                (p = null),
                (k = []),
                ie.clear(),
                ot(),
                st(),
                at());
              const i = !U(t("apiBase").value);
              re(
                i ? "warn" : "ok",
                i ? "配置已导入（请核对地址）" : "配置已导入",
                "已恢复 " +
                  s +
                  " 项配置。" +
                  (i
                    ? "<b>注意：配置里的 OpenList 地址是公网/外部地址（" +
                      N(t("apiBase").value) +
                      "）</b>，点连接后账号密码会发送给它。若这不是你自己的服务，请勿连接。"
                    : "地址已变更，请重新点「连接自检」。"),
              );
            } catch (e) {
              re("err", "导入失败", "配置文件格式不正确：" + N(e.message));
            }
          }),
            a.readAsText(n));
        })(a),
        (n.target.value = ""));
    }),
    (t("copyDiagBtn").onclick = async function () {
      (await G(
        (function () {
          const n = {};
          e.IDS.forEach((e) => {
            const r = t(e);
            r && (n[e] = "checkbox" === r.type ? r.checked : r.value);
          });
          const r = (e) => {
            const n = t(e);
            return n
              ? n.textContent.trim().split("\n").slice(-12).join("\n")
              : "";
          };
          return [
            "影音入库箱 " + e.VERSION + " · 诊断信息",
            "时间：" + new Date().toLocaleString(),
            "连接地址：" + f + "（输入框：" + n.apiBase + "）",
            "播放地址：" + n.playHost,
            "云盘目录：" +
              n.cloudDir +
              " | 剧名：" +
              n.namePrefix +
              " | 季号：" +
              n.season,
            "媒体库目录：" +
              n.libDir +
              " | 增量生成：" +
              n.incremental +
              " | 自动上传：" +
              n.autoUpload,
            "字幕目录：" +
              n.libDir2 +
              " | 递归：" +
              n.subRecursive +
              " | 并发：" +
              n.concurrency,
            "最近连接错误：" + (h || "无"),
            "",
            "--- strm 日志末尾 ---",
            r(i),
            "",
            "--- 字幕日志末尾 ---",
            r(l),
          ]
            .join("\n")
            .replace(/密码[：:][^\n]*/g, "密码：******");
        })(),
      ))
        ? re(
            "ok",
            "已复制",
            "诊断信息已复制，可直接粘贴给我排查。密码字段已脱敏。",
          )
        : re(
            "info",
            "请手动复制",
            '浏览器未允许自动复制。请展开"运行日志"手动选取内容。',
          );
    }),
    (t("cancelSubBtn").onclick = () => {
      ((L = !0),
        I && I.abort(),
        (t("cancelSubBtn").disabled = !0),
        (t("cancelSubBtn").textContent = "正在停止…"),
        K(l, "收到取消请求，正在停止…", "warn-t"));
    }),
    (t("checkBtn").onclick = async () => {
      if (D) return;
      D = !0;
      const e = t("checkBtn");
      ((e.disabled = !0), K(i, "连接自检开始 …"));
      try {
        if (!(await ye({ force: !0 })).ok)
          return (ke(), void K(i, "自检失败：" + h, "err-t"));
        const e = await we("/api/fs/list", {
          path: "/",
          page: 1,
          per_page: 10,
          refresh: !1,
        });
        if (!e.ok)
          return (
            re(
              "err",
              "接口调用失败",
              "登录成功，但列目录失败：" +
                N(Ce(e)) +
                "<ul><li>可能是该账号无根目录权限，或接口地址被反代拦截</li></ul>",
            ),
            void K(i, "列目录失败：" + Ce(e), "err-t")
          );
        const list = (e.data && e.data.content) || [];
        const count = Array.isArray(list) ? list.length : (e.data && e.data.total) || 0;
        (re(
          "ok",
          "连接正常",
          "已登录 " +
            N(f) +
            "，读到 " +
            count +
            " 个根目录条目。可以开始生成 strm 或扫描字幕了。",
          [{ label: "开始使用", style: "green" }],
        ),
          K(i, "自检通过：" + f + "，读到 " + count + " 个条目", "ok-t"));
      } catch (e) {
        (re("err", "自检失败", N(e.message || "未知错误")),
          K(i, "自检异常：" + e.message, "err-t"));
      } finally {
        ((D = !1), (e.disabled = !1));
      }
    }));
  let it = null;
  async function lt(n) {
    const r = !!(n = n || {}).fromFix,
      o = !!n.internal;
    if (((it = null), D && !o)) return { ok: !1, code: "BUSY" };
    o || (D = !0);
    const runBtn = t("runStrmBtn");
    ((runBtn.disabled = !0),
      (runBtn.textContent = n.dryRun ? "正在预检…" : "正在生成…"),
      Xe("strmDl"),
      (t("strmLog").innerHTML = ""));
    const s = t("uploadWarn");
    (s && s.parentNode && s.parentNode.removeChild(s),
      (t("strmDl").style.display = ""));
    try {
      const o = R(t("playHost").value) || e.PLAY_BASE;
      if (
        ((t("playHost").value = o), K(i, "① 连接 OpenList …"), !(await ye()).ok)
      )
        return (r || ke(), { ok: !1, code: "CONN_FAIL", reason: h });
      const libRoot = O(t("libDir").value);
      if (
        !importedManifest &&
        libRoot &&
        t("incremental") &&
        t("incremental").checked
      ) {
        const rootManifest = await readLibraryManifest(libRoot);
        if (rootManifest.ok) {
          importedManifest = rootManifest.data;
          importedManifestName = rootManifest.path;
          activeManifest = null;
          setManifestStatus(
            "已自动读取媒体库 manifest <b>" +
              N(rootManifest.path) +
              "</b> · " +
              rootManifest.data.entries.length +
              " 条。本次只生成新增和源文件已变化的条目。",
          );
          K(
            i,
            "④ 自动读取媒体库 manifest：" + rootManifest.path,
            "ok-t",
          );
        } else if (!rootManifest.missing)
          K(
            i,
            "自动读取媒体库 manifest 失败：" +
              rootManifest.error +
              "；本次按已有 strm 对比",
            "warn-t",
          );
      }
      const a = O(t("cloudDir").value);
      let s = t("namePrefix").value.trim(),
        l = s ? A(s) : "",
        c = at();
      let d = (k && k[0] && k[0].name) || "";
      if (
        (c ||
          ((c = (a && ue(a)) || (d && me(d, a).season) || "01"),
          (t("season").value = c),
          at(),
          K(i, "⚙ 季号未填/无效，已自动推断为 S" + c, "warn-t")),
        !l)
      ) {
        let e = d ? me(d, a).title : "";
        (e ||
          (e = me((a || "").split("/").filter(Boolean).pop() || "", "").title),
          (l = A(e) || A((a || "").split("/").filter(Boolean).pop() || "剧集")),
          (t("namePrefix").value = l),
          st(),
          K(i, "⚙ 剧名未填，已自动推断为「" + l + "」", "warn-t"));
      }
      if (!a || "/" === a) {
        const e = { dir: a, sampleName: d };
        return (
          re(
            "warn",
            "还没选择视频目录",
            "需要先进入一个装视频的文件夹。点「① 选择云盘视频目录」即可，剧名和季号会自动推断。",
            [
              { label: "去选择目录", style: "primary", fn: () => Fe() },
              { label: "知道了" },
            ],
          ),
          { ok: !1, code: "MISSING_INPUT", ctx: e }
        );
      }
      K(i, "② 读取目录：" + a);
      const u = await _e(a);
      if (!u.ok)
        return (
          re(
            "err",
            "读取目录失败",
            "接口错误：" +
              N(Ce(u)) +
              '<ul><li>检查目录路径是否正确</li><li>勾选"强制刷新目录列表"后重试</li></ul>',
            [
              ce("READ_FAIL", { rerun: "strm" }),
              { label: "去改目录", step: "advParams" },
              { label: "知道了" },
            ],
          ),
          K(i, "读取失败：" + Ce(u), "err-t"),
          { ok: !1, code: "READ_FAIL", reason: Ce(u), ctx: { rerun: "strm" } }
        );
      const m = await bt([a], new Map(), { rootItems: { [a]: u } }),
        p = m.shows,
        g = Ie(u.items, a).media.length;
      if (
        (K(
          i,
          "✓ 本层 " + g + " 个影视资源，递归展开出 " + p.length + " 部",
          "ok-t",
        ),
        !p.length)
      )
        return (
          re(
            "err",
            "目录及其子目录里都没有视频",
            "这个目录和它的子文件夹都没读到视频文件。常见原因是路径填错了层级，或 OpenList 缓存，勾选强制刷新后重试。",
            [
              ce("NO_VIDEO", { dir: a }),
              { label: "去改目录", step: "advParams" },
              { label: "知道了" },
            ],
          ),
          { ok: !1, code: "NO_VIDEO", ctx: { dir: a } }
        );
      if (p.length > 1 || (1 === p.length && p[0].dir !== a)) {
        const e = await yt([a], {
          shows: p,
          names: new Map(),
          allInOne: !0,
          unified: !!n.unified,
          failDirs: m.failDirs,
          skippedDirs: m.skippedDirs,
          zipName: "strm_" + A(a.split("/").filter(Boolean).pop() || "批量"),
        });
        return { ok: e.ok, code: e.ok ? "OK" : "EMPTY", groups: e.count };
      }
      const b = p[0].vids;
      K(i, "③ 解析集号并生成（无集号自动编号）…");
      const { groups: y, dups: v, autoN: w, isMovie: S } = gt(b, a, l, c);
      let E = ht(t("libDir").value, l, S ? "" : c);
      const x = b.filter((e) => !e.sign).length;
      if (
        (w &&
          K(
            i,
            "⚙ " +
              w +
              " 个视频没有集号，已自动续号编号（从已有最大集号之后开始）",
            "warn-t",
          ),
        v.length &&
          K(
            i,
            "⚙ " +
              v.length +
              " 处重复集已自动加 _2/_3 后缀避免覆盖：" +
              v.slice(0, 5).join("、"),
            "warn-t",
          ),
        K(
          i,
          "✓ 唯一集数 " + y.size + "，自动编号 " + w + "，无签名 " + x,
          "ok-t",
        ),
        !y.size)
      )
        return (
          re(
            "err",
            "没有可生成的文件",
            "目录里有 " +
              b.length +
              ' 个视频，但没有一个能解析出集号，也没有可用的自动编号依据。<div class="hint">请展开运行日志看详情，或复制诊断信息反馈。</div>',
          ),
          {
            ok: !1,
            code: "NO_EPISODE",
            ctx: { vids: b, dir: a, prefix: l, season: c },
          }
        );
      x === b.length &&
        K(i, "提示：这些文件没有 sign 字段，将生成不带签名的直链", "warn-t");
      let _ = 0,
        D = "",
        manifestDiff = {
          added: 0,
          changed: 0,
          unchanged: 0,
          deleted: 0,
          deletedPaths: [],
          status: {},
        };
      const relForGroup = (g) =>
        manifestRelPath(
          (g.movie ? l : l + "/Season " + M(g.season || c)) + "/" + g.name,
        );
      if (importedManifest) {
        K(
          i,
          "④ 按 manifest 对比：" +
            importedManifestName +
            "（" +
            (importedManifest.entries || []).length +
            " 条）",
        );
        const idx = new Map(
            (importedManifest.entries || []).map((row) => [
              manifestRelPath(row.relativePath),
              row,
            ]),
          ),
          current = new Set();
        for (const [key, g] of [...y]) {
          const rel = relForGroup(g),
            old = idx.get(rel);
          current.add(rel);
          if (!old) {
            manifestDiff.added++;
            manifestDiff.status[key] = "added";
            continue;
          }
          const oldSrc = old.source || {},
            nowSrc = manifestSource(g.f),
            sameSize =
              String(oldSrc.size || "0") === String(nowSrc.size || "0"),
            sameTime =
              String(oldSrc.mtime || "") === String(nowSrc.mtime || "");
          if (sameSize && sameTime) {
            y.delete(key);
            _++;
            manifestDiff.unchanged++;
            manifestDiff.status[key] = "skipped";
          } else {
            manifestDiff.changed++;
            manifestDiff.status[key] = "changed";
          }
        }
        const prefix = manifestRelPath(l) + "/";
        manifestDiff.deletedPaths = (importedManifest.entries || [])
          .map((row) => manifestRelPath(row.relativePath))
          .filter((rel) => rel.startsWith(prefix) && !current.has(rel));
        manifestDiff.deleted = manifestDiff.deletedPaths.length;
        K(
          i,
          "✓ 新增 " +
            manifestDiff.added +
            " 集，变化重写 " +
            manifestDiff.changed +
            " 集，未变化跳过 " +
            manifestDiff.unchanged +
            " 集" +
            (manifestDiff.deleted
              ? "；manifest 里另有 " +
                manifestDiff.deleted +
                " 条本次没找到（默认不动）"
              : ""),
          "ok-t",
        );
        manifestDiff.deletedPaths.slice(0, 5).forEach((rel) =>
          K(i, "  · 已不存在的旧条目：" + rel, "warn-t"),
        );
        D = "manifest 对比完成";
      } else if (t("incremental").checked)
        if (E) {
          K(i, "④ 对比媒体库已有 strm：" + E);
          const e = await _e(E, !1);
          if (!e.ok || e.incomplete)
            ((D =
              (e.incomplete ? "目标目录列表不完整：" : "目标目录读取失败：") +
              Ce(e)),
              K(i, "增量跳过：" + D + "，本次按全量生成", "warn-t"));
          else {
            const t = new Set();
            e.items
              .filter((e) => !e.is_dir && /\.strm$/i.test(e.name))
              .forEach((e) => t.add(e.name.toLowerCase()));
            for (const [e, n] of y)
              t.has(n.name.toLowerCase()) && (y.delete(e), _++);
            K(
              i,
              "✓ 已有 " +
                t.size +
                " 个 strm，跳过 " +
                _ +
                " 集，剩余 " +
                y.size +
                " 集待生成",
              "ok-t",
            );
          }
        } else
          ((D = "未配置媒体库目录，无法定位已有 strm，本次按全量生成"),
            K(i, "增量跳过：" + D, "warn-t"));
      const pfRows = [...y.entries()].map(([key, g]) => ({
        key,
        name: g.name,
        episode: g.ep || 0,
        season: g.season || c,
        movie: !!g.movie,
        source: (g.f && g.f.name) || "",
        relativePath: relForGroup(g),
        status: manifestDiff.status[key] || (importedManifest ? "added" : "new"),
      }));
      const pfInfo = {
        toGenerate: y.size,
        skipped: _,
        changed: manifestDiff.changed,
        deleted: manifestDiff.deleted,
        noYear: b.filter((x) => !$t(x.name)).length,
        autoN: w,
        dups: v.length,
        badNames: b.filter((x) => /[\\/:*?"<>|\x00-\x1f]/.test(x.name)).length,
        rows: pfRows,
        deletedPaths: manifestDiff.deletedPaths,
        title: l,
        year: $t(d || l),
        season: c,
        dryRun: !!n.dryRun,
        editable: !n.dryRun,
      };
      renderPreflight(pfInfo);
      if (n.dryRun) {
        ((runBtn.disabled = !1), (runBtn.textContent = ut()));
        K(
          i,
          y.size
            ? "✓ 预检完成：本次将生成 " +
                y.size +
                " 条；未写入任何文件。点「③ 开始生成」再确认。"
            : "✓ 预检完成：按 manifest / 媒体库对比，没有需要生成的新集。",
          "ok-t",
        );
        return { ok: !0, code: "DRY_RUN", count: y.size, diff: manifestDiff };
      }
      if (!y.size)
        return (
          re(
            _ ? "ok" : "err",
            _ ? "没有新集" : "没有可生成的文件",
            _
              ? "所有 " + _ + " 集按 manifest / 媒体库对比都已存在且未变化，本次没有新集需要生成。" +
                (manifestDiff.deleted
                  ? " 另有 " +
                    manifestDiff.deleted +
                    " 条旧条目在 manifest 里但本次没找到，已保留不动。"
                  : "")
              : "视频文件名里没识别出集号。",
            [ce("NO_NEW", {}), { label: "知道了" }],
          ),
          { ok: !1, code: "NO_NEW", ctx: {} }
        );
      const edits = await new Promise((resolve) => {
        preflightResolver = resolve;
      });
      if (!edits)
        return (
          (runBtn.disabled = !1),
          (runBtn.textContent = ut()),
          { ok: !1, code: "CANCELLED" }
        );
      const applied = applyPreflightEdits(y, pfInfo, edits);
      if (!applied)
        return (
          (runBtn.disabled = !1),
          (runBtn.textContent = ut()),
          { ok: !1, code: "CANCELLED" }
        );
      ((l = applied.title || l),
        (d = applied.year || d),
        (c = applied.season || c),
        (E = ht(t("libDir").value, l, S ? "" : c)),
        (runBtn.textContent = "正在生成…"));
      if (applied.skipped)
        ((_ += applied.skipped),
          K(i, "预检中跳过 " + applied.skipped + " 条，本次不生成", "warn-t"));
      if (!y.size)
        return (
          (runBtn.disabled = !1),
          (runBtn.textContent = ut()),
          re(
            "ok",
            "没有要生成的文件",
            "你在预检里跳过了所有条目，本次没有生成任何文件。",
            [{ label: "知道了" }],
          ),
          { ok: !1, code: "NO_NEW", ctx: {} }
        );
      K(i, "⑤ 打包 zip …");
      const T = [...y.values()].map((e) => ({
        name: e.name,
        season: e.season,
        movie: !!e.movie,
        content: tt(P(a, e.f.name), e.f.sign, o),
        relPath: (e.movie ? l : l + "/Season " + M(e.season || c)) + "/" + e.name,
        source: e.f,
        title: l,
        year: $t(d || l),
        episode: e.ep || 0,
        tmdbid: "",
        cover: "",
      }));
      const manifest = makeManifest(
        importedManifest
          ? mergeManifestEntries(importedManifest.entries, T)
          : T,
        {
          openlistBase: o,
          outputRoot: O(t("libDir").value) || E,
          tmdbUsed: !!Ut(),
          generated: T.length,
          skipped: _,
          changed: manifestDiff.changed,
          deleted: manifestDiff.deleted,
        },
      );
      ((it = {
        libDir: O(t("libDir").value),
        single: !0,
        manifest: manifest,
        items: [
          {
            folder: l,
            showName: l,
            isMovie: !!S,
            season: c,
            groups: [...y.values()].map((e) => ({
              name: e.name,
              season: e.season,
              ep: e.ep,
              movie: !!e.movie,
              content: "",
            })),
          },
        ],
        files: T.map((e) => ({
          name:
            (e.movie ? l : l + "/Season " + M(e.season || c)) + "/" + e.name,
          content: e.content,
        })),
      }),
        Xe("strmDl"),
        Ze(
          Ve([
            ...T.map((e) => ({
              name:
                (e.movie ? l : l + "/Season " + M(e.season || c)) +
                "/" +
                e.name,
              content: e.content,
            })),
            manifestFileOf(manifest),
            packReadmeFile(),
          ]),
          "strm_" + l + ".zip",
          "strmDl",
          "↓ 下载 strm 包（" + T.length + " 个 strm + manifest.json）",
        ));
      let L = null;
      if (t("autoUpload").checked) {
        const e = O(t("libDir").value),
          n = await xe(
            T.map((t) => ({
              filename: t.name,
              season: t.movie ? "" : t.season || c,
              content: t.content,
              libDir: e,
              prefix: l,
            })),
            i,
            manifest,
          );
        ((L = { ok: n.ok, fail: n.fail, msg: n.msg, manifest: n.manifest }),
          !n.ok &&
            n.fail &&
            K(i, "  失败明细：" + (n.failList || []).join(" | "), "err-t"),
          n.skipped
            ? K(i, "自动上传跳过：" + n.msg, "warn-t")
            : (n.ok || n.fail) &&
              K(
                i,
                "✓ 上传完成：成功 " + n.ok + "，失败 " + n.fail,
                n.ok ? "ok-t" : "err-t",
              ));
      }
      const I = t("targetPath"),
        manifestNote =
          "；zip 内含 manifest.json（" +
          manifest.entries.length +
          " 条 · " +
          e.VERSION +
          " · commit " +
          e.BUILD_COMMIT +
          "），下次导入即可精确 diff" +
          (manifestDiff.deleted
            ? "；另有 " + manifestDiff.deleted + " 条旧条目默认保留未删"
            : "") +
          (L && L.manifest && L.manifest.ok
            ? "；已写回媒体库根目录 manifest.json，下次可直读"
            : "");
      if (
        (E
          ? ((I.textContent = E),
            (I.href = f + "/?path=" + encodeURIComponent(E)),
            (I.className = "path"),
            (t("targetWhere").textContent =
              "zip 在浏览器下载目录。点上方路径会在 OpenList 网页打开该目录，可在那里直接上传 strm。"))
          : ((I.textContent =
              "未检测到媒体库目录：请在「手动填写 / 修改参数」中填写媒体库目录后重新生成，或自行确认放置位置。"),
            I.removeAttribute("href"),
            (I.className = "path missing"),
            (t("targetWhere").textContent =
              "这里不猜测路径。填入真实媒体库目录后，工具会给出可点击的目标位置。")),
        L && L.ok === T.length)
      )
        ((t("doneDesc").textContent =
          "已生成 " +
          T.length +
          " 个播放文件并全部上传到媒体库：" +
          E +
          (w ? "（其中 " + w + " 集因文件名无集号已自动编号）" : "") +
          manifestNote),
          (t("strmNextGuide").innerHTML =
            "<b>接下来这样做</b>只需在 Jellyfin / Emby 里扫描媒体库，新剧集就能播。" +
            (_ ? "（媒体库已有 " + _ + " 集，本次只补了新集）" : "") +
            "<br>若扫不到，到 OpenList 网页确认上面的目录里确实有这些 .strm。"),
          (t("strmDl").style.display = "none"));
      else if (
        ((t("doneDesc").textContent =
          "已生成 " +
          T.length +
          " 个播放文件并打包" +
          (_ ? "（媒体库已有 " + _ + " 集，已跳过）" : "") +
          (w ? "（其中 " + w + " 集文件名无集号，已自动编号）" : "") +
          (D ? "（增量对比未完成：" + D + "）" : "") +
          manifestNote +
          "，下载后照下面步骤放进媒体库。"),
        (t("strmNextGuide").innerHTML =
          "<b>接下来这样做</b>1. 到浏览器下载目录找到 zip 并解压 → 2. 把解压出的 .strm 复制进对应剧集的 Season 目录 → 3. 在 Jellyfin / Emby 里扫描媒体库，新剧集就能播。<br>只加新集时只复制新文件；整部剧重做时才全量替换。若播放失败，先确认播放地址与签名，再排查路径变更、服务重启、token 轮换等原因。"),
        (t("strmDl").style.display = ""),
        L)
      ) {
        const e = document.createElement("div");
        ((e.className = "alert warn"),
          (e.id = "uploadWarn"),
          (e.innerHTML =
            "<b>自动上传未全部成功（成功 " +
            L.ok +
            "，失败 " +
            L.fail +
            "）</b>" +
            N(L.msg) +
            '<div class="hint">zip 已保留，可手动下载放入。常见原因：账号无写权限、目录不存在、CORS 未放行 PUT / File-Path 头。</div>'),
          t("s3").insertBefore(e, t("strmDl")));
      }
      return (
        (t("s3").style.display = ""),
        (t("s1").style.display = "none"),
        t("s3").scrollIntoView({ behavior: "smooth", block: "start" }),
        K(i, "✓ 完成", "ok-t"),
        { ok: !0, code: "OK", groups: T.length }
      );
    } catch (e) {
      return (
        re(
          "err",
          "生成失败",
          "生成过程中出错：" +
            N(e.message) +
            '<ul><li>可展开下方"运行日志"看详情</li><li>或检查目录和地址后重试</li></ul>',
        ),
        K(i, "生成失败：" + e.message, "err-t"),
        { ok: !1, code: "EXCEPTION", reason: e.message }
      );
    } finally {
      ((runBtn.disabled = !1), (runBtn.textContent = ut()), o || (D = !1));
    }
  }
  function ct(e, t) {
    const n = e.folder || e.showName,
      r = e.isMovie ? "movie" : "tv",
      o = e.season || "01",
      a = ht(t, n, e.isMovie ? "" : o);
    if (!a) return null;
    const s = e.isMovie ? a : a.replace(/\/Season\s+\d+$/i, ""),
      i = e.groups || [];
    if (!i.length) return null;
    let l = [];
    if ("tv" === r) {
      const e = new Map();
      (i.forEach((r) => {
        const a = String(r.season || o || "1").replace(/^0+(\d)/, "$1"),
          s = ht(t, n, a);
        s &&
          (e.has(a) ||
            e.set(a, {
              number: +a || 1,
              dir: s,
              name: "Season " + M(a),
              strms: [],
              nfo: !1,
              poster: !1,
              nfoSet: new Set(),
              error: "",
            }),
          e
            .get(a)
            .strms.push({
              name: r.name,
              base: B(r.name),
              ep: r.ep || 0,
              season: String(a),
            }));
      }),
        (l = [...e.values()]));
    }
    return {
      kind: r,
      dir: s,
      name: n,
      display: e.showName || n,
      year: $t(e.showName || n),
      tmdbId: "",
      matched: null,
      matchNote: "",
      exists: { tvshow: !1, movie: !1, poster: !1, fanart: !1 },
      relBase: t,
      seasons: l,
      epCount: i.length,
      selected: !0,
    };
  }
  const dt = "yy_tmdb_nokey_skip_v1";
  function ut() {
    return t("withMeta") && t("withMeta").checked
      ? "③ 开始生成（播放文件 + 封面）"
      : "③ 只生成播放文件";
  }
  function syncRerunMode() {
    const ow = t("overwriteMode"),
      badge = t("rerunBadge");
    if (!ow || !badge) return;
    const on =
      !!(t("metaOverwrite") && t("metaOverwrite").checked) ||
      !!(t("incremental") && !t("incremental").checked);
    ow.checked = on;
    badge.textContent = on
      ? "覆盖模式：会重写已有 strm / NFO / 海报"
      : "只新增、不覆盖";
    badge.classList.toggle("warn", on);
  }
  function mt() {
    const e = t("autoModeNote");
    if (!e) return;
    const n = t("withMeta") && t("withMeta").checked;
    e.innerHTML = n
      ? "<b>默认自动完成</b>：同时生成播放文件、影片信息和封面，不用勾选。"
      : "<b>当前只生成播放文件</b>：影片信息和封面未开启。";
  }
  function ft() {
    const e = t("tmdbTip");
    if (!e) return;
    const n = !(!t("withMeta") || !t("withMeta").checked || Ut());
    e.style.display = n ? "flex" : "none";
  }
  async function pt() {
    const e = !(!t("withMeta") || !t("withMeta").checked);
    if (
      e &&
      t("metaOverwrite") &&
      t("metaOverwrite").checked &&
      !overwriteModeConfirmed &&
      !window.confirm(
        "你勾选了「覆盖已有 NFO / 海报」。这会改写媒体库里已有的同名文件，本地手工修过的内容会丢失。继续吗？",
      )
    )
      return;
    if (
      e &&
      !Ut() &&
      !(function () {
        try {
          return "1" === localStorage.getItem(dt);
        } catch (e) {
          return !1;
        }
      })()
    )
      return void re(
        "warn",
        "未填写 TMDB Key",
        '<b>仍可直接生成，但只有基础信息。</b><ul><li><b>会生成</b>：播放文件、影片信息文件（NFO）、本地封面，Jellyfin / Emby 能正常识别</li><li><b>不会有</b>：简介、评分、演职员、TMDB 官方海报</li></ul><div class="hint">还没有 Key？' +
          n() +
          '，登录后按「设置 → API → 创建 API Key」操作，拿到后粘贴到「封面与保存」。</div><div class="hint">Key 只用于查询元数据，不会上传你的视频或文件。没有 Key 也可以先跑，之后随时补刮。</div>',
        [
          {
            label: "先这样生成",
            style: "green",
            fn: () => {
              (!(function () {
                try {
                  localStorage.setItem(dt, "1");
                } catch (e) {}
              })(),
                pt());
            },
          },
          {
            label: "去申请 Key",
            fn: () => {
              (Q("advMeta"),
                J(),
                setTimeout(() => {
                  const e = t("tmdbKey");
                  e && e.focus();
                }, 350));
            },
          },
        ],
      );
    const r = await lt({ unified: e });
    return (
      e &&
        r &&
        r.ok &&
        (await (async function () {
          const e = it;
          if (!e || !e.items || !e.items.length) return;
          const n = O(e.libDir || t("libDir").value);
          if (!n || "/" === n)
            return void re(
              "warn",
              "播放文件已生成，但还没填保存位置",
              "封面和影片信息需要知道你放在哪个媒体库文件夹。<ul><li>回到主页面，在「② 保存到媒体库」填上你的媒体库路径，例如 /媒体库/剧集 或 /媒体库/电影</li><li>再点一次「③ 开始生成」，就会把播放文件 + 封面信息合并</li></ul>",
              [{ label: "知道了" }],
            );
          const r = t("runStrmBtn");
          ((r.disabled = !0), (r.textContent = "正在刮削元信息…"), (D = !0));
          try {
            K(i, "⑥ 生成元信息（NFO + 海报）…");
            const r = [];
            if (
              (e.items.forEach((e) => {
                const t = ct(e, n);
                t && r.push(t);
              }),
              !r.length)
            )
              return void K(i, "没有可刮削的条目，跳过元信息", "warn-t");
            if (Ut()) {
              (K(i, "   匹配 TMDB（并发 3）…"),
                await Qe(
                  r,
                  3,
                  async (e) => {
                    try {
                      await Vt(e);
                    } catch (t) {
                      e.matchNote = t.message || "匹配失败";
                    }
                  },
                  () => {},
                ));
              const e = r.filter((e) => e.tmdbId).length;
              K(i, "   匹配完成：" + e + "/" + r.length, "ok-t");
            } else K(i, "   未填 TMDB Key：生成本地 NFO + 标题封面", "warn-t");
            const o = [],
              a = [];
            if (
              ((
                await Qe(r, 3, async (e, t) => {
                  K(
                    i,
                    "   [" + (t + 1) + "/" + r.length + "] " + e.display + " …",
                  );
                  try {
                    const t = await Qt(
                      e.dir,
                      "movie" === e.kind ? "movie" : "tv",
                    );
                    t &&
                      !t.error &&
                      (t.exists &&
                        (e.exists = Object.assign(e.exists, t.exists)),
                      "tv" === e.kind &&
                        t.seasons &&
                        e.seasons.forEach((e) => {
                          const n = t.seasons.find(
                            (t) => t.number === (e.number || 1),
                          );
                          n &&
                            ((e.nfo = n.nfo),
                            (e.poster = n.poster),
                            (e.nfoSet = n.nfoSet));
                        }));
                  } catch (e) {
                    K(
                      i,
                      "      检查已有文件失败（按缺失处理）：" + e.message,
                      "warn-t",
                    );
                  }
                  const n = await dn(e);
                  return n.ok
                    ? (K(
                        i,
                        "    ✓ " +
                          e.display +
                          "：NFO " +
                          n.files.filter((e) => "nfo" === e.type).length +
                          "，图片 " +
                          n.files.filter((e) => "img" === e.type).length,
                        "ok-t",
                      ),
                      (n.notes || [])
                        .slice(0, 3)
                        .forEach((t) =>
                          K(i, "      · " + e.display + "：" + t, "warn-t"),
                        ),
                      { ok: !0, files: n.files })
                    : (K(i, "    ✕ " + e.display + "：" + n.error, "err-t"),
                      { ok: !1, error: n.error });
                })
              ).forEach((e, t) => {
                e && e.ok
                  ? o.push(...e.files)
                  : a.push({ show: r[t], error: (e && e.error) || "未知错误" });
              }),
              !o.length)
            )
              return void re(
                "warn",
                "播放文件已生成，但影片信息没写出来",
                '原因多半是 TMDB 读取失败或没有匹配到条目。<div class="hint">播放文件包不受影响；展开页面底部「给已有影片补封面和信息（可选）」可单独重试。</div>',
                [{ label: "知道了" }],
              );
            const s = e.files.map((e) => ({
                name: e.name,
                content: e.content,
              })),
              l = new Set(s.map((e) => String(e.name).toLowerCase()));
            o.forEach((e) => {
              const t = String(e.rel || "").replace(/^\/+/, "");
              t &&
                !l.has(t.toLowerCase()) &&
                (l.add(t.toLowerCase()), s.push({ name: t, content: e.data }));
            });
            if (e.manifest) {
              updateManifestMeta(e.manifest, r, n);
              s.push(manifestFileOf(e.manifest));
              K(
                i,
                "   已更新 manifest.json（" +
                  e.manifest.entries.length +
                  " 条，含 TMDB ID 与封面来源）",
                "ok-t",
              );
            }
            if (!s.some((x) => x.name === "放这儿看我.txt")) s.push(packReadmeFile());
            const c =
              "strm+元信息_" +
              A(
                e.single ? e.items[0].folder : "合并" + e.items.length + "部",
              ).slice(0, 80) +
              ".zip";
            ((t("strmDl").style.display = ""),
              Xe("strmDl"),
              Ze(
                Ve(s),
                c,
                "strmDl",
                "↓ 下载合并包（播放文件 + 影片信息 + 封面，共 " +
                  s.length +
                  " 个文件）",
              ));
            let d = null;
            t("autoUpload").checked &&
              (K(i, "   写入元信息到媒体库（" + o.length + " 个文件）…"),
              (d = await un(o, i)),
              d.fail
                ? K(i, "   元信息上传失败 " + d.fail + " 个：" + d.msg, "err-t")
                : K(i, "   ✓ 元信息已写入 " + d.ok + " 个文件", "ok-t"));
            const u = o.filter((e) => "nfo" === e.type).length,
              m = o.filter((e) => "img" === e.type).length,
              f =
                (r.filter((e) => !e.tmdbId).length,
                (d && 0 === d.fail
                  ? "元信息也已写入媒体库。"
                  : d
                    ? "部分元信息上传失败，合并 zip 已保留。"
                    : "合并 zip 已生成，解压到你上面选的那个媒体库目录即可。") +
                  " 到 Jellyfin / Emby 对该剧集「刷新元数据 → 替换所有元数据（含图像）」才能看到新封面。");
            ((t("doneDesc").textContent =
              "已生成 " +
              e.files.length +
              " 个播放文件 + " +
              u +
              " 个影片信息文件、" +
              m +
              " 张图，并合并为一个 zip。"),
              (t("strmNextGuide").innerHTML =
                "<b>接下来这样做</b>下载并解压 → 把「剧名 / 片名」文件夹整个放进媒体库（例如 /媒体库/剧集 或 /媒体库/电影）→ 在 Jellyfin / Emby 扫描媒体库；已有条目再点「刷新元数据 → 替换所有元数据（含图像）」。"),
              re(
                a.length ? "warn" : "ok",
                "✓ 播放文件 + 封面 已完成",
                "<b>strm " +
                  e.files.length +
                  " 个 · NFO " +
                  u +
                  " 个 · 图片 " +
                  m +
                  " 张</b><ul>" +
                  r
                    .map(
                      (e) =>
                        "<li>" +
                        N(e.display) +
                        "：" +
                        (e.tmdbId
                          ? "TMDB #" + N(e.tmdbId)
                          : "未匹配（本地 NFO + 封面）") +
                        "</li>",
                    )
                    .join("") +
                  "</ul>" +
                  (a.length
                    ? "<b>元信息失败 " +
                      a.length +
                      " 部：</b><ul>" +
                      a
                        .slice(0, 5)
                        .map(
                          (e) =>
                            "<li>" +
                            N(e.show.display) +
                            "：" +
                            N(e.error) +
                            "</li>",
                        )
                        .join("") +
                      "</ul>"
                    : "") +
                  '<div class="hint">' +
                  N(f) +
                  "</div>",
                [{ label: "知道了", style: "primary" }],
                0,
              ),
              K(
                i,
                "✓ 合并完成：strm " +
                  e.files.length +
                  "，NFO " +
                  u +
                  "，图片 " +
                  m,
                "ok-t",
              ));
          } catch (e) {
            (re(
              "err",
              "影片信息刮削失败",
              "播放文件已生成，但影片信息阶段出错：" +
                N(e.message) +
                '<div class="hint">播放文件包不受影响；展开页面底部「给已有影片补封面和信息（可选）」可单独重试。</div>',
            ),
              K(i, "元信息阶段失败：" + e.message, "err-t"));
          } finally {
            ((D = !1), (r.disabled = !1), (r.textContent = ut()));
          }
        })()),
      r
    );
  }
  function ht(e, t, n) {
    const r = O(e);
    if (!r || "/" === r) return "";
    const o =
        r.match(/^(.*\/媒体库\/(?:剧集|电影))/i) ||
        r.match(/^(.*\/(?:剧集|电影))/i),
      a = o ? o[1] : r.replace(/\/[^/]*\/[^/]*$/, "");
    return a && "/" !== a
      ? O(
          n && "00" !== n && 0 !== +n
            ? a + "/" + A(t).slice(0, 100) + "/Season " + M(n)
            : a + "/" + A(t).slice(0, 100),
        )
      : "";
  }
  function gt(e, t, n, r, o) {
    if (
      1 === e.length &&
      !de(e[0].name).eps.length &&
      !ie.get(t + "|" + e[0].name)
    ) {
      const t = A(n).slice(0, 100);
      return {
        groups: new Map([
          [
            "movie",
            { name: t + ".strm", f: e[0], ep: 0, season: r, movie: !0 },
          ],
        ]),
        dups: [],
        autoN: 0,
        isMovie: !0,
      };
    }
    const a = e.map((e) => {
      const n = ie.get(t + "|" + e.name);
      return { f: e, meta: n ? { season: r, eps: n } : de(e.name) };
    });
    let s = 0;
    a.forEach((e) =>
      e.meta.eps.forEach((e) => {
        e > s && (s = e);
      }),
    );
    const i = new Map(),
      l = [],
      c = new Map();
    let d = 0,
      u = s + 1;
    const m = A(n).slice(0, 100);
    for (const e of a) {
      let t = e.meta.eps.slice();
      t.length || ((t = [u++]), d++);
      const n = e.meta.season || r;
      for (const r of t) {
        const t = n + "-" + M(r),
          o = (c.get(t) || 0) + 1;
        (c.set(t, o), o > 1 && l.push(t));
        const a = t + (o > 1 ? "_" + o : "");
        i.set(a, {
          name: m + " S" + M(n) + "E" + M(r) + (o > 1 ? "_" + o : "") + ".strm",
          f: e.f,
          ep: r,
          season: n,
        });
      }
    }
    return { groups: i, dups: l, autoN: d };
  }
  async function bt(e, n, r) {
    r = r || {};
    const o = [],
      a = [],
      s = [];
    let l = 0;
    for (const c of e) {
      (l++, K(i, "[" + l + "/" + e.length + "] 扫描 " + c + " …"));
      const d = [],
        u = await De(c, 0, d, {
          refresh: t("forceRefresh").checked,
          rootItems: r.rootItems,
          onSkip: (e, t) => {
            (K(i, "  ⚠ 跳过子目录 " + e + "（" + t + "）", "warn-t"),
              s.push(e + "（" + t + "）"));
          },
        });
      if (!u.ok) {
        (a.push({ dir: c, reason: Ce(u) }),
          K(i, "  ✕ 读取失败：" + Ce(u), "err-t"));
        continue;
      }
      const m = Ie(d, c),
        f = m.excluded.length,
        p = new Map();
      if (
        (m.media.forEach((e) => {
          const t = e.__dir || c;
          (p.has(t) || p.set(t, []), p.get(t).push(e));
        }),
        p.size)
      ) {
        for (const [e, t] of p) {
          t.sort((e, t) => e.name.localeCompare(t.name));
          let r = "";
          if (e === c) {
            const n = me(t[0].name, e);
            n.title && !/^\d+$/.test(n.title) && (r = n.title);
          }
          if (!r) {
            const t =
              (n && n.get(e)) ||
              (e === c && n && n.get(c)) ||
              e.split("/").filter(Boolean).pop() ||
              "剧集";
            r = me(t, "").title || t;
          }
          o.push({ dir: e, showName: r, vids: t });
        }
        (K(
          i,
          "  → 展开出 " +
            p.size +
            " 部影视资源" +
            (f ? "，排除 " + f + " 个非影视视频" : ""),
          "ok-t",
        ),
          f &&
            K(
              i,
              "  · 已排除：" +
                m.excluded.slice(0, 6).join("、") +
                (f > 6 ? " …" : ""),
              "warn-t",
            ));
      } else
        (a.push({ dir: c, reason: "该目录及其子目录里都没有影视资源" }),
          K(
            i,
            "  ✕ 没有可识别的影视资源" +
              (f ? "（已排除 " + f + " 个非影视视频）" : ""),
            "err-t",
          ));
    }
    return { shows: o, failDirs: a, skippedDirs: s };
  }
  async function yt(n, r) {
    const o = (r = r || {}).names || new Map(),
      a = i,
      s = [],
      l = [],
      c = [],
      d = new Set(),
      u = [],
      m = r.shows
        ? {
            shows: r.shows,
            failDirs: r.failDirs || [],
            skippedDirs: r.skippedDirs || [],
          }
        : await bt(n, o),
      p = m.shows;
    c.push(...m.failDirs);
    const h = m.skippedDirs || [];
    K(a, "共发现 " + p.length + " 部剧，开始生成 …");
    const g = R(t("playHost").value) || e.PLAY_BASE,
      b = t("incremental").checked,
      y = t("autoUpload").checked,
      k = O(t("libDir").value);
    let v = 0, ch = 0;
    const w = new Set();
    const oldIndex = importedManifest ? manifestIndex(importedManifest) : null;
    for (const e of p) {
      const { dir: t, showName: n, vids: r } = e,
        o = me(r[0].name, t).season || ue(t) || "01",
        i = A(n) || A("剧集"),
        { groups: m, dups: f, autoN: p, isMovie: h } = gt(r, t, i, o);
      let S = i,
        E = 1;
      for (; d.has(S.toLowerCase()); ) S = i + "_" + ++E;
      d.add(S.toLowerCase());
      const x = ht(k, S, h ? "" : o);
      let _ = 0;
      if (b) {
        const useManifest = !!oldIndex;
        if (useManifest) {
          for (const [e, n] of m) {
            const relPath = h
              ? S + "/" + e.name
              : S + "/Season " + M(e.season || o) + "/" + e.name;
            const old = oldIndex.get(manifestRelPath(relPath));
            if (!old) continue;
            if (manifestEntryChanged(old, { source: e.f })) ch++;
            else (m.delete(e), _++);
          }
        } else if (x) {
          const e = await _e(x, !1);
          if (!e.ok || e.incomplete)
            w.add(
              (e.incomplete ? "媒体库目录列表不完整" : "媒体库目录读取失败") +
                "（" +
                Ce(e) +
                "），按全量生成",
            );
          else {
            const t = new Set(
              e.items
                .filter((e) => !e.is_dir && /\.strm$/i.test(e.name))
                .map((e) => e.name.toLowerCase()),
            );
            for (const [e, n] of m)
              t.has(n.name.toLowerCase()) && (m.delete(e), _++);
          }
        } else w.add("未配置媒体库目录，增量对比跳过，按全量生成");
      }
      if (((v += _), m.size)) {
        for (const e of m.values()) {
          const r = tt(P(t, e.f.name), e.f.sign, g),
            a = e.movie
              ? S + "/" + e.name
              : S + "/Season " + M(e.season || o) + "/" + e.name;
          (s.push({
            name: a,
            content: r,
            relPath: a,
            source: e.f,
            title: S,
            year: $t(n),
            episode: e.ep || 0,
            tmdbid: "",
            cover: "",
          }),
            y &&
              u.push({
                filename: e.name,
                season: e.movie ? "" : e.season || o,
                content: r,
                libDir: k,
                prefix: S,
                show: n,
              }));
        }
        (l.push({
          dir: t,
          show: n,
          count: m.size,
          auto: p,
          dups: f.length,
          skip: _,
          target: x,
          folder: S,
          isMovie: !!h,
          season: o,
          groups: [...m.values()].map((e) => ({
            name: e.name,
            season: e.season,
            ep: e.ep,
            movie: !!e.movie,
          })),
        }),
          K(
            a,
            "  ✓ " +
              n +
              "：" +
              m.size +
              " 集" +
              (_ ? "（跳过未变化 " + _ + " 集）" : "") +
              (ch ? "（变化重写 " + ch + " 集）" : "") +
              (p ? "（" + p + " 个自动编号）" : "") +
              (f.length ? "（" + f.length + " 个重复集加后缀）" : ""),
            "ok-t",
          ));
      } else {
        if (_) {
          K(a, "  → " + n + "：" + _ + " 集已存在，跳过", "warn-t");
          continue;
        }
        (c.push({ dir: t, reason: "没有可生成的集" }),
          K(a, "  ✕ " + n + " 没有可生成的集", "err-t"));
      }
    }
    if (
      (s.length &&
        (it = {
          libDir: O(t("libDir").value),
          single: !1,
          items: l.map((e) => ({
            folder: e.folder,
            showName: e.show,
            isMovie: e.isMovie,
            season: e.season,
            groups: e.groups,
          })),
          files: s.map((e) => ({ name: e.name, content: e.content })),
        }),
      !s.length)
    )
      return (
        re(
          "ok",
          "没有新集需要生成",
          (v
            ? "媒体库里已有 " + v + " 集，本次没有新集。"
            : "所选目录都没能生成 strm。") +
            (c.length
              ? "<ul>" +
                c
                  .slice(0, 8)
                  .map((e) => "<li>" + N(e.dir) + "：" + N(e.reason) + "</li>")
                  .join("") +
                "</ul>"
              : ""),
        ),
        K(a, "✓ 无新集，结束", "ok-t"),
        { ok: !1, count: 0, skipExisting: v }
      );
    const manifest = makeManifest(
      importedManifest ? mergeManifestEntries(importedManifest.entries, s) : s,
      {
        openlistBase: g,
        outputRoot: k,
        tmdbUsed: !!Ut(),
        generated: s.length,
        skipped: v,
        changed: ch,
        deleted: importedManifest
          ? Math.max(0, (importedManifest.entries || []).length - s.length - v)
          : 0,
      },
    );
    it && (it.manifest = manifest);
    let S = null;
    if (y) {
      const e = await xe(u, a, manifest);
      ((S = { ok: e.ok, fail: e.fail, msg: e.msg, manifest: e.manifest }),
        !e.ok &&
          e.fail &&
          K(a, "  失败明细：" + (e.failList || []).join(" | "), "err-t"),
        e.skipped
          ? K(a, "自动上传跳过：" + e.msg, "warn-t")
          : (e.ok || e.fail) &&
            K(
              a,
              "✓ 上传完成：成功 " + e.ok + "，失败 " + e.fail,
              e.ok ? "ok-t" : "err-t",
            ));
    }
    Ze(
      Ve([...s, manifestFileOf(manifest), packReadmeFile()]),
      "strm_" + (r.zipName || "批量" + l.length + "部") + ".zip",
      "strmDl",
      "↓ 下载 strm 包（" +
        s.length +
        " 个 strm + manifest.json / " +
        l.length +
        " 部）",
    );
    const E = l
        .map(
          (e) =>
            "<li>" +
            N(e.show) +
            "：" +
            e.count +
            " 集" +
            (e.skip ? "（跳过已有 " + e.skip + " 集）" : "") +
            (e.auto ? "（" + e.auto + " 集自动编号）" : "") +
            (e.dups ? "（" + e.dups + " 重复集加后缀）" : "") +
            "</li>",
        )
        .join(""),
      x = c.length
        ? "<b>失败 " +
          c.length +
          " 个：</b><ul>" +
          c
            .map((e) => "<li>" + N(e.dir) + "：" + N(e.reason) + "</li>")
            .join("") +
          "</ul>"
        : "",
      _ = S && S.ok === s.length,
      D =
        r.allInOne && 1 === l.length
          ? "✓ 生成完成（已自动展开子目录）"
          : "✓ 批量生成完成";
    let T =
      "zip 内已按「剧名/Season 季号/」分好目录，解压后把剧名文件夹整个放进媒体库的剧集文件夹即可，无需手动建 Season。";
    const L = [...w].join("；");
    (L && (T += "（增量对比：" + L + "）"),
      h.length &&
        (T +=
          " 有 " +
          h.length +
          " 个子目录因读取失败被跳过：" +
          h.slice(0, 3).join("、")),
      _
        ? (T =
            "已全部自动上传到媒体库，只需在 Jellyfin/Emby 扫库。下方 zip 可忽略（留作备份）。")
        : S &&
          (T +=
            " 自动上传：成功 " +
            S.ok +
            "，失败 " +
            S.fail +
            "（" +
            S.msg +
            "）。"),
      r.unified ||
        re(
          c.length ? "warn" : "ok",
          D,
          "<b>成功 " +
            l.length +
            " 部，共 " +
            s.length +
            " 个 strm" +
            (v ? "，跳过已有 " + v + " 集" : "") +
            "</b><ul>" +
            E +
            "</ul>" +
            x +
            '<div class="hint">' +
            N(T) +
            "</div>",
          [
            {
              label: "知道了",
              style: "primary",
              fn: () => {
                const e = t("s3");
                e && e.scrollIntoView({ behavior: "smooth", block: "start" });
              },
            },
          ],
          30,
        ),
      (t("s3").style.display = ""),
      (t("s1").style.display = "none"),
      _
        ? ((t("doneDesc").textContent =
            "已生成并上传 " +
            s.length +
            " 个 strm（" +
            l.length +
            " 部剧）到媒体库，只需扫库。"),
          (t("strmNextGuide").innerHTML =
            "<b>接下来这样做</b>只需在 Jellyfin / Emby 里扫描媒体库，新剧集就能播。" +
            (v ? "（已有 " + v + " 集已跳过）" : "")),
          (t("strmDl").style.display = "none"))
        : ((t("doneDesc").textContent =
            "已生成 " +
            s.length +
            " 个 strm（" +
            l.length +
            " 部剧" +
            (v ? "，跳过已有 " + v + " 集" : "") +
            "），zip 已按剧名/Season 分好目录。"),
          (t("strmNextGuide").innerHTML =
            "<b>接下来这样做</b>1. 下载并解压 zip → 2. 把每个「剧名 / 片名」文件夹整个放进媒体库（例如 /媒体库/剧集 或 /媒体库/电影，内部目录已建好）→ 3. 在 Jellyfin / Emby 扫库。"),
          (t("strmDl").style.display = "")));
    const I = t("uploadWarn");
    I && I.parentNode && I.parentNode.removeChild(I);
    const C = t("targetPath");
    return (
      1 === l.length && l[0].target
        ? ((C.textContent = l[0].target),
          (C.href = f + "/?path=" + encodeURIComponent(l[0].target)),
          (C.className = "path"))
        : ((C.textContent =
            "多部剧：各剧目标为媒体库下的对应剧名/Season 目录（zip 内已分文件夹）。"),
          C.removeAttribute("href"),
          (C.className = "path missing")),
      (t("targetWhere").textContent = _
        ? "已全部上传到媒体库，只需扫库；zip 留作备份。"
        : "zip 在浏览器下载目录，解压后按剧名/Season 目录放进媒体库即可。"),
      K(
        a,
        "✓ 完成：成功 " +
          l.length +
          " 部，失败 " +
          c.length +
          " 部" +
          (S ? "，上传成功 " + S.ok : ""),
        "ok-t",
      ),
      t("s3").scrollIntoView({ behavior: "smooth", block: "start" }),
      { ok: !0, count: s.length, shows: l.length }
    );
  }
  async function kt(n) {
    const r = !!(n = n || {}).fromFix,
      o = !!n.internal;
    if (D && !o) return { ok: !1, code: "BUSY" };
    o || (D = !0);
    const a = t("scanSubBtn");
    ((a.disabled = !0),
      (a.textContent = "正在扫描…"),
      Z(c),
      (t("subLog").innerHTML = ""),
      (t("packSubBtn").style.display = "none"),
      Xe("subDl"),
      (S = []),
      (E = []),
      (x = []),
      (_ = []));
    try {
      if ((K(l, "① 连接 OpenList …"), !(await ye()).ok))
        return (r || ke(), { ok: !1, code: "CONN_FAIL", reason: h });
      const n = O(t("libDir").value);
      if (!n || "/" === n)
        return (
          re(
            "warn",
            "先填媒体库目录",
            "字幕扫描需要一个明确的目录。请展开下方填写媒体库目录后再扫描，避免扫到根目录。",
            [
              ce("SUB_NO_DIR", {}),
              { label: "去填写", step: "advSub" },
              { label: "知道了" },
            ],
          ),
          { ok: !1, code: "SUB_NO_DIR", ctx: {} }
        );
      K(
        l,
        "② 扫描目录：" +
          n +
          (t("subRecursive").checked
            ? "（含子目录，最多 " + e.MAX_DEPTH + " 层）"
            : ""),
      );
      const o = [],
        a = t("subRecursive").checked
          ? await De(n, 0, o, {
              refresh: t("forceRefresh").checked,
              onSkip: (e, t) =>
                K(l, "  ⚠ 跳过子目录 " + e + "（" + t + "）", "warn-t"),
            })
          : await _e(n);
      if (!a.ok)
        return (
          re("err", "读取目录失败", "接口错误：" + N(Ce(a)), [
            ce("READ_FAIL", { rerun: "sub" }),
            { label: "去改目录", step: "advSub" },
            { label: "知道了" },
          ]),
          K(l, "读取失败：" + Ce(a), "err-t"),
          { ok: !1, code: "READ_FAIL", reason: Ce(a), ctx: { rerun: "sub" } }
        );
      const s = t("subRecursive").checked ? o : a.items;
      x = s.filter((e) => Te(e) || (!e.is_dir && /\.strm$/i.test(e.name)));
      const i = (e) => {
        const t = de(e);
        return t.eps.length ? t.eps[0] : 9999;
      };
      if (
        ((E = s.filter((e) => !e.is_dir && /\.idx$/i.test(e.name))),
        (S = s
          .filter(
            (t) =>
              !t.is_dir && e.SUB_RE.test(t.name) && !/\.idx$/i.test(t.name),
          )
          .sort(
            (e, t) => i(e.name) - i(t.name) || e.name.localeCompare(t.name),
          )),
        K(
          l,
          "✓ 找到 " +
            S.length +
            " 个字幕文件、" +
            E.length +
            " 个 idx 索引、" +
            x.length +
            " 个视频条目",
          "ok-t",
        ),
        !S.length)
      )
        return (
          re(
            "info",
            "没找到外挂字幕",
            "这个目录里没有 .srt / .ass / .ssa / .sub 文件。<ul><li>若内嵌字幕读不出来，需要的是已提取好的外挂字幕文件——本工具只打包现成的，不会从视频里提取</li><li>本工具只扫描当前目录及其子目录（最多 " +
              e.MAX_DEPTH +
              " 层），请确认目录填到 Season 一级</li></ul>",
            [
              ce("SUB_NO_FILE", {}),
              { label: "改目录再试", step: "advSub" },
              { label: "知道了" },
            ],
          ),
          { ok: !1, code: "SUB_NO_FILE", ctx: {} }
        );
      q(
        l,
        S.map((e) => "  · " + e.name),
      );
      const d = he(S, x, t("subMode").value);
      return (
        (_ = d.items),
        d.conflicts &&
          K(
            l,
            "注意：" + d.conflicts + " 个字幕重名，已自动保留语言标记",
            "warn-t",
          ),
        X(
          c,
          "ok",
          '找到 <b style="display:inline">' +
            S.length +
            " 个字幕文件</b>" +
            (d.conflicts ? "（" + d.conflicts + " 个重名已加语言标记）" : "") +
            "，点下方绿色按钮打包下载。",
        ),
        (t("packSubBtn").style.display = ""),
        { ok: !0, code: "OK", count: S.length }
      );
    } catch (e) {
      return (
        re("err", "扫描失败", "扫描字幕时出错：" + N(e.message)),
        K(l, "扫描失败：" + e.message, "err-t"),
        { ok: !1, code: "EXCEPTION", reason: e.message }
      );
    } finally {
      ((a.disabled = !1), (a.textContent = "扫描字幕文件"), o || (D = !1));
    }
  }
  async function vt(t, n) {
    const r = O(n).split("/").map(encodeURIComponent).join("/"),
      o = [
        { u: f + "/d" + r + (t.sign ? "?sign=" + et(t.sign) : ""), auth: !0 },
      ];
    if (t.raw_url)
      try {
        const e = new URL(t.raw_url);
        ("http:" !== e.protocol && "https:" !== e.protocol) ||
          0 === t.raw_url.indexOf(f) ||
          o.push({ u: t.raw_url, auth: !1 });
      } catch (e) {}
    let a = "未知错误";
    for (const { u: t, auth: n } of o)
      for (let r = 0; r < 2; r++) {
        if (I && I.signal.aborted)
          return { ok: !1, error: "已取消", cancelled: !0 };
        const o = new AbortController(),
          s = setTimeout(() => o.abort(), e.TIMEOUT_FETCH),
          i = () => {
            try {
              o.abort();
            } catch (e) {}
          };
        I &&
          !I.signal.aborted &&
          I.signal.addEventListener("abort", i, { once: !0 });
        try {
          const e = n && p ? { Authorization: p } : {},
            s = await fetch(t, { headers: e, signal: o.signal });
          if (401 === s.status || 403 === s.status) {
            if (
              ((a = "HTTP " + s.status),
              n && r < 1 && (await ye({ force: !0 })).ok)
            )
              continue;
            break;
          }
          if (!s.ok) {
            a = "HTTP " + s.status;
            break;
          }
          return { ok: !0, buf: new Uint8Array(await s.arrayBuffer()) };
        } catch (e) {
          a =
            ("AbortError" === e.name
              ? I && I.signal.aborted
                ? "已取消"
                : "读取超时"
              : e.message || "读取失败") + (n ? "" : "（直链跨域可能被拦）");
          break;
        } finally {
          (clearTimeout(s), I && I.signal.removeEventListener("abort", i));
        }
      }
    return { ok: !1, error: a };
  }
  (t("runStrmBtn").addEventListener("click", () => pt()),
    (function () {
      const b = t("importManifestBtn"),
        f = t("manifestFile"),
        c = t("clearManifestBtn"),
        s = t("tmdbSession"),
        cl = t("clearLocalBtn"),
        libM = t("libraryManifestBtn"),
        pre = t("preflightBtn"),
        ow = t("overwriteMode");
      b &&
        f &&
        (b.addEventListener("click", () => f.click()),
        f.addEventListener("change", async () => {
          const file = f.files && f.files[0];
          file && (await loadManifestFile(file));
          f.value = "";
        }));
      c && c.addEventListener("click", () => clearImportedManifest());
      libM &&
        libM.addEventListener("click", async () => {
          if (D) return;
          await loadManifestFromLibrary();
        });
      pre &&
        pre.addEventListener("click", () => {
          if (D) return;
          lt({ dryRun: true });
        });
      ow &&
        ow.addEventListener("change", () => {
          if (ow.checked) {
            if (
              !window.confirm(
                "覆盖模式会重写媒体库里已有的同画 strm / NFO / 海报，本地手工改过的内容会丢失。\n\n只在整部重做时打开。继续吗？",
              )
            ) {
              ((ow.checked = !1), (overwriteModeConfirmed = !1), syncRerunMode());
              return;
            }
            overwriteModeConfirmed = true;
          } else overwriteModeConfirmed = false;
          t("incremental") && (t("incremental").checked = !ow.checked);
          t("metaOverwrite") && (t("metaOverwrite").checked = ow.checked);
          syncRerunMode();
        });
      ["incremental", "metaOverwrite"].forEach((id) => {
        const el = t(id);
        el &&
          el.addEventListener("change", () => {
            overwriteModeConfirmed = !1;
            syncRerunMode();
          });
      });
      s &&
        s.addEventListener("change", () => {
          if (s.checked) {
            try {
              const n = JSON.parse(localStorage.getItem(e.CFG_KEY) || "{}");
              (delete n.tmdbKey, delete n.tmdbToken);
              localStorage.setItem(e.CFG_KEY, JSON.stringify(n));
            } catch (x) {}
            setManifestStatus(
              "已切换为仅本次会话：TMDB Key / Token 不再写入 localStorage，刷新页面后需重填。",
            );
          }
          ot();
        });
      cl &&
        cl.addEventListener("click", () => {
          if (!window.confirm("清除本工具的全部本地数据？包括配置、最近目录和 TMDB Key。"))
            return;
          try {
            localStorage.removeItem(e.CFG_KEY);
            localStorage.removeItem("wb_avtool_recent_dirs");
            localStorage.removeItem("yy_tmdb_nokey_skip_v1");
            (t("tmdbKey").value = ""), (t("tmdbToken").value = "");
            setManifestStatus("本地数据已清除；当前页面里的密码不会被清除。");
          } catch (x) {}
        });
    })(),
    t("withMeta") &&
      t("withMeta").addEventListener("change", (e) => {
        (!D && t("runStrmBtn") && (t("runStrmBtn").textContent = ut()),
          mt(),
          ft());
      }),
    ["tmdbKey", "tmdbToken"].forEach((e) => {
      const n = t(e);
      n && n.addEventListener("input", ft);
    }),
    t("clearKeyBtn") &&
      t("clearKeyBtn").addEventListener("click", () => {
        ((t("tmdbKey").value = ""),
          (t("tmdbToken").value = ""),
          ot(),
          ft(),
          re(
            "ok",
            "已清除 TMDB Key",
            "Key 和 Access Token 已从本机输入框与保存的配置中清除。",
          ));
      }),
    t("tmdbTipBtn") &&
      t("tmdbTipBtn").addEventListener("click", () => {
        (Q("advMeta"),
          J(),
          setTimeout(() => {
            const e = t("tmdbKey");
            e && e.focus();
          }, 350));
      }),
    t("pickBatch").addEventListener("click", async function () {
      if (D) return;
      const e = [...v.keys()];
      if (e.length) {
        (se(),
          (D = !0),
          Xe("strmDl"),
          (t("strmLog").innerHTML = ""),
          (t("s3").style.display = "none"),
          K(i, "批量生成：共 " + e.length + " 个目录 …"));
        try {
          if (!(await ye()).ok)
            return void re(
              "err",
              "连不上 OpenList",
              "批量生成前连接失败：" + N(h || "未知"),
              [ce("CONN_FAIL", {})],
            );
          (await yt(e, { names: v }), v.clear(), Ue());
        } catch (e) {
          (re("err", "批量生成失败", "批量过程中出错：" + N(e.message)),
            K(i, "批量失败：" + e.message, "err-t"));
        } finally {
          D = !1;
        }
      }
    }),
    (t("restartStrm").onclick = () => {
      (r.forEach((e) => {
        const n = t(e);
        n && (n.value = "");
      }),
        (t("s3").style.display = "none"),
        (t("s1").style.display = ""),
        Xe("strmDl"),
        (k = []),
        ie.clear(),
        st(),
        at(),
        t("s1").scrollIntoView({ behavior: "smooth", block: "start" }));
    }),
    (t("openTargetBtn").onclick = () => {
      const e = t("targetPath").getAttribute("href");
      e && "#" !== e
        ? window.open(e, "_blank", "noopener")
        : re(
            "info",
            "无统一路径",
            0 === t("targetPath").textContent.indexOf("多部剧")
              ? "本次是多部剧，各剧目标目录不同，没有单一路径可在 OpenList 打开。"
              : "尚无目标路径，请先填写媒体库目录并重新生成。",
          );
    }),
    (t("copyTargetBtn").onclick = async () => {
      const e = t("targetPath").textContent;
      if (0 !== e.indexOf("未检测到") && 0 !== e.indexOf("多部剧"))
        try {
          (await navigator.clipboard.writeText(e),
            re("ok", "已复制", "目录路径已复制，可直接粘到文件管理器。"));
        } catch (e) {
          const n = document.createRange();
          n.selectNodeContents(t("targetPath"));
          const r = getSelection();
          (r.removeAllRanges(),
            r.addRange(n),
            re(
              "info",
              "请手动复制",
              "浏览器未允许自动复制，路径已选中，按 Ctrl/Cmd+C 复制即可。",
            ));
        }
      else
        re(
          "info",
          "无统一路径",
          "本次是多部剧，各剧目标目录不同（见上方结果和 zip 内文件夹），没有单一路径可复制。",
        );
    }),
    t("scanSubBtn").addEventListener("click", () => kt()),
    t("packSubBtn").addEventListener("click", async () => {
      if (D || !_.length) return;
      ((D = !0), (L = !1), (I = new AbortController()));
      const e = t("packSubBtn");
      ((e.disabled = !0), (e.textContent = "正在打包…"), Xe("subDl"));
      const n = t("cancelSubBtn");
      ((n.disabled = !1),
        (n.textContent = "取消本次打包"),
        (t("subRunning").style.display = "flex"),
        (t("subProgress").style.display = "block"),
        (t("subProgress").querySelector("i").style.width = "0%"));
      try {
        const e = W();
        K(l, "③ 读取字幕内容并打包（并发 " + e + "）…");
        const n = O(t("libDir").value),
          r = new Map();
        E.forEach((e) => r.set(B(e.name).toLowerCase(), e));
        const o = await Qe(
          _,
          e,
          async (e) => {
            const t = P(e.file.__dir || n, e.file.name),
              r = await vt(e.file, t);
            return r.ok && r.buf && r.buf.length
              ? {
                  it: e,
                  content: /\.(sub|idx)$/i.test(e.file.name) ? r.buf : j(r.buf),
                }
              : { it: e, error: r.ok ? "内容为空" : r.error };
          },
          (e, t) => {
            (ee(d, e, t), e % 10 == 0 && K(l, "  进度 " + e + "/" + t));
          },
          () => L,
        );
        ee(d, 1, 1);
        const a = [],
          s = [],
          i = L ? _.length - o.filter(Boolean).length : 0,
          u = [];
        if (
          (o.forEach((e) => {
            e && !e.error
              ? (a.push({ name: e.it.target, content: e.content }),
                u.push(
                  "  · " +
                    e.it.file.name +
                    (e.it.target !== e.it.file.name
                      ? " → " + e.it.target
                      : "") +
                    " (" +
                    e.content.length +
                    ")",
                ))
              : s.push({
                  name: e && e.it ? e.it.file.name : "?",
                  error: e ? e.error : "未读取（已取消）",
                });
          }),
          q(l, u, "ok-t"),
          !L)
        )
          for (const e of _.filter((e) => /\.sub$/i.test(e.file.name))) {
            if (L) break;
            if (!a.some((t) => t.name === e.target)) continue;
            const t = r.get(B(e.file.name).toLowerCase());
            if (!t) continue;
            const o = P(t.__dir || n, t.name),
              s = await vt(t, o);
            if (s.ok && s.buf && s.buf.length) {
              const n = B(e.target) + ".idx";
              (a.some((e) => e.name === n) ||
                a.push({ name: n, content: s.buf }),
                K(
                  l,
                  "  · 附带 " + t.name + " → " + n + " (" + s.buf.length + ")",
                  "ok-t",
                ));
            } else
              K(
                l,
                "  提示：" +
                  t.name +
                  " 读取失败（" +
                  (s.error || "空") +
                  "），.sub 可能无法单独显示",
                "warn-t",
              );
          }
        if (!a.length)
          return void re(
            "err",
            L ? "已取消" : "没有可打包的字幕",
            L
              ? "已取消，没有生成 zip。"
              : "所有字幕都读取失败。常见原因：直链跨域被拦、账号权限不足、路径错误。展开日志查看每一条的具体错误。",
          );
        (Ze(
          Ve(a),
          "subtitles_" + a.length + ".zip",
          "subDl",
          "↓ 下载字幕包（" + a.length + " 个文件）",
        ),
          L
            ? (re(
                "warn",
                "已取消，仅打包已完成部分",
                "已停止。包内仅含已完成读取的 " +
                  a.length +
                  " 个文件，未读取的 " +
                  i +
                  " 个未写入。<ul><li>如需完整包，请重新点打包</li></ul>",
              ),
              K(
                l,
                "已取消：仅打包 " + a.length + " 个，跳过 " + i + " 个",
                "warn-t",
              ))
            : s.length &&
              (re(
                "warn",
                s.length + " 个字幕未打包",
                "<ul>" +
                  s
                    .slice(0, 5)
                    .map(
                      (e) => "<li>" + N(e.name) + "：" + N(e.error) + "</li>",
                    )
                    .join("") +
                  '</ul><div class="hint">这些文件没有写进 zip（不再生成 0 字节空文件）。成功 ' +
                  a.length +
                  " 个照常可下载。</div>",
              ),
              K(l, "✕ 失败 " + s.length + " 个", "err-t")),
          X(
            c,
            L ? "warn" : "ok",
            (L
              ? "<b>已取消</b>包内仅含已完成文件。"
              : "<b>打包完成</b>点下方绿色下载链接即可。") +
              (s.length ? "（" + s.length + " 个失败，详见日志）" : ""),
          ),
          L || K(l, "✓ 完成：成功 " + a.length + "，失败 " + s.length, "ok-t"));
      } catch (e) {
        (re("err", "打包失败", "打包字幕时出错：" + N(e.message)),
          K(l, "打包失败：" + e.message, "err-t"));
      } finally {
        ((e.disabled = !1),
          (e.textContent = "打包字幕"),
          (D = !1),
          (t("subRunning").style.display = "none"),
          ee(d, 1, 1));
      }
    }));
  const wt = {
    root: "",
    roots: [],
    shows: [],
    scanning: !1,
    scraping: !1,
    matching: !1,
  };
  let St = null;
  const Et =
      /^(?:\.|@|extrafanart|extrathumbs|backdrops?|metadata|actors?|behind|samples?|trailers?|featurettes?|subs?$|字幕)/i,
    xt = /^(?:Season\s*0?\d{1,2}|S\s*0?\d{1,2}|第\s*\d{1,3}\s*季|Specials?)$/i,
    _t = /^(?:剧集|电视剧|tv|series|shows?|电视节目)$/i,
    Dt = /^(?:电影|影片|movies?|films?)$/i;
  function Tt(e) {
    return String(null == e ? "" : e)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
  function Lt(e, t, n) {
    return null == t || "" === t || !1 === t
      ? ""
      : "  <" + e + (n ? " " + n : "") + ">" + Tt(t) + "</" + e + ">\n";
  }
  const It = '<?xml version="1.0" encoding="utf-8" standalone="yes"?>\n';
  function Ct(e) {
    let t = "";
    return (
      (e || []).forEach((e, n) => {
        t +=
          "  <actor>\n" +
          Lt("name", e.name) +
          Lt("role", e.role) +
          Lt("order", n) +
          (e.thumb ? Lt("thumb", e.thumb) : "") +
          "  </actor>\n";
      }),
      t
    );
  }
  function Nt(e) {
    let t = "";
    return (
      e.posterNfo &&
        (t += '  <thumb aspect="poster">' + Tt(e.posterNfo) + "</thumb>\n"),
      e.fanartNfo &&
        (t += "  <fanart><thumb>" + Tt(e.fanartNfo) + "</thumb></fanart>\n"),
      t
    );
  }
  function Bt(e) {
    let t = "";
    return (
      (t += Lt("title", e.title)),
      e.originalTitle &&
        e.originalTitle !== e.title &&
        (t += Lt("originaltitle", e.originalTitle)),
      (t += Lt("sorttitle", e.title)),
      (t += Lt("plot", e.overview)),
      (t += Lt("tagline", e.tagline)),
      e.rating && (t += Lt("rating", e.rating)),
      e.votes && (t += Lt("votes", e.votes)),
      e.year && (t += Lt("year", e.year)),
      e.premiered && (t += Lt("premiered", e.premiered)),
      e.runtime && (t += Lt("runtime", e.runtime)),
      (e.genres || []).forEach((e) => (t += Lt("genre", e))),
      (e.studios || []).forEach((e) => (t += Lt("studio", e))),
      (e.countries || []).forEach((e) => (t += Lt("country", e))),
      t
    );
  }
  function Mt(e) {
    let t = It + "<movie>\n" + Bt(e);
    return (
      e.imdbId && (t += Lt("imdbid", e.imdbId)),
      e.tmdbId &&
        ((t +=
          '  <uniqueid type="tmdb" default="true">' +
          Tt(e.tmdbId) +
          "</uniqueid>\n"),
        (t += Lt("tmdbid", e.tmdbId))),
      (e.directors || []).forEach((e) => (t += Lt("director", e))),
      (t += Ct(e.actors)),
      (t += Nt(e)),
      (t += "</movie>\n"),
      t
    );
  }
  function At(e) {
    let t = It + "<tvshow>\n" + Bt(e);
    return (
      e.status && (t += Lt("status", e.status)),
      e.imdbId && (t += Lt("imdbid", e.imdbId)),
      e.tvdbId && (t += Lt("tvdbid", e.tvdbId)),
      e.tmdbId &&
        ((t +=
          '  <uniqueid type="tmdb" default="true">' +
          Tt(e.tmdbId) +
          "</uniqueid>\n"),
        (t += Lt("tmdbid", e.tmdbId))),
      (t += Ct(e.actors)),
      (t += Nt(e)),
      (t += "</tvshow>\n"),
      t
    );
  }
  function Ot(e, t, n, r) {
    let o = It + "<season>\n";
    return (
      (o += Lt("seasonnumber", e)),
      (o += Lt("title", t || "第 " + e + " 季")),
      (o += Lt("plot", n)),
      r && (o += '  <thumb aspect="poster">' + Tt(r) + "</thumb>\n"),
      (o += "</season>\n"),
      o
    );
  }
  function Pt(e, t) {
    let n = It + "<episodedetails>\n";
    return (
      (n += Lt("title", t.title || "第 " + t.episode + " 集")),
      (n += Lt("showtitle", e.title)),
      (n += Lt("season", t.season)),
      (n += Lt("episode", t.episode)),
      (n += Lt("plot", t.overview)),
      t.aired && (n += Lt("aired", t.aired)),
      t.runtime && (n += Lt("runtime", t.runtime)),
      t.rating && (n += Lt("rating", t.rating)),
      t.tmdbId &&
        ((n +=
          '  <uniqueid type="tmdb" default="true">' +
          Tt(t.tmdbId) +
          "</uniqueid>\n"),
        (n += Lt("tmdbid", t.tmdbId))),
      t.stillNfo && (n += "  <thumb>" + Tt(t.stillNfo) + "</thumb>\n"),
      (t.directors || []).forEach((e) => (n += Lt("director", e))),
      (t.writers || []).forEach((e) => (n += Lt("writer", e))),
      (n += "</episodedetails>\n"),
      n
    );
  }
  function Rt() {
    const e = (e) => {
      const n = t(e);
      return n ? String(n.value || "").trim() : "";
    };
    return {
      api: (e("tmdbApi") || "https://api.themoviedb.org/3").replace(/\/+$/, ""),
      img: (e("tmdbImg") || "https://image.tmdb.org/t/p").replace(/\/+$/, ""),
      key: e("tmdbKey"),
      token: e("tmdbToken"),
      lang: e("tmdbLang") || "zh-CN",
    };
  }
  function Ut() {
    const e = Rt();
    return !(!e.key && !e.token);
  }
  async function Ht(t, n) {
    const r = Rt();
    if (!r.key && !r.token) return { ok: !1, error: "未配置 TMDB API Key" };
    const o = new URLSearchParams(Object.assign({ language: r.lang }, n || {}));
    r.token || o.set("api_key", r.key);
    const a = {};
    r.token && (a.Authorization = "Bearer " + r.token);
    const s = new AbortController(),
      i = setTimeout(() => s.abort(), e.TIMEOUT_FETCH);
    try {
      const e = await fetch(r.api + t + "?" + o.toString(), {
        headers: a,
        signal: s.signal,
      });
      let n = null;
      try {
        n = await e.json();
      } catch (e) {}
      return e.ok
        ? n && !1 !== n.success
          ? { ok: !0, data: n }
          : { ok: !1, error: (n && n.status_message) || "TMDB 返回失败" }
        : {
            ok: !1,
            error:
              (n &&
                (n.status_message || (n.errors && n.errors[0]) || n.message)) ||
              "HTTP " + e.status,
            status: e.status,
          };
    } catch (e) {
      return {
        ok: !1,
        error:
          "AbortError" === e.name
            ? "TMDB 请求超时（检查接口地址/网络）"
            : "连不上 TMDB：" +
              (e.message || "网络错误") +
              "（国内直连常被墙，请填反代地址）",
      };
    } finally {
      clearTimeout(i);
    }
  }
  function Ft(e, t) {
    return t
      ? Rt().img + "/" + e + ("/" === String(t).charAt(0) ? t : "/" + t)
      : "";
  }
  function jt(e) {
    return String(null == e ? "" : e)
      .toLowerCase()
      .replace(/[\s\-_:：·,，.。!！?？'"“”‘’()（）\[\]【】<>《》]/g, "")
      .replace(/第\s*\d+\s*季|season\s*\d+/g, "");
  }
  function zt(e) {
    let t = "";
    try {
      t = me(String(e || ""), "").title;
    } catch (e) {
      t = "";
    }
    return (
      (t = (t || String(e || ""))
        .replace(/[（(]\s*(?:19|20)\d{2}\s*[）)]/g, " ")
        .trim()),
      t || String(e || "")
    );
  }
  function $t(e) {
    const t = String(e || "").match(/(?:^|[^0-9])((?:19|20)\d{2})(?:[^0-9]|$)/);
    return t ? t[1] : "";
  }
  function Kt(e) {
    const t = String(e || "").trim();
    if (/^Specials?$/i.test(t)) return 0;
    const n = t.match(/第\s*([一二三四五六七八九十]{1,4})\s*季/);
    if (n) {
      const e = (function (e) {
        const t = {
            一: 1,
            二: 2,
            三: 3,
            四: 4,
            五: 5,
            六: 6,
            七: 7,
            八: 8,
            九: 9,
          },
          n = String(e || "");
        return /^十$/.test(n)
          ? 10
          : /^十[一二三四五六七八九]$/.test(n)
            ? 10 + t[n.charAt(1)]
            : /^[一二三四五六七八九]十$/.test(n)
              ? 10 * t[n.charAt(0)]
              : /^[一二三四五六七八九]十[一二三四五六七八九]$/.test(n)
                ? 10 * t[n.charAt(0)] + t[n.charAt(2)]
                : /^[一二三四五六七八九]$/.test(n)
                  ? t[n]
                  : null;
      })(n[1]);
      if (null !== e) return e;
    }
    const r =
      t.match(/[Ss]eason\s*0?(\d{1,2})/) ||
      t.match(/^[Ss]\s*0?(\d{1,2})$/) ||
      t.match(/第\s*(\d{1,3})\s*季/) ||
      t.match(/^S(?:0?)(\d{1,2})$/i);
    return r ? +r[1] : null;
  }
  function qt(e) {
    const t = String(e || "").trim();
    return (
      {
        Ended: "Ended",
        "Returning Series": "Continuing",
        "In Production": "Continuing",
        Planned: "Upcoming",
        Canceled: "Ended",
        Cancelled: "Ended",
      }[t] || t
    );
  }
  function Wt(e, t) {
    return (t || []).map((t) => ({
      kind: e,
      tmdbId: String(t.id),
      title: t.name || t.title || "",
      original: t.original_name || t.original_title || "",
      year: (t.first_air_date || t.release_date || "").slice(0, 4),
      overview: t.overview || "",
      popularity: t.popularity || 0,
      vote: t.vote_average ? Number(t.vote_average).toFixed(1) : "",
    }));
  }
  async function Gt(e, t) {
    const n = "movie" === e.kind ? "movie" : "tv",
      r = (t || zt(e.name)).trim();
    if (!r) return { ok: !1, error: "剧名为空，无法搜索" };
    const o = "movie" === n ? "/search/movie" : "/search/tv",
      a = { query: r, include_adult: "false", page: "1" };
    let s = await Ht(
      o,
      Object.assign(
        {},
        a,
        e.year && !t
          ? {
              ["movie" === n ? "primary_release_year" : "first_air_date_year"]:
                e.year,
            }
          : {},
      ),
    );
    if (!s.ok) return s;
    let i = (s.data && s.data.results) || [];
    if (!i.length && e.year && !t) {
      const e = await Ht(o, a);
      if (!e.ok) return e;
      i = (e.data && e.data.results) || [];
    }
    return { ok: !0, list: Wt(n, i), query: r };
  }
  function Jt(e, t) {
    const n = jt(e.name),
      r = jt(zt(e.name));
    let o = null,
      a = 0;
    for (const s of t || []) {
      let t = 0;
      for (const e of [s.title, s.original]) {
        const o = jt(e);
        o &&
          (o === n || o === r
            ? (t = Math.max(t, 100))
            : o.length >= 3 &&
                n.length >= 3 &&
                (o.startsWith(n) || n.startsWith(o))
              ? (t = Math.max(t, 80))
              : o.length >= 3 &&
                n.length >= 3 &&
                (o.indexOf(n) >= 0 || n.indexOf(o) >= 0) &&
                (t = Math.max(t, 60)));
      }
      (e.year && s.year && Math.abs(+e.year - +s.year) <= 1 && (t += 5),
        (!o ||
          t > a ||
          (t === a && (s.popularity || 0) > (o.popularity || 0))) &&
          ((o = s), (a = t)));
    }
    return a >= 60 ? o : null;
  }
  async function Vt(e) {
    if (!Ut()) return { ok: !1, error: "未配置 TMDB Key" };
    const t = await Gt(e);
    if (!t.ok) return t;
    const n = Jt(e, t.list);
    return n
      ? ((e.tmdbId = n.tmdbId),
        (e.matched = n),
        (e.matchNote = ""),
        { ok: !0, matched: n, list: t.list })
      : ((e.tmdbId = ""),
        (e.matched = null),
        (e.matchNote = "未自动匹配，可手动填 TMDB ID，或直接生成本地 NFO"),
        { ok: !1, list: t.list, error: "没有足够相似的条目" });
  }
  function Yt(e) {
    return !(!e || !e.is_dir);
  }
  function Xt(e) {
    return !(!e || e.is_dir || !/\.strm$/i.test(e.name));
  }
  function Zt(e) {
    return e.map((e) => {
      const t = de(e.name);
      return {
        file: e,
        name: e.name,
        base: B(e.name),
        ep: t.eps[0] || 0,
        season: t.season || "",
      };
    });
  }
  async function Qt(e, t) {
    const n = e.split("/").filter(Boolean).pop() || "",
      r = await _e(e, !1);
    if (!r.ok) return { error: Ce(r), dir: e, name: n };
    const o = r.items.filter((e) => !e.is_dir),
      a = r.items.filter((e) => e.is_dir && !Et.test(e.name)),
      s = new Set(o.map((e) => e.name.toLowerCase())),
      i = o.filter(Xt),
      l = a.filter((e) => xt.test(e.name.trim())),
      c = {
        tvshow: s.has("tvshow.nfo"),
        movie: s.has("movie.nfo"),
        poster:
          s.has("poster.jpg") || s.has("folder.jpg") || s.has("cover.jpg"),
        fanart: s.has("fanart.jpg") || s.has("backdrop.jpg"),
      };
    if (l.length) {
      const t = [],
        r = l.slice().sort((e, t) => {
          const n = Kt(e.name),
            r = Kt(t.name);
          return (null === n ? 99 : n) - (null === r ? 99 : r);
        });
      for (const n of r) {
        const r = P(e, n.name),
          o = await _e(r, !1);
        if (!o.ok) {
          t.push({
            number: Kt(n.name) || 0,
            dir: r,
            name: n.name,
            strms: [],
            nfo: !1,
            poster: !1,
            nfoSet: new Set(),
            error: Ce(o),
          });
          continue;
        }
        const a = o.items.filter((e) => !e.is_dir),
          s = new Set(a.map((e) => e.name.toLowerCase())),
          i = Zt(a.filter(Xt)).sort(
            (e, t) =>
              (e.ep || 9999) - (t.ep || 9999) || e.name.localeCompare(t.name),
          );
        let l = Kt(n.name);
        (null == l && (l = i[0] && i[0].season ? +i[0].season : 1),
          t.push({
            number: l,
            dir: r,
            name: n.name,
            strms: i,
            nfo: s.has("season.nfo"),
            poster: s.has("poster.jpg") || s.has("folder.jpg"),
            nfoSet: s,
            error: "",
          }));
      }
      return { kind: "tv", dir: e, name: n, seasons: t, exists: c, flat: !1 };
    }
    if (i.length) {
      const r = Zt(i),
        o = r.some((e) => e.ep > 0);
      if ("movie" === t || (1 === i.length && !o))
        return {
          kind: "movie",
          dir: e,
          name: n,
          movies: r,
          exists: c,
          flat: !1,
        };
      let a = Kt(n);
      (null == a && (a = ue(e)),
        !a && r[0] && r[0].season && (a = +r[0].season),
        a || (a = 1));
      let l = 0,
        d = Math.max(0, ...r.map((e) => e.ep)) + 1;
      return (
        r.forEach((e) => {
          e.ep || ((e.ep = d++), (e.auto = !0), l++);
        }),
        r.sort(
          (e, t) =>
            (e.ep || 9999) - (t.ep || 9999) || e.name.localeCompare(t.name),
        ),
        {
          kind: "tv",
          dir: e,
          name: n,
          seasons: [
            {
              number: a,
              dir: e,
              name: "",
              strms: r,
              nfo: s.has("season.nfo"),
              poster: c.poster,
              nfoSet: s,
              error: "",
            },
          ],
          exists: c,
          flat: !0,
          auto: l,
        }
      );
    }
    return { kind: "unknown", dir: e, name: n, exists: c };
  }
  function en(e) {
    const t = e.map((e) => O(e)).filter((e) => e && "/" !== e);
    if (!t.length) return "/";
    const n = (e) => e.split("/").filter(Boolean);
    let r = n(t[0]);
    for (const e of t.slice(1)) {
      const t = n(e);
      let o = 0;
      for (; o < r.length && o < t.length && r[o] === t[o]; ) o++;
      r = r.slice(0, o);
    }
    return r.length ? "/" + r.join("/") : "/";
  }
  function tn(e, t, n, r) {
    if (t.error) return { error: t.dir + "：" + t.error };
    if ("tv" === t.kind && t.seasons.length) {
      const n = {
          kind: "tv",
          dir: t.dir,
          name: t.name,
          display: zt(t.name) || t.name,
          year: $t(t.name),
          seasons: t.seasons,
          exists: t.exists,
          flat: !!t.flat,
          auto: t.auto || 0,
          selected: !0,
          tmdbId: "",
          matched: null,
          matchNote: "",
          done: !1,
          error: "",
          relBase: r || wt.root,
        },
        o = t.seasons.reduce((e, t) => e + (t.strms ? t.strms.length : 0), 0);
      return (
        t.seasons.some((e) => e.error) && (n.error = "部分季目录读取失败"),
        (n.epCount = o),
        e.push(n),
        null
      );
    }
    return "movie" === t.kind
      ? (e.push({
          kind: "movie",
          dir: t.dir,
          name: t.name,
          display: zt(t.name) || t.name,
          year: $t(t.name),
          movies: t.movies || [],
          exists: t.exists,
          selected: !0,
          tmdbId: "",
          matched: null,
          matchNote: "",
          done: !1,
          error: "",
          relBase: r || wt.root,
          epCount: t.movies ? t.movies.length : 0,
        }),
        null)
      : { unknown: !0 };
  }
  function nn() {
    const e = t("metaRootBox");
    if (!e) return;
    const n = O(t("libDir").value);
    if (!n || "/" === n)
      return (
        (e.innerHTML =
          '<div class="hint" style="margin:0">还没选媒体库——点上方按钮选到「剧集」根目录（例如 /媒体库/剧集）。</div>'),
        void (t("metaScanBtn").style.display = "none")
      );
    ((e.innerHTML =
      '<div class="row"><span>媒体库目录</span><b>' +
      N(n) +
      '</b></div><div class="row"><span>剧集根 / 电影根</span><b>自动识别（含「剧集」「电影」子目录时一起扫描）</b></div>'),
      (t("metaScanBtn").style.display = ""));
  }
  async function rn() {
    if (!Ut())
      return void K("metaLog", "未配置 TMDB Key，无法自动匹配", "warn-t");
    if (wt.matching) return;
    wt.matching = !0;
    const e = wt.shows.filter((e) => !e.tmdbId);
    K("metaLog", "匹配 " + e.length + " 部 …");
    let t = 0;
    try {
      (await Qe(
        e,
        3,
        async (e) => {
          const n = await Vt(e);
          n.ok
            ? (t++,
              K(
                "metaLog",
                "  ✓ " +
                  e.display +
                  " → TMDB #" +
                  e.tmdbId +
                  " " +
                  n.matched.title +
                  (n.matched.year ? " (" + n.matched.year + ")" : ""),
                "ok-t",
              ))
            : K(
                "metaLog",
                "  · " +
                  e.display +
                  "：" +
                  (n.error || "未匹配") +
                  (e.matchNote ? "（" + e.matchNote + "）" : ""),
                "warn-t",
              );
        },
        (e, t) => ee("metaProgress", e, t),
      ),
        K("metaLog", "✓ 自动匹配完成：" + t + "/" + e.length + " 部"));
    } finally {
      ((wt.matching = !1), an());
    }
  }
  function on() {
    const e = t("metaList");
    if (!e) return;
    const n = wt.shows.length,
      r = wt.shows.filter((e) => e.selected).length;
    t("metaCount").textContent = "已选 " + r + " / 共 " + n + " 部";
    const o = t("metaRunBtn");
    ((o.textContent = "开始刮削（" + r + " 部）"),
      (o.disabled = !r || wt.scraping),
      (t("metaAll").checked = r === n && !!n),
      e.querySelectorAll(".mrow").forEach((e) => {
        const t = wt.shows[+e.getAttribute("data-i")];
        e.classList.toggle("off", !t.selected);
        const n = e.querySelector('[data-act="sel"]');
        n && (n.checked = !!t.selected);
      }));
  }
  function an() {
    const e = t("metaList");
    e &&
      ((e.innerHTML = wt.shows
        .map(
          (e, t) =>
            '<div class="mrow' +
            (e.selected ? "" : " off") +
            '" data-i="' +
            t +
            '"><label class="mchk"><input type="checkbox" data-act="sel" aria-label="选择 ' +
            N(e.display) +
            '"' +
            (e.selected ? " checked" : "") +
            '></label><div class="minfo"><div class="mname">' +
            N(e.display) +
            '<span class="mtag">' +
            ("movie" === e.kind ? "电影" : "剧集") +
            " · " +
            (function (e) {
              return "movie" === e.kind
                ? e.movies && e.movies.length
                  ? e.movies.length + " 个 strm"
                  : "电影目录"
                : e.seasons.length +
                    " 季 · " +
                    e.epCount +
                    " 集" +
                    (e.flat ? "（平铺）" : "") +
                    (e.auto ? "（" + e.auto + " 集自动编号）" : "");
            })(e) +
            "</span>" +
            (e.done ? '<span class="mtag good">已写入</span>' : "") +
            '</div><div class="mline">' +
            (function (e) {
              if (e.matched) {
                const t = e.matched;
                return (
                  '<span class="good">TMDB #' +
                  N(e.tmdbId) +
                  " · " +
                  N(t.title) +
                  (t.year ? " (" + N(t.year) + ")" : "") +
                  (t.vote ? " · ★" + N(t.vote) : "") +
                  "</span>"
                );
              }
              return e.tmdbId
                ? '<span class="warn-t">TMDB #' +
                    N(e.tmdbId) +
                    "（未校验，写入时会读取详情）</span>"
                : '<span class="bad">未匹配</span>：只写规范 NFO + 本地封面' +
                    (e.matchNote ? "（" + N(e.matchNote) + "）" : "");
            })(e) +
            '</div><div class="mline">' +
            (function (e) {
              const t = [],
                n = "movie" === e.kind ? e.exists.movie : e.exists.tvshow;
              return (
                t.push(
                  n
                    ? '<span class="good">已有 ' +
                        ("movie" === e.kind ? "movie.nfo" : "tvshow.nfo") +
                        "</span>"
                    : '<span class="bad">无 NFO</span>',
                ),
                t.push(
                  e.exists.poster
                    ? '<span class="good">已有封面</span>'
                    : '<span class="bad">无封面</span>',
                ),
                e.exists.fanart &&
                  t.push('<span class="good">已有背景图</span>'),
                e.error &&
                  t.push('<span class="bad">' + N(e.error) + "</span>"),
                t.join(" · ")
              );
            })(e) +
            '</div></div><div class="mact"><input class="mid" data-act="id" type="text" inputmode="numeric" placeholder="TMDB ID" value="' +
            N(e.tmdbId || "") +
            '" aria-label="TMDB ID"><button class="mbtn2" data-act="search" type="button">搜索 / 换一个</button></div></div>',
        )
        .join("")),
      on());
  }
  async function sn(t) {
    if (!t) return { ok: !1, error: "无图片地址" };
    const n = new AbortController(),
      r = setTimeout(() => n.abort(), e.TIMEOUT_FETCH);
    try {
      const e = await fetch(t, {
        signal: n.signal,
        mode: "cors",
        cache: "force-cache",
      });
      if (!e.ok) return { ok: !1, error: "HTTP " + e.status };
      const r = new Uint8Array(await e.arrayBuffer());
      return r.length < 1e3
        ? { ok: !1, error: "图片内容为空" }
        : { ok: !0, buf: r };
    } catch (e) {
      return {
        ok: !1,
        error:
          "AbortError" === e.name
            ? "下载超时"
            : "图片下载失败（跨域/被墙）：" + (e.message || "Failed to fetch"),
      };
    } finally {
      clearTimeout(r);
    }
  }
  function ln(e, t) {
    const n = O(e),
      r = O(t || wt.root || "/");
    return r && "/" !== r && 0 === n.indexOf(r + "/")
      ? n.slice(r.length + 1)
      : n.replace(/^\//, "");
  }
  function cn(e, t, n, r) {
    return { path: O(e), rel: ln(e, r), data: t, type: n };
  }
  async function dn(e) {
    const n = t("metaOverwrite").checked,
      r = t("metaImages").checked,
      o = t("metaEpNfo").checked,
      a = t("metaCover").checked,
      s = [];
    let i = null,
      l = [];
    const c = String(e.tmdbId || "").replace(/\D/g, "");
    if (c) {
      const t = ("movie" === e.kind ? "/movie/" : "/tv/") + c,
        n = await Ht(t, { append_to_response: "external_ids,credits" });
      if (!n.ok)
        return { ok: !1, error: "TMDB #" + c + " 读取失败：" + n.error };
      i = n.data;
    }
    const d = i
        ? (function (e, t, n) {
            const r = "tv" === n,
              o = e.external_ids || {},
              a = (r ? e.first_air_date : e.release_date) || "",
              s = r
                ? []
                : ((e.credits && e.credits.crew) || [])
                    .filter((e) => "Director" === e.job)
                    .map((e) => e.name);
            return {
              tmdbId: String(t.tmdbId || e.id || ""),
              title: (r ? e.name : e.title) || zt(t.name),
              originalTitle: (r ? e.original_name : e.original_title) || "",
              overview: e.overview || "",
              tagline: e.tagline || "",
              rating: e.vote_average ? Number(e.vote_average).toFixed(1) : "",
              votes: e.vote_count || "",
              year: a.slice(0, 4),
              premiered: a,
              runtime: r
                ? (e.episode_run_time && e.episode_run_time[0]) || ""
                : e.runtime || "",
              genres: (e.genres || []).map((e) => e.name).filter(Boolean),
              studios: ((r ? e.networks : e.production_companies) || [])
                .map((e) => e.name)
                .filter(Boolean),
              countries: (e.production_countries || [])
                .map((e) => e.name)
                .filter(Boolean),
              status: r ? qt(e.status) : "",
              imdbId: o.imdb_id || "",
              tvdbId: (r && o.tvdb_id) || "",
              directors: s,
              actors:
                ((i = e.credits),
                ((i && i.cast) || [])
                  .slice(0, 15)
                  .map((e) => ({
                    name: e.name || "",
                    role: e.character || "",
                    thumb: e.profile_path ? Ft("w185", e.profile_path) : "",
                  }))
                  .filter((e) => e.name)),
              posterPath: e.poster_path || "",
              fanartPath: e.backdrop_path || "",
              posterUrl: e.poster_path ? Ft("w500", e.poster_path) : "",
              fanartUrl: e.backdrop_path ? Ft("w1280", e.backdrop_path) : "",
            };
            var i;
          })(i, e, e.kind)
        : (function (e) {
            return {
              tmdbId: "",
              title: zt(e.name) || e.name,
              originalTitle: "",
              overview: "",
              tagline: "",
              rating: "",
              votes: "",
              year: e.year || "",
              premiered: "",
              runtime: "",
              genres: [],
              studios: [],
              countries: [],
              status: "",
              actors: [],
              posterUrl: "",
              fanartUrl: "",
              posterPath: "",
              fanartPath: "",
            };
          })(e),
      u = [];
    let m = null,
      f = null;
    if (r && (d.posterUrl || d.fanartUrl)) {
      const [e, t] = await Promise.all([
        d.posterUrl ? sn(d.posterUrl) : null,
        d.fanartUrl ? sn(d.fanartUrl) : null,
      ]);
      (e && (e.ok ? (m = e.buf) : s.push("海报：" + e.error)),
        t && (t.ok ? (f = t.buf) : s.push("背景图：" + t.error)));
    }
    if (a && !m && !e.exists.poster) {
      const t = await (async function (e, t, n, r) {
        ((n = n || 600), (r = r || 900));
        const o = document.createElement("canvas");
        ((o.width = n), (o.height = r));
        const a = o.getContext("2d"),
          s =
            (function (e) {
              let t = 0;
              for (let n = 0; n < String(e).length; n++)
                t = (31 * t + String(e).charCodeAt(n)) >>> 0;
              return t;
            })(e) % 360,
          i = a.createLinearGradient(0, 0, n, r);
        (i.addColorStop(0, "hsl(" + s + ",46%,26%)"),
          i.addColorStop(0.55, "hsl(" + ((s + 28) % 360) + ",52%,15%)"),
          i.addColorStop(1, "hsl(" + ((s + 60) % 360) + ",40%,9%)"),
          (a.fillStyle = i),
          a.fillRect(0, 0, n, r),
          a.save(),
          (a.globalAlpha = 0.13),
          (a.strokeStyle = "#fff"),
          (a.lineWidth = 2));
        for (let e = 0; e < 4; e++)
          (a.beginPath(),
            a.arc(0.82 * n, 0.18 * r, n * (0.16 + 0.09 * e), 0, 2 * Math.PI),
            a.stroke());
        a.restore();
        const l = a.createLinearGradient(0, 0.45 * r, 0, r);
        (l.addColorStop(0, "rgba(0,0,0,0)"),
          l.addColorStop(1, "rgba(0,0,0,.82)"),
          (a.fillStyle = l),
          a.fillRect(0, 0.45 * r, n, 0.55 * r));
        const c = Array.from(String(e || "")),
          d = [];
        let u = "";
        for (const e of c) ((u += e), u.length >= 8 && (d.push(u), (u = "")));
        (u && d.push(u),
          d.length > 3 &&
            ((d.length = 3), (d[2] = d[2].slice(0, Math.max(1, 7)) + "…")));
        let m = d.length <= 1 ? 64 : 2 === d.length ? 56 : 48;
        (c.length <= 4 && (m = 76),
          (a.textAlign = "center"),
          (a.fillStyle = "#fff"),
          (a.font =
            "700 " +
            m +
            'px "PingFang SC","Microsoft YaHei","Noto Sans CJK SC",sans-serif'),
          (a.shadowColor = "rgba(0,0,0,.45)"),
          (a.shadowBlur = 18));
        const f = 0.62 * r - (d.length - 1) * (0.62 * m);
        (d.forEach((e, t) => a.fillText(e, n / 2, f + t * m * 1.22)),
          t &&
            ((a.shadowBlur = 8),
            (a.font = '500 28px "PingFang SC","Microsoft YaHei",sans-serif'),
            (a.fillStyle = "rgba(255,255,255,.78)"),
            a.fillText(String(t), n / 2, 0.62 * r + d.length * m * 0.62 + 34)),
          (a.shadowBlur = 0),
          (a.textAlign = "left"),
          (a.font = '600 20px "PingFang SC",sans-serif'),
          (a.fillStyle = "rgba(255,255,255,.5)"),
          a.fillText("本地封面 · 可替换", 24, 40));
        try {
          const e = await new Promise((e) => o.toBlob(e, "image/jpeg", 0.9));
          return e
            ? { ok: !0, buf: new Uint8Array(await e.arrayBuffer()) }
            : { ok: !1, error: "封面生成失败" };
        } catch (e) {
          return { ok: !1, error: "封面生成失败：" + e.message };
        }
      })(
        d.title || e.display,
        [d.year, "tv" === e.kind ? "剧集" : "电影"].filter(Boolean).join(" · "),
        600,
        900,
      );
      t.ok ? (m = t.buf) : s.push("本地封面：" + t.error);
    }
    ((d.posterNfo = m ? "" : d.posterUrl),
      (d.fanartNfo = f ? "" : d.fanartUrl));
    const p = "movie" === e.kind ? "movie.nfo" : "tvshow.nfo",
      h = "movie" === e.kind ? e.exists.movie : e.exists.tvshow;
    if (
      ((!n && h) ||
        u.push(
          cn(P(e.dir, p), "movie" === e.kind ? Mt(d) : At(d), "nfo", e.relBase),
        ),
      !m ||
        (!n && e.exists.poster) ||
        u.push(cn(P(e.dir, "poster.jpg"), m, "img", e.relBase)),
      !f ||
        (!n && e.exists.fanart) ||
        u.push(cn(P(e.dir, "fanart.jpg"), f, "img", e.relBase)),
      "tv" === e.kind)
    ) {
      if (c && o)
        for (const t of e.seasons) {
          if (!t.strms.length) continue;
          const e = await Ht("/tv/" + c + "/season/" + (t.number || 1), {});
          e.ok
            ? l.push({ number: t.number || 1, data: e.data })
            : s.push("S" + M(t.number || 1) + " 集详情：" + e.error);
        }
      e.seasons.forEach((t, a) => {
        const s = l.find((e) => e.number === (t.number || 1)),
          i =
            s && s.data && s.data.poster_path
              ? Ft("w500", s.data.poster_path)
              : "",
          c = P(t.dir, "season.nfo");
        if (
          ((!n && t.nfo) ||
            u.push(
              cn(
                c,
                Ot(
                  t.number || 1,
                  s && s.data ? s.data.name : "",
                  s && s.data ? s.data.overview : "",
                  i,
                ),
                "nfo",
                e.relBase,
              ),
            ),
          r && i && (n || !t.poster))
        ) {
          const e = Ft("w500", s.data.poster_path);
          t.__posterUrl = e;
        }
        o &&
          t.strms.forEach((o) => {
            const a =
                s && s.data && s.data.episodes
                  ? s.data.episodes.find((e) => e.episode_number === o.ep)
                  : null,
              i = ((l = o.base), A(String(l || "").slice(0, 150)) + ".nfo");
            var l;
            if (!n && t.nfoSet && t.nfoSet.has(i.toLowerCase())) return;
            const c = {
              season: t.number || 1,
              episode: o.ep || 1,
              title: (a && a.name) || "第 " + (o.ep || 1) + " 集",
              overview: (a && a.overview) || "",
              aired: (a && a.air_date) || "",
              runtime: (a && a.runtime) || "",
              rating:
                a && a.vote_average ? Number(a.vote_average).toFixed(1) : "",
              stillNfo: r && a && a.still_path ? Ft("w300", a.still_path) : "",
              directors: ((a && a.crew) || [])
                .filter((e) => "Director" === e.job)
                .map((e) => e.name)
                .slice(0, 3),
              writers: ((a && a.crew) || [])
                .filter((e) => /Writer|Screenplay|Story/i.test(e.job || ""))
                .map((e) => e.name)
                .slice(0, 3),
              tmdbId: a && a.id ? String(a.id) : "",
            };
            u.push(cn(P(t.dir, i), Pt(d, c), "nfo", e.relBase));
          });
      });
    }
    if ("tv" === e.kind && r) {
      const t = e.seasons.filter((e) => e.__posterUrl),
        n = await Qe(t, 3, (e) => sn(e.__posterUrl));
      t.forEach((t, r) => {
        const o = n[r] || { ok: !1, error: "未知错误" };
        (o.ok
          ? (u.push(cn(P(t.dir, "poster.jpg"), o.buf, "img", e.relBase)),
            u.push(
              cn(
                P(e.dir, "season" + M(t.number || 1) + "-poster.jpg"),
                o.buf,
                "img",
                e.relBase,
              ),
            ),
            (t.poster = !0))
          : s.push("S" + M(t.number || 1) + " 海报：" + o.error),
          delete t.__posterUrl);
      });
    }
    return { ok: !0, files: u, notes: s, m: d, matched: !!i };
  }
  async function un(e, n) {
    const r = W(),
      o = [...new Set(e.map((e) => e.path.replace(/\/[^/]*$/, "")) || [])];
    for (const t of o)
      if (!(await Se(t)))
        return {
          ok: 0,
          fail: e.length,
          msg: "目标目录无法创建或无写权限：" + t,
        };
    (K(n, "上传 " + e.length + " 个文件（并发 " + r + "）…"),
      (t("metaProgress").style.display = "block"),
      (t("metaProgress").querySelector("i").style.width = "0%"));
    const a = await Qe(
      e,
      r,
      async (e) => {
        const t = await Ee(e.path, e.data);
        return t.ok ? { ok: !0 } : { ok: !1, error: e.rel + "：" + t.error };
      },
      (e, t) => ee("metaProgress", e, t),
    );
    t("metaProgress").style.display = "none";
    const s = a.filter((e) => e && !e.ok);
    return {
      ok: e.length - s.length,
      fail: s.length,
      msg: s
        .slice(0, 3)
        .map((e) => e.error)
        .join("；"),
      failList: s.map((e) => e.error),
    };
  }
  async function mn(e, t) {
    let n = 0,
      r = 0;
    const o = [];
    for (const a of t) {
      const t = String(a.rel || "").replace(/^\/+|\/+$/g, ""),
        s = t.split("/").filter(Boolean);
      if (s.length)
        try {
          let t = e;
          for (let e = 0; e < s.length - 1; e++)
            t = await t.getDirectoryHandle(s[e], { create: !0 });
          const r = await t.getFileHandle(s[s.length - 1], { create: !0 }),
            o = await r.createWritable();
          (await o.write(a.data), await o.close(), n++);
        } catch (e) {
          (r++,
            o.length < 3 &&
              o.push(t + "：" + (e.message || e.name || "写入失败")));
        }
      else r++;
    }
    return { ok: n, fail: r, msg: o.join("；") };
  }
  ((t("metaPickBtn").onclick = () => Fe("lib")),
    (t("metaScanBtn").onclick = () =>
      (async function () {
        if (D) return { ok: !1, code: "BUSY" };
        const e = O(t("libDir").value);
        if (!e || "/" === e)
          return (
            re(
              "warn",
              "先选媒体库目录",
              "点「选择媒体库剧集目录」，选到媒体库里的剧集根目录（例如 /媒体库/剧集）。",
              [
                { label: "去选择", style: "primary", fn: () => Fe("lib") },
                { label: "知道了" },
              ],
            ),
            { ok: !1, code: "NO_DIR" }
          );
        ((D = !0), (wt.scanning = !0));
        const n = t("metaScanBtn");
        ((n.disabled = !0),
          (n.textContent = "正在扫描…"),
          (t("metaResult").style.display = "none"),
          (t("metaDl").innerHTML = ""),
          Z("metaAlert"),
          (t("metaLog").innerHTML = ""),
          ee("metaProgress", 0, 1));
        try {
          if ((K("metaLog", "① 连接 OpenList …"), !(await ye()).ok))
            return (ke(), { ok: !1, code: "CONN_FAIL" });
          K("metaLog", "② 扫描媒体库：" + e);
          const n = await (async function (e) {
            const t = await _e(e, !1);
            if (!t.ok) return { ok: !1, error: Ce(t) };
            const n = t.items.filter((e) => Yt(e) && !Et.test(e.name)),
              r = n.find((e) => _t.test(e.name)),
              o = n.find((e) => Dt.test(e.name)),
              a = [];
            (r && a.push({ path: P(e, r.name), category: "tv" }),
              o && a.push({ path: P(e, o.name), category: "movie" }),
              a.length || a.push({ path: e, category: "auto" }));
            const s = e.split("/").filter(Boolean).pop() || "";
            if (!o && _t.test(s)) {
              const t = e.replace(/\/[^/]*$/, "") || "/",
                n = await _e(t, !1);
              if (n.ok) {
                const e = n.items.find((e) => Yt(e) && Dt.test(e.name));
                e && a.push({ path: P(t, e.name), category: "movie" });
              }
            }
            return { ok: !0, roots: a };
          })(e);
          if (!n.ok)
            return (
              re(
                "err",
                "读取媒体库失败",
                "接口错误：" +
                  N(n.error) +
                  '<ul><li>确认目录路径正确</li><li>勾选"强制刷新目录列表"后重试</li></ul>',
                [{ label: "知道了" }],
              ),
              K("metaLog", "读取失败：" + n.error, "err-t"),
              { ok: !1, code: "READ_FAIL" }
            );
          ((wt.root = e), (wt.roots = n.roots), (wt.shows = []));
          const r = en(n.roots.map((e) => e.path));
          n.roots.forEach((e) => {
            e.relBase = n.roots.length > 1 ? r : e.path;
          });
          const o = [];
          for (const e of n.roots) {
            K(
              "metaLog",
              "  · 扫描 " +
                ("movie" === e.category
                  ? "电影"
                  : "tv" === e.category
                    ? "剧集"
                    : "目录") +
                "：" +
                e.path,
            );
            const t = await _e(e.path, !1);
            if (!t.ok) {
              (K("metaLog", "    ✕ 读取失败：" + Ce(t), "err-t"),
                o.push(e.path + "（" + Ce(t) + "）"));
              continue;
            }
            const n = t.items.filter(
                (e) => Yt(e) && !Et.test(e.name) && !xt.test(e.name.trim()),
              ),
              r = [];
            if (
              ((
                await Qe(
                  n,
                  4,
                  async (t) => Qt(P(e.path, t.name), e.category),
                  (e, t) => {
                    (ee("metaProgress", e, t),
                      t > 20 &&
                        e % 20 == 0 &&
                        K("metaLog", "    已检查 " + e + "/" + t + " 个目录"));
                  },
                )
              ).forEach((t, n) => {
                if (!t || t.error)
                  return void o.push(
                    t && t.dir ? t.dir + "（" + t.error + "）" : "",
                  );
                const a = tn(wt.shows, t, e.category, e.relBase);
                a && a.unknown && r.push({ dir: t.dir, name: t.name });
              }),
              r.length)
            ) {
              K("metaLog", "  · 展开 " + r.length + " 个合集目录 …");
              for (const t of r) {
                const n = await _e(t.dir, !1);
                if (n.ok)
                  for (const r of n.items.filter(
                    (e) => Yt(e) && !Et.test(e.name),
                  )) {
                    const n = await Qt(P(t.dir, r.name), e.category),
                      a = n.error
                        ? { error: n.dir + "：" + n.error }
                        : tn(wt.shows, n, e.category, e.relBase);
                    a && a.error && o.push(a.error);
                  }
              }
            }
          }
          wt.shows.forEach((e) => {
            e.display = e.display || e.name;
          });
          const a = new Set();
          return (
            (wt.shows = wt.shows.filter((e) => {
              const t = e.dir;
              return !a.has(t) && (a.add(t), !0);
            })),
            K(
              "metaLog",
              "✓ 找到 " +
                wt.shows.length +
                " 部影视（剧集 " +
                wt.shows.filter((e) => "tv" === e.kind).length +
                "，电影 " +
                wt.shows.filter((e) => "movie" === e.kind).length +
                "）",
              "ok-t",
            ),
            wt.shows.length
              ? ((t("metaResult").style.display = ""),
                (t("metaResultDesc").textContent =
                  "共 " +
                  wt.shows.length +
                  " 部。下面确认匹配结果：填了 TMDB ID 的会刮完整简介与官方图；留空的只写规范 NFO + 本地封面。"),
                an(),
                t("metaResult").scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                }),
                Ut()
                  ? (K("metaLog", "③ 自动匹配 TMDB（并发 3）…"), await rn())
                  : K(
                      "metaLog",
                      "③ 未填 TMDB API Key：跳过联网匹配，将按文件名生成规范 NFO，并生成本地标题封面",
                      "warn-t",
                    ),
                { ok: !0, count: wt.shows.length })
              : (re(
                  "info",
                  "没扫到可刮削的影视",
                  "这个目录里没有找到带 .strm 的剧集/电影目录。<ul><li>确认选的是「剧集」根目录，而不是单部剧或云盘根目录</li><li>先用「批量生成 strm」页生成 strm，再回来刮削</li></ul>",
                  [{ label: "知道了" }],
                ),
                { ok: !1, code: "EMPTY" })
          );
        } catch (e) {
          return (
            re("err", "扫描失败", "扫描媒体库时出错：" + N(e.message)),
            K("metaLog", "扫描失败：" + e.message, "err-t"),
            { ok: !1, code: "EXCEPTION", reason: e.message }
          );
        } finally {
          ((n.disabled = !1),
            (n.textContent = "扫描媒体库（剧集 + 电影）"),
            (wt.scanning = !1),
            (D = !1),
            ee("metaProgress", 1, 1));
        }
      })()),
    (t("metaRunBtn").onclick = () =>
      (async function () {
        if (D || wt.scraping) return;
        const e = wt.shows.filter((e) => e.selected);
        if (!e.length)
          return void re(
            "warn",
            "先勾选要刮削的条目",
            '列表里没有勾选任何剧集/电影。勾选需要的条目，或点上方"全选"。',
            [{ label: "知道了" }],
          );
        const n = t("metaUpload").checked;
        ((D = !0), (wt.scraping = !0), Xe("metaDl"));
        const r = t("metaRunBtn");
        ((r.disabled = !0),
          (r.textContent = "正在刮削…"),
          (t("metaLog").innerHTML = ""),
          ee("metaProgress", 0, 1));
        try {
          if (n && (K("metaLog", "① 连接 OpenList …"), !(await ye()).ok))
            return void ke();
          K("metaLog", "② 生成 NFO / 封面（" + e.length + " 部）…");
          const t = [],
            r = [],
            o = [],
            a = [];
          let s = 0;
          for (let n = 0; n < e.length; n++) {
            const i = e[n];
            K(
              "metaLog",
              "[" + (n + 1) + "/" + e.length + "] " + i.display + " …",
            );
            const l = await dn(i);
            l.ok
              ? (i.tmdbId || s++,
                (l.notes || []).forEach((e) => {
                  o.push(i.display + "：" + e);
                }),
                l.files.forEach((e) => t.push(e)),
                a.push(i),
                K(
                  "metaLog",
                  "  ✓ " +
                    l.files.filter((e) => "nfo" === e.type).length +
                    " 个 NFO，" +
                    l.files.filter((e) => "img" === e.type).length +
                    " 张图" +
                    (l.notes && l.notes.length
                      ? "（提示 " + l.notes.length + " 条）"
                      : ""),
                  "ok-t",
                ),
                (l.notes || []).forEach((e) =>
                  K("metaLog", "    · " + e, "warn-t"),
                ),
                ee("metaProgress", n + 1, e.length))
              : (r.push({ show: i, files: [], error: l.error }),
                K("metaLog", "  ✕ " + l.error, "err-t"));
          }
          if (!t.length)
            return (
              re(
                "info",
                "没有需要写入的元信息",
                "所有勾选条目都已有 NFO/封面（或详情读取失败）。<ul><li>要整库重刮，请勾选「覆盖已有 NFO / 海报」</li><li>失败原因看运行日志</li></ul>",
                [{ label: "知道了" }],
              ),
              { ok: !1, code: "EMPTY" }
            );
          let i = null;
          St &&
            (K(
              "metaLog",
              "③ 导出到文件夹「" + St.name + "」（" + t.length + " 个文件）…",
            ),
            (i = await mn(St, t)),
            i.ok &&
              K("metaLog", "  ✓ 已写入文件夹 " + i.ok + " 个文件", "ok-t"),
            i.fail &&
              K("metaLog", "  ✕ 失败 " + i.fail + " 个：" + i.msg, "err-t"));
          let l = null;
          n &&
            (K("metaLog", "④ 写入媒体库（" + t.length + " 个文件）…"),
            (l = await un(t, "metaLog")),
            l.fail &&
              K("metaLog", "  ✕ 失败 " + l.fail + " 个：" + l.msg, "err-t"),
            l.ok && K("metaLog", "  ✓ 已写入 " + l.ok + " 个文件", "ok-t"));
          const c = t.map((e) => ({ name: e.rel, content: e.data })),
            d =
              "元信息_" +
              A(1 === e.length ? e[0].display : "刮削" + a.length + "部").slice(
                0,
                80,
              ) +
              ".zip";
          try {
            Ze(
              Ve(c),
              d,
              "metaDl",
              "↓ 下载元信息包（" + t.length + " 个文件 / " + a.length + " 部）",
            );
          } catch (e) {
            K("metaLog", "打包 zip 失败：" + e.message, "err-t");
          }
          n &&
            l &&
            0 === l.fail &&
            a.forEach((e) => {
              return (
                (n = e),
                t
                  .filter((t) => 0 === t.path.indexOf(e.dir + "/"))
                  .forEach((e) => {
                    const t = e.path.toLowerCase();
                    ((t.endsWith("/tvshow.nfo") || t.endsWith("/movie.nfo")) &&
                      (e.path === P(n.dir, "tvshow.nfo") &&
                        (n.exists.tvshow = !0),
                      e.path === P(n.dir, "movie.nfo") &&
                        (n.exists.movie = !0)),
                      e.path === P(n.dir, "poster.jpg") &&
                        (n.exists.poster = !0),
                      e.path === P(n.dir, "fanart.jpg") &&
                        (n.exists.fanart = !0),
                      n.seasons &&
                        n.seasons.forEach((n) => {
                          (e.path === P(n.dir, "season.nfo") && (n.nfo = !0),
                            e.path === P(n.dir, "poster.jpg") &&
                              (n.poster = !0),
                            0 === e.path.indexOf(n.dir + "/") &&
                              t.endsWith(".nfo") &&
                              (n.nfoSet || (n.nfoSet = new Set()),
                              n.nfoSet.add(
                                e.path.slice(n.dir.length + 1).toLowerCase(),
                              )));
                        }));
                  }),
                void (n.done = !0)
              );
              var n;
            });
          const u = l && l.ok === t.length;
          let m =
            "zip 已生成（整库一个包），解压到你上面选的那个媒体库目录即可（如 /媒体库/剧集）。";
          return (
            u
              ? (m =
                  "已全部写入媒体库。到 Jellyfin / Emby 对剧集「刷新元数据 → 替换所有元数据（含图像）」即可看到封面与简介。")
              : i && i.ok
                ? (m =
                    "已写入文件夹「" +
                    St.name +
                    "」" +
                    i.ok +
                    " 个文件" +
                    (i.fail ? "（" + i.fail + " 个失败，zip 可兜底）" : "") +
                    "；请确认这个文件夹就是上面选的媒体库目录。")
                : n ||
                  (m =
                    "未勾选「直接写入媒体库」：整库已打成一个 zip，解压到你上面选的那个媒体库目录即可。"),
            s &&
              (m +=
                " 有 " +
                s +
                " 部未匹配 TMDB（仅写规范 NFO + 本地封面），可在列表里填 TMDB ID 后重刮。"),
            l &&
              l.fail &&
              (m +=
                " 上传失败 " +
                l.fail +
                " 个（" +
                l.msg +
                "），zip / 文件夹已保留兜底。"),
            X(
              "metaAlert",
              r.length || (l && l.fail) ? "warn" : "ok",
              "<b>刮削完成：" +
                a.length +
                " 部，" +
                t.length +
                " 个文件</b>NFO " +
                t.filter((e) => "nfo" === e.type).length +
                " 个 · 图片 " +
                t.filter((e) => "img" === e.type).length +
                " 张" +
                (r.length ? " · 失败 " + r.length + " 部" : "") +
                '<div class="hint" style="font-weight:400;margin-top:4px">' +
                N(m) +
                "</div>",
            ),
            re(
              r.length || (l && l.fail) ? "warn" : "ok",
              "✓ 刮削完成",
              "<b>" +
                a.length +
                " 部 · " +
                t.length +
                " 个文件</b><ul>" +
                a
                  .map(
                    (e) =>
                      "<li>" +
                      N(e.display) +
                      "：" +
                      ("movie" === e.kind ? "电影" : "剧集") +
                      "</li>",
                  )
                  .join("") +
                "</ul>" +
                (r.length
                  ? "<b>失败 " +
                    r.length +
                    " 部：</b><ul>" +
                    r
                      .slice(0, 5)
                      .map(
                        (e) =>
                          "<li>" +
                          N(e.show.display) +
                          "：" +
                          N(e.error) +
                          "</li>",
                      )
                      .join("") +
                    "</ul>"
                  : "") +
                '<div class="hint">' +
                N(m) +
                (o.length ? " 提示：" + N(o.slice(0, 3).join("；")) : "") +
                "</div>",
              [{ label: "知道了", style: "primary" }],
              0,
            ),
            K(
              "metaLog",
              "✓ 完成：NFO " +
                t.filter((e) => "nfo" === e.type).length +
                "，图片 " +
                t.filter((e) => "img" === e.type).length +
                (l ? "，上传成功 " + l.ok : "") +
                (l && l.fail ? "，失败 " + l.fail : ""),
              "ok-t",
            ),
            { ok: !0, count: t.length }
          );
        } catch (e) {
          return (
            re("err", "刮削失败", "刮削过程中出错：" + N(e.message)),
            K("metaLog", "刮削失败：" + e.message, "err-t"),
            { ok: !1, code: "EXCEPTION", reason: e.message }
          );
        } finally {
          ((r.disabled = !1),
            (wt.scraping = !1),
            (D = !1),
            ee("metaProgress", 1, 1),
            an());
        }
      })()),
    (t("metaDirBtn").onclick = async () => {
      if (window.showDirectoryPicker)
        try {
          const e = await window.showDirectoryPicker({ mode: "readwrite" });
          let n = "granted";
          if (
            (e.requestPermission &&
              (n = await e.requestPermission({ mode: "readwrite" })),
            "granted" !== n)
          )
            return void re(
              "warn",
              "没有写入权限",
              "请重新选择文件夹并允许写入。",
              [{ label: "知道了" }],
            );
          ((St = e),
            (t("metaDirNote").textContent =
              "已选择：" + e.name + "（刮削时直接写入此文件夹）"),
            K("metaLog", "已选择导出文件夹：" + e.name, "ok-t"));
        } catch (e) {
          if (e && "AbortError" === e.name) return;
          re("err", "选择文件夹失败", N((e && e.message) || String(e)));
        }
      else
        re(
          "warn",
          "当前浏览器不支持直接写入文件夹",
          "请用 Chrome / Edge 打开本工具；不选文件夹也可以，默认会生成一个 zip，解压即得同样的目录。",
          [{ label: "知道了" }],
        );
    }),
    (t("metaRescan").onclick = () => {
      ((t("metaResult").style.display = "none"), Fe("lib"));
    }),
    (t("metaRematch").onclick = async () => {
      if (!D)
        if (Ut()) {
          ((D = !0), (t("metaRematch").disabled = !0));
          try {
            await rn();
          } finally {
            ((D = !1), (t("metaRematch").disabled = !1), an());
          }
        } else
          re(
            "warn",
            "需要 TMDB API Key",
            '自动匹配需要 TMDB Key。展开「TMDB 设置」填写后重试；不填也可以直接生成本地 NFO。<div class="hint" style="margin:8px 0 0">' +
              n() +
              "</div>",
            [
              { label: "去填写", style: "primary", fn: () => Q("advMeta") },
              { label: "知道了" },
            ],
          );
    }),
    t("metaAll").addEventListener("change", (e) => {
      const t = e.target.checked;
      (wt.shows.forEach((e) => (e.selected = t)), on());
    }),
    t("metaList").addEventListener("change", (e) => {
      const t = e.target.closest(".mrow");
      if (!t) return;
      const n = wt.shows[+t.getAttribute("data-i")];
      if (!n) return;
      const r = e.target.getAttribute && e.target.getAttribute("data-act");
      if ("sel" === r) ((n.selected = e.target.checked), on());
      else if ("id" === r) {
        const t = String(e.target.value || "").replace(/\D/g, "");
        ((n.tmdbId = t),
          (n.matched = null),
          (n.matchNote = ""),
          t && K("metaLog", "已指定 " + n.display + " → TMDB #" + t, "ok-t"),
          an());
      }
    }),
    t("metaList").addEventListener("click", (e) => {
      const r = e.target.closest('[data-act="search"]');
      if (!r) return;
      const o = r.closest(".mrow");
      o &&
        (async function (e) {
          const r = wt.shows[e];
          if (!r) return;
          if (!Ut())
            return void re(
              "warn",
              "需要 TMDB API Key",
              '手动搜索要联网查 TMDB。请展开「TMDB 设置」填入 API Key（或只生成本地 NFO，直接点开始刮削）。<div class="hint" style="margin:8px 0 0">' +
                n() +
                "，登录后按「设置 → API → 创建 API Key」操作。</div>",
              [
                { label: "去填写", style: "primary", fn: () => Q("advMeta") },
                { label: "知道了" },
              ],
            );
          re(
            "info",
            "搜索「" + r.display + "」",
            '<div class="hint" style="margin:0 0 8px">点下面任一结果即采用它的 TMDB ID。</div><div id="metaPickBody" class="hint">搜索中…</div>',
            [{ label: "取消" }],
          );
          const o = async (e) => {
              const n = t("metaPickBody");
              if (!n) return;
              n.innerHTML = "搜索中…";
              const o = await Gt(r, e);
              o.ok
                ? o.list.length
                  ? ((n.innerHTML = o.list
                      .slice(0, 12)
                      .map(
                        (e) =>
                          '<button type="button" class="mbtn2" data-id="' +
                          N(e.tmdbId) +
                          '" style="display:block;width:100%;text-align:left;margin:5px 0;padding:8px 10px">' +
                          N(e.title) +
                          (e.year ? " (" + N(e.year) + ")" : "") +
                          (e.vote ? " ★" + N(e.vote) : "") +
                          '<span class="hint" style="display:block;font-weight:400">TMDB #' +
                          N(e.tmdbId) +
                          " · " +
                          N(e.original || "") +
                          "</span></button>",
                      )
                      .join("")),
                    n.querySelectorAll("[data-id]").forEach((e) => {
                      e.onclick = () => {
                        ((r.tmdbId = e.getAttribute("data-id")),
                          (r.matched =
                            o.list.find((e) => e.tmdbId === r.tmdbId) || null),
                          (r.matchNote = ""),
                          oe(),
                          an(),
                          K(
                            "metaLog",
                            "已手动指定 " + r.display + " → TMDB #" + r.tmdbId,
                            "ok-t",
                          ));
                      };
                    }))
                  : (n.innerHTML =
                      '<span class="warn-t">没有结果。可改用原名/英文名重试。</span>')
                : (n.innerHTML =
                    '<span class="warn-t">搜索失败：' + N(o.error) + "</span>");
            },
            a = t("dBody");
          if (a) {
            const e = document.createElement("div");
            ((e.style.cssText = "display:flex;gap:8px;margin-bottom:8px"),
              (e.innerHTML =
                '<input type="text" id="metaPickQ" style="flex:1" value="' +
                N(zt(r.name)) +
                '" aria-label="搜索关键词"><button type="button" class="mbtn2" id="metaPickGo" style="flex:none;padding:0 12px">搜</button>'),
              a.insertBefore(e, a.firstChild),
              (e.querySelector("#metaPickGo").onclick = () =>
                o(e.querySelector("#metaPickQ").value.trim())));
          }
          await o(zt(r.name));
        })(+o.getAttribute("data-i"));
    }),
    (t("verBadge").textContent = e.VERSION),
    (function () {
      try {
        const n = JSON.parse(localStorage.getItem(e.CFG_KEY) || "{}");
        let o = !1;
        (e.IDS.forEach((e) => {
          if (t(e))
            return r.indexOf(e) >= 0
              ? ((t(e).value = ""), void (e in n && (delete n[e], (o = !0))))
              : void ("string" == typeof n[e]
                  ? (t(e).value = n[e])
                  : "boolean" == typeof n[e] && (t(e).checked = n[e]));
        }),
          o && localStorage.setItem(e.CFG_KEY, JSON.stringify(n)));
      } catch (e) {
        Y("本机配置读取失败，已使用默认值");
      }
    })(),
    (t("libDir2").value = t("libDir").value),
    (t("baseUrl2").value = t("apiBase").value),
    syncRerunMode(),
    (function () {
      if (t("tmdbSession") && t("tmdbSession").checked) {
        t("tmdbKey") && (t("tmdbKey").value = "");
        t("tmdbToken") && (t("tmdbToken").value = "");
      }
      const b = t("buildCommit"),
        d = t("buildDate"),
        cap = t("capBadge");
      b &&
        ((b.textContent = e.BUILD_COMMIT || "local"),
        (b.href =
          "https://gitee.com/a-splash-of-water/yingyin-box/commit/" +
          encodeURIComponent(e.BUILD_COMMIT || "master")));
      d && (d.textContent = e.BUILD_DATE || "");
      cap &&
        (window.showDirectoryPicker && window.isSecureContext
          ? (cap.textContent = "本浏览器：支持直写目录")
          : window.showDirectoryPicker
            ? (cap.textContent = "本浏览器：将退回 zip 下载")
            : (cap.textContent = "本浏览器：只能 zip 下载"));
      setManifestStatus(
        "未导入：将按媒体库已有 strm 做增量对比。可导入上次 zip 里的 manifest.json，或从媒体库根目录直读；自动上传开启时最新 manifest 会写回根目录。",
      );
    })(),
    st(),
    at(),
    nn(),
    an(),
    ft(),
    (window.__avtool = {
      CONFIG: e,
      parseEpisode: de,
      guessMeta: me,
      parseHost: R,
      isPrivateHost: U,
      safeName: A,
      normalizeDir: O,
      joinPath: P,
      deriveTarget: ht,
      seasonFromDir: ue,
      getConcurrency: W,
      extractLang: pe,
      buildSubNameMap: he,
      decodeText: j,
      playUrl: tt,
      crc32: ze,
      buildZip: Ve,
      FIX_RULES: le,
      EP_ASSIGN: ie,
      buildStrmEntries: gt,
      isMediaVideo: Le,
      filterMediaVideos: Ie,
      metaNfoTv: At,
      metaNfoMovie: Mt,
      metaNfoSeason: Ot,
      metaNfoEpisode: Pt,
      metaNormTitle: jt,
      metaCleanTitle: zt,
      metaPickBest: Jt,
      metaSeasonNumberFromName: Kt,
      metaRelPath: ln,
      metaCommonParent: en,
      xmlEsc: Tt,
      metaWriteToFolder: mn,
      metaShowFromStrm: ct,
      metaBuildFiles: dn,
      META: wt,
    }),
    mt(),
    (function () {
      if (!window.showDirectoryPicker || !window.isSecureContext) {
        const e = t("metaDirBtn"),
          n = t("metaDirNote");
        (e && (e.style.display = "none"),
          n &&
            (n.textContent =
              "当前浏览器不支持直接写文件夹：会自动生成 zip，解压即可，其他功能不受影响。"));
      }
      !F && t("gbkWarn") && (t("gbkWarn").style.display = "");
    })(),
    document.addEventListener("click", (e) => {
      e.target &&
        e.target.closest &&
        e.target.closest("a.tmdb-help") &&
        (e.preventDefault(), J());
    }));
})();
