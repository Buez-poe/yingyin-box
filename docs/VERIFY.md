# 校验与验签（三行命令）

发布物：`downloads/yingyin-box-v6.0.zip`、`downloads/yingyin-box-v6.0.html`、站点根 `app.html`（在线版，内容与下载的 HTML 完全相同），以及把前三者、签名和公钥打包在一起的 `downloads/yingyin-box-v6.0-offline-archive.zip`（离线存档包）。校验和清单在站点根 `SHA256SUMS`，同目录有 `SHA256SUMS.sig`、`allowed_signers`、`signing-key.pub`。

整站页面、文档、下载包与 `SHA256SUMS` 本身还有一层整站签名，见 [`SITE-SIGNATURE.md`](SITE-SIGNATURE.md)（清单 `SITE-SHA256SUMS`，签名命名空间 `yingyin-box-SITE-SHA256SUMS`）。

## 0. 先存离线，再谈信任

第一次校验通过后，把 `downloads/yingyin-box-v6.0.html`（或 `app.html`）、`downloads/yingyin-box-v6.0.zip`、`SHA256SUMS`、`SHA256SUMS.sig`、`allowed_signers`、`signing-key.pub` 放进同一个只读目录，记下核对日期和清单哈希。以后只打开本地 HTML，不再从在线版取新文件；站点后续被改动，也影响不到这份存档。

离线存档包 `downloads/yingyin-box-v6.0-offline-archive.zip` 已经把这些文件按站点路径排好，解压后可直接在本目录执行下面的校验和验签命令，包内另附 `README-离线存档.txt`。

仓库是第二独立渠道：对照 [`SHA256SUMS`](https://gitee.com/a-splash-of-water/yingyin-box/blob/master/SHA256SUMS)、[commit 历史](https://gitee.com/a-splash-of-water/yingyin-box/commits/master) 与 [`downloads/`](https://gitee.com/a-splash-of-water/yingyin-box/tree/master/downloads) 里的成品。本地存档和仓库两个来源对上，才接近签名带来的可信度。

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

| 版本 | 日期 | commit | 完整包 SHA-256 | 网页版 / 在线版 SHA-256 |
|---|---|---|---|---|
| v6.0 | 2026-11-23 | `5ab422164c54` | `25a26e4744288f1c1c9fc85b04f8646567e9682a54adca4c6844714b65d8878d` | `c51c7514c4a0b07f6063e23dc69badcc2952508627655288ee73e7d4bb058611` |
| v5.7 | 2026-11-22 | `b3f50aa` | `f9e0eaa97578e6447d29a9ba451b264d130b0eb7b4c457287356ff0e8ca364da` | `53765a727e724d083e4d8f3c09b611d4421ad5aea54e81748e7474abdde87f6d` |

> 新版本只追加行，不覆盖旧哈希。上表是构建时快照，最终发布以 Release 附件 `SHA256SUMS` 为准。
>
> v6.0 的 `app.html` 与 `downloads/yingyin-box-v6.0.html` 字节完全相同，两者 SHA-256 均为 `c51c7514c4a0b07f6063e23dc69badcc2952508627655288ee73e7d4bb058611`。
>
> 离线存档包的大小与 SHA-256 以站点根 `SHA256SUMS` 为准（包内不记录自身哈希，避免循环）。
