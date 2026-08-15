@echo off
setlocal
title Persian-to-Braille Windows Desktop Preview Installer

echo ================================================================
echo Persian-to-Braille - Windows Desktop Preview Installer
echo ================================================================
echo.
echo This installer configures a Windows Office sideload/testing catalog.
echo It is NOT a Microsoft Marketplace installer.
echo.

set "SETUP_URL=https://soroushneyestani.github.io/Persian-to-Braille/install/windows/windows-preview-setup.ps1"
set "SETUP_FILE=%TEMP%\PersianToBrailleWindowsPreviewSetup.ps1"

echo [1/2] Downloading the signed-source setup helper over HTTPS...
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $ProgressPreference='SilentlyContinue'; Invoke-WebRequest -UseBasicParsing -Uri '%SETUP_URL%' -OutFile '%SETUP_FILE%'"
if errorlevel 1 (
  echo.
  echo ERROR: Unable to download the setup helper.
  echo Check your internet connection and try again.
  pause
  exit /b 1
)

echo [2/2] Running Windows preview setup...
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SETUP_FILE%"
set "RESULT=%ERRORLEVEL%"

del /q "%SETUP_FILE%" >nul 2>&1

echo.
if "%RESULT%"=="0" (
  echo Setup completed.
  echo In Office: Add-ins ^> Get Add-ins/Advanced ^> SHARED FOLDER
  echo Select Persian-to-Braille and choose Add.
) else (
  echo Setup did not complete successfully. Exit code: %RESULT%
)

echo.
pause
exit /b %RESULT%
