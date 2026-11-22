# 整站签名与验证

本站使用 SSH Ed25519（OpenSSH SSHSIG）对整站文件清单签名。签名密钥与发布包 `SHA256SUMS` 使用同一把作者密钥，公钥指纹为：

```text
SHA256:5HIRWZfB7RppTD0S8S1P6rwPof2FWwS2dykAWOO93xU
```

## 签名链

```text
SITE-SHA256SUMS.sig
  └─ 签名 SITE-SHA256SUMS
       ├─ index.html、app.html、README、LICENSE、CHANGELOG
       ├─ docs/*.md、下载包、functions/api/contact.js
       └─ SHA256SUMS（发布包清单）
            ├─ downloads/yingyin-box-v6.0.zip
            ├─ downloads/yingyin-box-v6.0.html
            └─ app.html
```

所以验一次整站签名，再按 `SHA256SUMS` 校验发布包，就能确认「官网页面、在线版、下载包」来自同一次发布。

## 文件

| 文件 | 用途 |
| --- | --- |
| `SITE-SHA256SUMS` | 整站文件与 SHA-256 清单 |
| `SITE-SHA256SUMS.sig` | 对清单的 Ed25519 签名 |
| `signing-key.pub` | 作者公钥 |
| `allowed_signers` | 验签信任配置，标识 `a-splash-of-water` |

签名命名空间固定为 `yingyin-box-SITE-SHA256SUMS`。命名空间不对会验签失败。

## 1. 校验整站文件

```bash
sha256sum -c SITE-SHA256SUMS
```

Windows PowerShell：

```powershell
Get-Content .\SITE-SHA256SUMS -Encoding UTF8 | ForEach-Object {
  $h,$p = $_ -split '  ',2
  if ((Get-FileHash -LiteralPath $p -Algorithm SHA256).Hash.ToLower() -ne $h) { throw "BAD $p" }
}
"OK"
```

## 2. 验签

macOS / Linux：

```bash
ssh-keygen -Y verify -f allowed_signers -I a-splash-of-water \
  -n yingyin-box-SITE-SHA256SUMS -s SITE-SHA256SUMS.sig < SITE-SHA256SUMS
```

Windows PowerShell（用 cmd 做字节重定向，避免管道改写换行）：

```powershell
cmd /c '"C:\Windows\System32\OpenSSH\ssh-keygen.exe" -Y verify -f allowed_signers -I a-splash-of-water -n yingyin-box-SITE-SHA256SUMS -s SITE-SHA256SUMS.sig < SITE-SHA256SUMS'
```

输出这一行即通过：

```text
Good "yingyin-box-SITE-SHA256SUMS" signature for a-splash-of-water with ED25519 key SHA256:5HIRWZfB7RppTD0S8S1P6rwPof2FWwS2dykAWOO93xU
```

## 3. 发布包清单

整站清单里包含 `SHA256SUMS`，它再列出 v6.0 的 zip、单文件 HTML 和在线版 `app.html`。发布包的验签步骤见 [`VERIFY.md`](VERIFY.md)，命名空间是 `yingyin-box-SHA256SUMS`。

## 说明

- Cloudflare Pages 会把 `/app.html`、`/docs/SITE-SIGNATURE.md` 这类地址 308 重定向到无扩展名地址；下载到本地校验时请保持清单里的原文件名。
- 签名文件与私钥分离：仓库只提交公钥、`allowed_signers` 和签名；私钥在作者本机 `.signing/`，不发布。
- 任何对官网页面、文档、下载包或 `SHA256SUMS` 的改动，都会让整站校验或验签失败。
