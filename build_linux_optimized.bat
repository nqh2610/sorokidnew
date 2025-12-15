@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ============================================================
echo   SOROKIDS - BUILD TOI UU CHO LINUX SHARED HOST
echo   Su dung Next.js Standalone Output (~50-120MB)
echo   Version 2.0 - Includes Process Optimization
echo ============================================================
echo.

set "PROJECT_DIR=%~dp0"
set "OUTPUT_DIR=%PROJECT_DIR%deploy_linux"

:: ========================================
:: BUOC 1: Dung Node processes
:: ========================================
echo [1/10] Dung cac tien trinh Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

:: ========================================
:: BUOC 2: Xoa thu muc deploy cu
:: ========================================
echo [2/10] Xoa thu muc deploy cu...
if exist "%OUTPUT_DIR%" rd /s /q "%OUTPUT_DIR%"
mkdir "%OUTPUT_DIR%"

:: ========================================
:: BUOC 3: Xoa cache
:: ========================================
echo [3/10] Xoa cache cu...
if exist "%PROJECT_DIR%.next" rd /s /q "%PROJECT_DIR%.next"

:: ========================================
:: BUOC 4: npm install
:: ========================================
echo [4/10] Cai dat dependencies...
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
echo [5/10] Generate Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo [LOI] Prisma generate that bai!
    pause
    exit /b 1
)

:: ========================================
:: BUOC 6: Next.js build
:: ========================================
echo [6/10] Build Next.js (standalone mode)...
call npm run build
if errorlevel 1 (
    echo [LOI] Next.js build that bai!
    pause
    exit /b 1
)

:: ========================================
:: BUOC 7: Copy STANDALONE output (CHINH XAC)
:: ========================================
echo [7/10] Copy standalone output...

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
echo [8/10] Toi uu Prisma binaries cho Linux...

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
:: BUOC 9: Copy CONFIG FILES (MOI)
:: ========================================
echo [9/10] Copy config files cho shared host...

:: Copy ecosystem.config.js (PM2 config)
copy /Y "%PROJECT_DIR%ecosystem.config.js" "%OUTPUT_DIR%\" >nul
echo     [OK] ecosystem.config.js

:: Copy runtime config folder
if not exist "%OUTPUT_DIR%\config" mkdir "%OUTPUT_DIR%\config"
xcopy "%PROJECT_DIR%config" "%OUTPUT_DIR%\config\" /E /I /Q /Y >nul
echo     [OK] config/runtime.config.js

:: Copy scripts folder (monitoring)
if not exist "%OUTPUT_DIR%\scripts" mkdir "%OUTPUT_DIR%\scripts"
if exist "%PROJECT_DIR%scripts\monitor-processes.sh" (
    copy /Y "%PROJECT_DIR%scripts\monitor-processes.sh" "%OUTPUT_DIR%\scripts\" >nul
    echo     [OK] scripts/monitor-processes.sh
)

:: Copy components (FloatingSoroban, Soroban - neu can)
if exist "%PROJECT_DIR%components\FloatingSoroban" (
    if not exist "%OUTPUT_DIR%\components" mkdir "%OUTPUT_DIR%\components"
    xcopy "%PROJECT_DIR%components\FloatingSoroban" "%OUTPUT_DIR%\components\FloatingSoroban\" /E /I /Q /Y >nul
    echo     [OK] components/FloatingSoroban
)
if exist "%PROJECT_DIR%components\Soroban" (
    xcopy "%PROJECT_DIR%components\Soroban" "%OUTPUT_DIR%\components\Soroban\" /E /I /Q /Y >nul
    echo     [OK] components/Soroban
)

:: ========================================
:: BUOC 10: TAO FILE CAU HINH
:: ========================================
echo [10/10] Tao file .env...

:: Xoa .env cu neu co
del /q "%OUTPUT_DIR%\.env" 2>nul
del /q "%OUTPUT_DIR%\.env.production" 2>nul

:: Tao .env moi voi RUNTIME_ENV=shared
(
echo # Database - MySQL
echo DATABASE_URL="mysql://nhsortag_soro:dNu6PJPiiLo66XWz@sorokid.com:3306/nhsortag_sorokids?connection_limit=5^&pool_timeout=10"
echo.
echo # NextAuth
echo NEXTAUTH_URL="https://sorokid.com"
echo NEXTAUTH_SECRET="wstVe5DkkFHKqTosIMpgwjRWUigLJgbYg8n04+qWjv8="
echo.
echo # Node environment
echo NODE_ENV="production"
echo.
echo # RUNTIME CONFIG - QUAN TRONG cho shared host
echo RUNTIME_ENV="shared"
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

echo.
echo === Core Files ===
if exist "%OUTPUT_DIR%\server.js" (echo [OK] server.js) else (echo [THIEU] server.js)
if exist "%OUTPUT_DIR%\.next" (echo [OK] .next/) else (echo [THIEU] .next/)
if exist "%OUTPUT_DIR%\.next\static" (echo [OK] .next/static/) else (echo [THIEU] .next/static/)
if exist "%OUTPUT_DIR%\node_modules" (echo [OK] node_modules/) else (echo [THIEU] node_modules/)
if exist "%OUTPUT_DIR%\.env" (echo [OK] .env) else (echo [THIEU] .env)
if exist "%OUTPUT_DIR%\public" (echo [OK] public/) else (echo [THIEU] public/)

echo.
echo === Config Files (Process Optimization) ===
if exist "%OUTPUT_DIR%\ecosystem.config.js" (echo [OK] ecosystem.config.js) else (echo [THIEU] ecosystem.config.js)
if exist "%OUTPUT_DIR%\config\runtime.config.js" (echo [OK] config/runtime.config.js) else (echo [THIEU] config/runtime.config.js)
if exist "%OUTPUT_DIR%\scripts\monitor-processes.sh" (echo [OK] scripts/monitor-processes.sh) else (echo [THIEU] scripts/monitor-processes.sh)

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
echo   CONFIG DA TOI UU:
echo   - RUNTIME_ENV=shared (kich hoat shared host mode)
echo   - DB connection_limit=5 (toi uu cho shared host)
echo   - UV_THREADPOOL_SIZE=2 (trong ecosystem.config.js)
echo   - Memory limit 400M
echo.
echo   HUONG DAN DEPLOY:
echo   1. Upload thu muc deploy_linux len host
echo   2. Doi ten thanh "sorokid"
echo   3. Chay: pm2 start ecosystem.config.js --env production
echo   4. Hoac: pm2 reload sorokid (neu da co)
echo.
echo   THEO DOI PROCESSES:
echo   - chmod +x scripts/monitor-processes.sh
echo   - ./scripts/monitor-processes.sh
echo ============================================================
echo.

pause
exit /b 0
