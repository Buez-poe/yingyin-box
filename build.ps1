$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
if (-not $env:BUILD_COMMIT) {
  $git = $env:GIT_EXE
  if (-not $git) { $git = "git" }
  try { $env:BUILD_COMMIT = (& $git -C $root rev-parse --short=12 HEAD).Trim() } catch { $env:BUILD_COMMIT = "local" }
}
node tools/build.mjs $root
