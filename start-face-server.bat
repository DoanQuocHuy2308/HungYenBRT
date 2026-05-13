@echo off
title BRT Face Server (MTCNN)
echo ============================================
echo   Hung Yen BRT - MTCNN Face Server
echo   Khoi dong dich vu nhan dien khuon mat...
echo ============================================
cd /d "%~dp0"
pm2 resurrect
echo [OK] Face Server da duoc khoi dong lai!
timeout /t 3 >nul
