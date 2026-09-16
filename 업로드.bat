@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo ============================================
echo   대빵오락실 키오스크 - 깃허브 업로드
echo ============================================
echo.

where git >nul 2>nul
if errorlevel 1 (
  echo [실패] git 이 설치되어 있지 않습니다.
  echo        https://git-scm.com/download/win 에서 설치한 뒤 다시 실행하세요.
  goto :end
)

if not exist ".git" (
  echo [준비] git 저장소를 새로 만듭니다.
  git init >nul
)

git remote get-url origin >nul 2>nul
if errorlevel 1 (
  echo 깃허브 저장소 주소가 아직 등록되지 않았습니다.
  echo 예^) https://github.com/내아이디/daebbang-kiosk.git
  echo.
  set /p REPO_URL=저장소 주소를 붙여넣고 엔터: 
  if "%REPO_URL%"=="" (
    echo [실패] 주소가 비어 있어서 중단합니다.
    goto :end
  )
  git remote add origin "%REPO_URL%"
)

echo.
echo [1/3] 변경된 파일을 담습니다.
git add -A

git diff --cached --quiet
if errorlevel 1 (
  for /f "tokens=1-3 delims=/ " %%a in ("%DATE%") do set TODAY=%%a-%%b-%%c
  for /f "tokens=1-2 delims=:" %%a in ("%TIME%") do set NOW=%%a:%%b
  echo [2/3] 저장합니다.
  git commit -m "update %TODAY% %NOW%" >nul
) else (
  echo [2/3] 바뀐 내용이 없어서 그대로 올립니다.
)

git branch -M main

echo [3/3] 깃허브로 올립니다.
git push -u origin main
if errorlevel 1 (
  echo.
  echo [실패] 올리지 못했습니다. 로그인 창이 떴는지, 주소가 맞는지 확인하세요.
  goto :end
)

echo.
echo 완료! 깃허브 Actions 가 1~2분 안에 새 화면을 반영합니다.
echo 아이패드에서는 홈 화면 앱을 닫고 다시 열면 업데이트됩니다.

:end
echo.
pause
endlocal
