@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ============================================================
echo   SOROKIDS - BUILD TOI UU CHO LINUX SHARED HOST
echo   Su dung Next.js Standalone Output (~50-120MB)
echo ============================================================
echo.

set "PROJECT_DIR=%~dp0"
set "OUTPUT_DIR=%PROJECT_DIR%deploy_linux"

:: ========================================
:: BUOC 1: Dung Node processes
:: ========================================
echo [1/8] Dung cac tien trinh Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

:: ========================================
:: BUOC 2: Xoa thu muc deploy cu
:: ========================================
echo [2/8] Xoa thu muc deploy cu...
if exist "%OUTPUT_DIR%" rd /s /q "%OUTPUT_DIR%"
mkdir "%OUTPUT_DIR%"

:: ========================================
:: BUOC 3: Xoa cache
:: ========================================
echo [3/8] Xoa cache cu...
if exist "%PROJECT_DIR%.next" rd /s /q "%PROJECT_DIR%.next"

:: ========================================
:: BUOC 4: npm install
:: ========================================
echo [4/8] Cai dat dependencies...
cd /d "%PROJECT_DIR%"
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo [LOI] npm install that bai!
    pause
    exit /b 1
)

:: ========================================
:: BUOC 5: Prisma generate
:: ========================================
echo [5/8] Generate Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo [LOI] Prisma generate that bai!
    pause
    exit /b 1
)

:: ========================================
:: BUOC 6: Next.js build
:: ========================================
echo [6/8] Build Next.js (standalone mode)...
call npm run build
if errorlevel 1 (
    echo [LOI] Next.js build that bai!
    pause
    exit /b 1
)

:: ========================================
:: BUOC 7: Copy STANDALONE output (CHINH XAC)
:: ========================================
echo [7/8] Copy standalone output...

:: Copy standalone folder (da co server.js, node_modules toi uu, .next)
xcopy "%PROJECT_DIR%.next\standalone" "%OUTPUT_DIR%\" /E /I /Q /Y >nul

:: Copy static files vao .next/static (BAT BUOC)
xcopy "%PROJECT_DIR%.next\static" "%OUTPUT_DIR%\.next\static\" /E /I /Q /Y >nul

:: Copy public folder
if exist "%PROJECT_DIR%public" (
    xcopy "%PROJECT_DIR%public" "%OUTPUT_DIR%\public\" /E /I /Q /Y >nul
)

:: ========================================
:: BUOC 8: Toi uu Prisma cho Linux
:: ========================================
echo [8/8] Toi uu Prisma binaries cho Linux...

set "PRISMA_CLIENT=%OUTPUT_DIR%\node_modules\.prisma\client"
set "SOURCE_PRISMA=%PROJECT_DIR%node_modules\.prisma\client"

:: Copy Linux binaries tu source
if exist "%SOURCE_PRISMA%\libquery_engine-debian-openssl-1.1.x.so.node" (
    copy /Y "%SOURCE_PRISMA%\libquery_engine-debian-openssl-1.1.x.so.node" "%PRISMA_CLIENT%\" >nul
    echo     [OK] Copied debian-openssl-1.1.x
)
if exist "%SOURCE_PRISMA%\libquery_engine-debian-openssl-3.0.x.so.node" (
    copy /Y "%SOURCE_PRISMA%\libquery_engine-debian-openssl-3.0.x.so.node" "%PRISMA_CLIENT%\" >nul
    echo     [OK] Copied debian-openssl-3.0.x
)

:: Xoa Windows binaries
del /q "%PRISMA_CLIENT%\query_engine-windows*" 2>nul
del /q "%PRISMA_CLIENT%\*.dll*" 2>nul

:: Xoa cac Linux binaries khong can thiet (rhel, musl) de giam dung luong
echo     Xoa binaries khong can thiet (rhel, musl)...
del /q "%PRISMA_CLIENT%\libquery_engine-linux-musl*" 2>nul
del /q "%PRISMA_CLIENT%\libquery_engine-rhel*" 2>nul

:: ========================================
:: TAO FILE CAU HINH
:: ========================================
echo.
echo Tao file .env...

:: Xoa .env cu neu co
del /q "%OUTPUT_DIR%\.env" 2>nul
del /q "%OUTPUT_DIR%\.env.production" 2>nul

:: Tao .env moi
(
echo # Database - MySQL
echo DATABASE_URL="mysql://nhsortag_soro:dNu6PJPiiLo66XWz@sorokid.com:3306/nhsortag_sorokids?connection_limit=10&pool_timeout=20"
echo.
echo # NextAuth
echo NEXTAUTH_URL="https://sorokid.com"
echo NEXTAUTH_SECRET="wstVe5DkkFHKqTosIMpgwjRWUigLJgbYg8n04+qWjv8="
echo.
echo # Node environment
echo NODE_ENV="production"
echo.
echo # Server configuration
echo PORT=3000
echo HOSTNAME="0.0.0.0"
) > "%OUTPUT_DIR%\.env"

:: ========================================
:: KIEM TRA KET QUA
:: ========================================
echo.
echo ============================================================
echo   KIEM TRA CAU TRUC
echo ============================================================

if exist "%OUTPUT_DIR%\server.js" (echo [OK] server.js) else (echo [THIEU] server.js)
if exist "%OUTPUT_DIR%\.next" (echo [OK] .next/) else (echo [THIEU] .next/)
if exist "%OUTPUT_DIR%\.next\static" (echo [OK] .next/static/) else (echo [THIEU] .next/static/)
if exist "%OUTPUT_DIR%\node_modules" (echo [OK] node_modules/) else (echo [THIEU] node_modules/)
if exist "%OUTPUT_DIR%\.env" (echo [OK] .env) else (echo [THIEU] .env)

echo.
echo === Prisma Linux Binaries ===
if exist "%PRISMA_CLIENT%\libquery_engine-debian-openssl-1.1.x.so.node" (echo [OK] debian-openssl-1.1.x) else (echo [THIEU] debian-openssl-1.1.x)
if exist "%PRISMA_CLIENT%\libquery_engine-debian-openssl-3.0.x.so.node" (echo [OK] debian-openssl-3.0.x) else (echo [THIEU] debian-openssl-3.0.x)

:: Tinh dung luong
echo.
for /f "tokens=3" %%a in ('dir "%OUTPUT_DIR%" /s /-c 2^>nul ^| findstr "File(s)"') do set "TOTAL_SIZE=%%a"
set /a SIZE_MB=%TOTAL_SIZE:~0,-6% 2>nul
if "%SIZE_MB%"=="" set "SIZE_MB=0"

echo ============================================================
echo   BUILD THANH CONG!
echo ============================================================
echo.
echo   Thu muc output: %OUTPUT_DIR%
echo   Dung luong: khoang %SIZE_MB% MB
echo.
echo   HUONG DAN DEPLOY:
echo   1. Upload thu muc deploy_linux len host
echo   2. Doi ten thanh "sorokid" 
echo   3. Chay: pm2 start server.js --name sorokids
echo ============================================================
echo.

pause
exit /b 0
