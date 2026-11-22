# 校验与验签（三行命令）

发布物：`downloads/yingyin-box-v6.0.zip`、`downloads/yingyin-box-v6.0.html`。校验和清单在站点根 `SHA256SUMS`，同目录有 `SHA256SUMS.sig`、`allowed_signers`、`signing-key.pub`。

## 1. 校验哈希（Windows / macOS / Linux 通用）

```bash
# macOS / Linux
sha256sum -c SHA256SUMS

# Windows PowerShell
Get-Content .\SHA256SUMS | ForEach-Object { $p=($_ -split '  ',2)[1]; $h=($_ -split '  ',2)[0]; if((Get-FileHash $p -Algorithm SHA256).Hash.ToLower() -ne $h){ throw "BAD $p" } }; "OK"
```

## 2. 验签（SSH ed25519，Windows 自带 OpenSSH 即可）

```bash
ssh-keygen -Y verify -f allowed_signers -I a-splash-of-water -n yingyin-box-SHA256SUMS -s SHA256SUMS.sig < SHA256SUMS
```

输出 `Good "yingyin-box-SHA256SUMS" signature for a-splash-of-water` 即通过。

## 3. 对 commit

页面角落「本版构建自 `xxxx`」可点击跳到仓库对应 commit；`manifest.json` 里 `commit` 字段是同一个值。

## 当前发布记录

| 版本 | 日期 | commit | 完整包 SHA-256 | 网页版 SHA-256 |
|---|---|---|---|---|
| v6.0 | 2026-11-23 | `b3f50aa525a1` | `16f679dbc3b619cccd4a5c34db308fa849721ec699be637b42158c5a9d1e5c45` | `ef728e5fa84d58a56422e5f42e7792585f5b645f828b784cba41a28790ef6053` |
| v5.7 | 2026-11-22 | `b3f50aa` | `f9e0eaa97578e6447d29a9ba451b264d130b0eb7b4c457287356ff0e8ca364da` | `53765a727e724d083e4d8f3c09b611d4421ad5aea54e81748e7474abdde87f6d` |

> 新版本只追加行，不覆盖旧哈希。上表是构建时快照，最终发布以 Release 附件 `SHA256SUMS` 为准。
