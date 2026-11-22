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

macOS / Linux：

```bash
ssh-keygen -Y verify -f allowed_signers -I a-splash-of-water -n yingyin-box-SHA256SUMS -s SHA256SUMS.sig < SHA256SUMS
```

Windows PowerShell（用 cmd 做字节重定向，避免 PowerShell 管道改写换行）：

```powershell
cmd /c '"C:\Windows\System32\OpenSSH\ssh-keygen.exe" -Y verify -f allowed_signers -I a-splash-of-water -n yingyin-box-SHA256SUMS -s SHA256SUMS.sig < SHA256SUMS'
```

输出 `Good "yingyin-box-SHA256SUMS" signature for a-splash-of-water` 即通过。

## 3. 对 commit

页面角落「本版构建自 `xxxx`」可点击跳到仓库对应 commit；`manifest.json` 里 `commit` 字段是同一个值。

## 当前发布记录

| 版本 | 日期 | commit | 完整包 SHA-256 | 网页版 SHA-256 |
|---|---|---|---|---|
| v6.0 | 2026-11-23 | `5ab422164c54` | `25a26e4744288f1c1c9fc85b04f8646567e9682a54adca4c6844714b65d8878d` | `c51c7514c4a0b07f6063e23dc69badcc2952508627655288ee73e7d4bb058611` |
| v5.7 | 2026-11-22 | `b3f50aa` | `f9e0eaa97578e6447d29a9ba451b264d130b0eb7b4c457287356ff0e8ca364da` | `53765a727e724d083e4d8f3c09b611d4421ad5aea54e81748e7474abdde87f6d` |

> 新版本只追加行，不覆盖旧哈希。上表是构建时快照，最终发布以 Release 附件 `SHA256SUMS` 为准。
