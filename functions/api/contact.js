const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 4;
const MAX_BODY_BYTES = 12 * 1024;
const buckets = new Map();

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    }
  });
}

function allowedHost(value) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (
      url.hostname === "yingyin-box-site.pages.dev" ||
      url.hostname.endsWith(".yingyin-box-site.pages.dev")
    );
  } catch (err) {
    return false;
  }
}

function limited(ip) {
  const now = Date.now();
  const key = ip || "unknown";
  const item = buckets.get(key);
  if (!item || now - item.start > WINDOW_MS) {
    buckets.set(key, { start: now, count: 1 });
    return false;
  }
  item.count += 1;
  if (buckets.size > 2000) {
    for (const [k, v] of buckets) {
      if (now - v.start > WINDOW_MS) buckets.delete(k);
    }
  }
  return item.count > MAX_PER_WINDOW;
}

function clean(value, max, multiline = false) {
  let text = String(value == null ? "" : value).replace(/\r\n?/g, "\n");
  text = multiline
    ? text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ")
    : text.replace(/[\u0000-\u001f\u007f]/g, " ");
  return text.trim().slice(0, max);
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const origin = request.headers.get("origin") || "";
  const referer = request.headers.get("referer") || "";
  if ((origin && !allowedHost(origin)) || (!origin && referer && !allowedHost(referer))) {
    return json({ ok: false, message: "请求来源不被允许。" }, 403);
  }

  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return json({ ok: false, message: "提交内容过长。" }, 413);
  }

  const ip = request.headers.get("cf-connecting-ip") || "";
  if (limited(ip)) {
    return json({ ok: false, message: "提交太频繁，请稍后再试。" }, 429);
  }

  if (!env.RESEND_API_KEY || !env.CONTACT_TO) {
    return json({ ok: false, message: "邮件服务尚未配置。" }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch (err) {
    return json({ ok: false, message: "提交格式不正确。" }, 400);
  }

  if (!body || typeof body !== "object") {
    return json({ ok: false, message: "提交格式不正确。" }, 400);
  }

  // Honeypot: silently accept bot submissions without sending anything.
  if (String(body.company || "").trim()) {
    return json({ ok: true });
  }

  const name = clean(body.name, 48);
  const reply = clean(body.reply, 160);
  const message = clean(body.message, 1200, true);

  if (message.length < 2) {
    return json({ ok: false, message: "反馈内容太短。" }, 400);
  }
  if (reply && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reply)) {
    return json({ ok: false, message: "回复邮箱格式不正确。" }, 400);
  }

  const subject = "影音入库箱反馈" + (name ? " - " + name : "");
  const meta = [
    "来自：影音入库箱官网",
    name ? "称呼：" + name : "",
    reply ? "回复邮箱：" + reply : ""
  ].filter(Boolean).join("\n");
  const text = meta + "\n\n" + message;

  const payload = {
    from: env.CONTACT_FROM || "影音入库箱官网 <onboarding@resend.dev>",
    to: [env.CONTACT_TO],
    subject,
    text
  };
  if (reply) payload.reply_to = reply;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  let response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: "Bearer " + env.RESEND_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
  } catch (err) {
    return json({ ok: false, message: "邮件发送超时，请稍后再试。" }, 502);
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    console.error("contact mail provider error", response.status);
    return json({ ok: false, message: "邮件发送失败，请稍后再试。" }, 502);
  }

  return json({ ok: true });
}

export function onRequestGet() {
  return json({ ok: false, message: "只接受 POST 提交。" }, 405);
}
