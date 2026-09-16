@echo off
cd /d "%~dp0"

echo ============================================
echo  daebbang-kiosk GitHub upload
echo ============================================
echo.

where git >nul 2>nul
if errorlevel 1 (
  echo git not found. Install Git first.
  goto end
)

if not exist ".git" git init

git remote get-url origin >nul 2>nul
if errorlevel 1 (
  git remote add origin https://github.com/MAYANOSUNGHO/daebbang-kiosk.git
)

echo [1/3] git add
git add -A
if errorlevel 1 (
  echo git add failed
  goto end
)

git diff --cached --quiet
if errorlevel 1 (
  echo [2/3] git commit --trailer "Co-authored-by: Cursor <cursoragent@cursor.com>"
  git commit --trailer "Co-authored-by: Cursor <cursoragent@cursor.com>" -m "update kiosk"
) else (
  echo [2/3] no new commit
)

git branch -M main
echo [3/3] git push
git push -u origin main
if errorlevel 1 (
  echo.
  echo git push failed. Sign in to GitHub if a login window appears.
  git remote get-url origin
  goto end
)

echo.
echo OK
echo https://mayanosungho.github.io/daebbang-kiosk/
echo Next: GitHub Settings - Pages - Source - GitHub Actions

:end
echo.
pause
