# 대빵오락실 키오스크 - 깃허브 업로드
# 이 파일을 직접 실행해도 되고, 업로드.bat 을 더블클릭해도 됩니다.

$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

function Fail($message) {
  Write-Host ""
  Write-Host "[오류] $message" -ForegroundColor Red
  exit 1
}

Write-Host "============================================"
Write-Host "  대빵오락실 키오스크 - 깃허브 업로드"
Write-Host "============================================"
Write-Host ""

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Fail "git 이 없습니다. https://git-scm.com/download/win 에서 설치한 뒤 다시 실행하세요."
}

if (-not (Test-Path -LiteralPath ".git")) {
  Write-Host "[준비] git 저장소를 처음 만듭니다."
  git init | Out-Null
}

$remote = ""
try {
  $remote = (git remote get-url origin 2>$null)
} catch {
  $remote = ""
}

if (-not $remote) {
  Write-Host "깃허브 저장소 주소가 아직 없습니다."
  Write-Host "예) https://github.com/아이디/daebbang-kiosk.git"
  Write-Host ""
  $repoUrl = Read-Host "깃허브 주소를 붙여넣고 Enter"
  if (-not $repoUrl) {
    Fail "주소가 없어서 중단합니다."
  }
  git remote add origin $repoUrl.Trim()
  if ($LASTEXITCODE -ne 0) {
    Fail "주소를 연결하지 못했습니다."
  }
}

Write-Host ""
Write-Host "[1/3] 바뀐 파일을 모읍니다."
git add -A
if ($LASTEXITCODE -ne 0) {
  Fail "파일을 모으지 못했습니다."
}

git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
  Write-Host "[2/3] 바뀐 내용이 없어서 그대로 올립니다."
} else {
  Write-Host "[2/3] 저장합니다."
  $stamp = Get-Date -Format "yyyy-MM-dd HH:mm"
  git commit -m "update $stamp"
  if ($LASTEXITCODE -ne 0) {
    Fail "저장하지 못했습니다."
  }
}

git branch -M main
Write-Host "[3/3] 깃허브에 올립니다."
git push -u origin main
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "[오류] 올리지 못했습니다." -ForegroundColor Red
  Write-Host " - 로그인 창이 뜨면 깃허브 계정으로 로그인하세요."
  Write-Host " - 저장소 주소가 맞는지 확인하세요:"
  git remote get-url origin
  exit 1
}

Write-Host ""
Write-Host "완료. 깃허브 Actions 가 1~2분 안에 새 화면을 올립니다." -ForegroundColor Green
Write-Host "아이패드에서는 홈 화면 앱을 완전히 종료했다가 다시 열면 업데이트됩니다."
Write-Host ""
Write-Host "처음이라면 깃허브 저장소에서:"
Write-Host " Settings → Pages → Source 를 GitHub Actions 로 바꾼 뒤"
Write-Host " https://아이디.github.io/저장소이름/  주소를 아이패드 사파리로 여세요."
exit 0
