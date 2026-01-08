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
set "PRISMA_NEXT=%OUTPUT_DIR%\.next\server"
set "SOURCE_PRISMA=%PROJECT_DIR%node_modules\.prisma\client"

:: Tao thu muc neu chua co
if not exist "%PRISMA_CLIENT%" mkdir "%PRISMA_CLIENT%"
if not exist "%PRISMA_NEXT%" mkdir "%PRISMA_NEXT%"

:: Copy Linux binaries vao node_modules/.prisma/client
if exist "%SOURCE_PRISMA%\libquery_engine-debian-openssl-1.1.x.so.node" (
    copy /Y "%SOURCE_PRISMA%\libquery_engine-debian-openssl-1.1.x.so.node" "%PRISMA_CLIENT%\" >nul
    echo     [OK] Copied debian-openssl-1.1.x to node_modules/.prisma/client
)
if exist "%SOURCE_PRISMA%\libquery_engine-debian-openssl-3.0.x.so.node" (
    copy /Y "%SOURCE_PRISMA%\libquery_engine-debian-openssl-3.0.x.so.node" "%PRISMA_CLIENT%\" >nul
    echo     [OK] Copied debian-openssl-3.0.x to node_modules/.prisma/client
)

:: Copy Linux binaries vao .next/server (Next.js standalone can o day)
if exist "%SOURCE_PRISMA%\libquery_engine-debian-openssl-1.1.x.so.node" (
    copy /Y "%SOURCE_PRISMA%\libquery_engine-debian-openssl-1.1.x.so.node" "%PRISMA_NEXT%\" >nul
    echo     [OK] Copied debian-openssl-1.1.x to .next/server
)
if exist "%SOURCE_PRISMA%\libquery_engine-debian-openssl-3.0.x.so.node" (
    copy /Y "%SOURCE_PRISMA%\libquery_engine-debian-openssl-3.0.x.so.node" "%PRISMA_NEXT%\" >nul
    echo     [OK] Copied debian-openssl-3.0.x to .next/server
)

:: Copy schema.prisma vao .next/server (can thiet cho Prisma)
if exist "%SOURCE_PRISMA%\schema.prisma" (
    copy /Y "%SOURCE_PRISMA%\schema.prisma" "%PRISMA_NEXT%\" >nul
    copy /Y "%SOURCE_PRISMA%\schema.prisma" "%PRISMA_CLIENT%\" >nul
    echo     [OK] Copied schema.prisma
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
echo     [OK] config/seo-toolbox.config.js (SEO reference)

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
if exist "%PROJECT_DIR%components\Analytics" (
    xcopy "%PROJECT_DIR%components\Analytics" "%OUTPUT_DIR%\components\Analytics\" /E /I /Q /Y >nul
    echo     [OK] components/Analytics (Google Analytics)
)

:: Copy ToolLayout (BAT BUOC cho /tool pages)
if exist "%PROJECT_DIR%components\ToolLayout" (
    xcopy "%PROJECT_DIR%components\ToolLayout" "%OUTPUT_DIR%\components\ToolLayout\" /E /I /Q /Y >nul
    echo     [OK] components/ToolLayout (Loading skeleton + Layout)
)

:: Copy Adventure components (BAT BUOC cho /adventure - Kho bau tri thuc)
if exist "%PROJECT_DIR%components\Adventure" (
    xcopy "%PROJECT_DIR%components\Adventure" "%OUTPUT_DIR%\components\Adventure\" /E /I /Q /Y >nul
    echo     [OK] components/Adventure (Game map, Rewards)
)
if exist "%PROJECT_DIR%components\Narrative" (
    xcopy "%PROJECT_DIR%components\Narrative" "%OUTPUT_DIR%\components\Narrative\" /E /I /Q /Y >nul
    echo     [OK] components/Narrative (Story, Dialog)
)

:: Copy content folder (BLOG DATA - BAT BUOC)
if exist "%PROJECT_DIR%content" (
    if not exist "%OUTPUT_DIR%\content" mkdir "%OUTPUT_DIR%\content"
    xcopy "%PROJECT_DIR%content" "%OUTPUT_DIR%\content\" /E /I /Q /Y >nul
    echo     [OK] content/ (blog posts + categories)
)

:: Copy lib folder (utility functions - BAT BUOC cho blog)
if exist "%PROJECT_DIR%lib" (
    if not exist "%OUTPUT_DIR%\lib" mkdir "%OUTPUT_DIR%\lib"
    xcopy "%PROJECT_DIR%lib" "%OUTPUT_DIR%\lib\" /E /I /Q /Y >nul
    echo     [OK] lib/ (blog.js, auth.js, etc.)
)

:: Copy prisma schema (cho Prisma Client)
if exist "%PROJECT_DIR%prisma\schema.prisma" (
    if not exist "%OUTPUT_DIR%\prisma" mkdir "%OUTPUT_DIR%\prisma"
    copy /Y "%PROJECT_DIR%prisma\schema.prisma" "%OUTPUT_DIR%\prisma\" >nul
    echo     [OK] prisma/schema.prisma
)

:: ========================================
:: BUOC 10: TAO FILE CAU HINH
:: ========================================
echo [10/10] Tao file .env...

:: Xoa .env cu neu co
del /q "%OUTPUT_DIR%\.env" 2>nul
del /q "%OUTPUT_DIR%\.env.production" 2>nul

:: Tao .env moi voi RUNTIME_ENV=shared
:: Copy tu template de tranh van de ky tu dac biet trong CMD
if exist ".env.production.template" (
    copy /Y ".env.production.template" "%OUTPUT_DIR%\.env"
    echo   - Da copy .env tu template
) else (
    :: Fallback: Tao .env day du
    echo # Database - MySQL> "%OUTPUT_DIR%\.env"
    echo DATABASE_URL="mysql://nhsortag_soro:dNu6PJPiiLo66XWz@sorokid.com:3306/nhsortag_sorokids?connection_limit=8&pool_timeout=15">> "%OUTPUT_DIR%\.env"
    echo.>> "%OUTPUT_DIR%\.env"
    echo # NextAuth>> "%OUTPUT_DIR%\.env"
    echo NEXTAUTH_URL="https://sorokid.com">> "%OUTPUT_DIR%\.env"
    echo NEXTAUTH_SECRET="wstVe5DkkFHKqTosIMpgwjRWUigLJgbYg8n04+qWjv8=">> "%OUTPUT_DIR%\.env"
    echo.>> "%OUTPUT_DIR%\.env"
    echo # Node environment>> "%OUTPUT_DIR%\.env"
    echo NODE_ENV="production">> "%OUTPUT_DIR%\.env"
    echo.>> "%OUTPUT_DIR%\.env"
    echo # RUNTIME CONFIG>> "%OUTPUT_DIR%\.env"
    echo RUNTIME_ENV="shared">> "%OUTPUT_DIR%\.env"
    echo.>> "%OUTPUT_DIR%\.env"
    echo # Server>> "%OUTPUT_DIR%\.env"
    echo PORT=3000>> "%OUTPUT_DIR%\.env"
    echo HOSTNAME="0.0.0.0">> "%OUTPUT_DIR%\.env"
    echo.>> "%OUTPUT_DIR%\.env"
    echo # SSL (de trong neu dung reverse proxy)>> "%OUTPUT_DIR%\.env"
    echo SSL_KEY_PATH="">> "%OUTPUT_DIR%\.env"
    echo SSL_CERT_PATH="">> "%OUTPUT_DIR%\.env"
    echo.>> "%OUTPUT_DIR%\.env"
    echo # App path for PM2>> "%OUTPUT_DIR%\.env"
    echo APP_PATH="/var/www/sorokid">> "%OUTPUT_DIR%\.env"
    echo   - Tao .env day du (connection_limit=8, pool_timeout=15)
)

echo.
echo   .env da duoc tao day du voi cac thong so toi uu.

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
echo === Public Assets ===
if exist "%OUTPUT_DIR%\public\blog" (echo [OK] public/blog/ - Anh bai viet) else (echo [THIEU] public/blog/)

echo.
echo === Config Files (Process Optimization) ===
if exist "%OUTPUT_DIR%\ecosystem.config.js" (echo [OK] ecosystem.config.js) else (echo [THIEU] ecosystem.config.js)
if exist "%OUTPUT_DIR%\config\runtime.config.js" (echo [OK] config/runtime.config.js) else (echo [THIEU] config/runtime.config.js)
if exist "%OUTPUT_DIR%\scripts\monitor-processes.sh" (echo [OK] scripts/monitor-processes.sh) else (echo [THIEU] scripts/monitor-processes.sh)

echo.
echo === Blog System ===
if exist "%OUTPUT_DIR%\content\blog\posts" (echo [OK] content/blog/posts/ - Du lieu bai viet JSON) else (echo [THIEU] content/blog/posts/)
if exist "%OUTPUT_DIR%\content\blog\categories.json" (echo [OK] content/blog/categories.json) else (echo [THIEU] content/blog/categories.json)
if exist "%OUTPUT_DIR%\lib\blog.js" (echo [OK] lib/blog.js - Blog utilities) else (echo [THIEU] lib/blog.js)
if exist "%OUTPUT_DIR%\lib\auth.js" (echo [OK] lib/auth.js - Auth for admin) else (echo [THIEU] lib/auth.js)

echo.
echo === SEO (Auto-built by Next.js) ===
echo [INFO] sitemap.js - Sitemap dong tu dong cap nhat (/sitemap.xml)
echo [INFO] robots.js - Robots.txt huong dan crawl (/robots.txt)
echo [INFO] Cac file nay da duoc build vao .next/standalone tu dong
if exist "%OUTPUT_DIR%\config\seo-toolbox.config.js" (echo [OK] config/seo-toolbox.config.js - SEO keywords + FAQ) else (echo [THIEU] config/seo-toolbox.config.js)

echo.
echo === Tool Components ===
if exist "%OUTPUT_DIR%\components\ToolLayout" (echo [OK] components/ToolLayout/ - Tool layout + loading) else (echo [INFO] ToolLayout bundled in .next)

echo.
echo === Adventure Components (Kho bau tri thuc) ===
if exist "%OUTPUT_DIR%\components\Adventure" (echo [OK] components/Adventure/ - Game map, Rewards) else (echo [INFO] Adventure bundled in .next)
if exist "%OUTPUT_DIR%\components\Narrative" (echo [OK] components/Narrative/ - Story, Dialog) else (echo [INFO] Narrative bundled in .next)
if exist "%OUTPUT_DIR%\config\adventure.config.js" (echo [OK] config/adventure.config.js - Adventure game config) else (echo [THIEU] config/adventure.config.js)
if exist "%OUTPUT_DIR%\lib\adventureSounds.js" (echo [OK] lib/adventureSounds.js - Sound effects) else (echo [INFO] adventureSounds bundled in .next)

echo.
echo === Prisma ===
if exist "%OUTPUT_DIR%\prisma\schema.prisma" (echo [OK] prisma/schema.prisma) else (echo [THIEU] prisma/schema.prisma)

echo.
echo === Prisma Linux Binaries (node_modules/.prisma/client) ===
if exist "%PRISMA_CLIENT%\libquery_engine-debian-openssl-1.1.x.so.node" (echo [OK] debian-openssl-1.1.x) else (echo [THIEU] debian-openssl-1.1.x)
if exist "%PRISMA_CLIENT%\libquery_engine-debian-openssl-3.0.x.so.node" (echo [OK] debian-openssl-3.0.x) else (echo [THIEU] debian-openssl-3.0.x)

echo.
echo === Prisma Linux Binaries (.next/server) ===
if exist "%OUTPUT_DIR%\.next\server\libquery_engine-debian-openssl-1.1.x.so.node" (echo [OK] .next/server/debian-openssl-1.1.x) else (echo [THIEU] .next/server/debian-openssl-1.1.x)
if exist "%OUTPUT_DIR%\.next\server\libquery_engine-debian-openssl-3.0.x.so.node" (echo [OK] .next/server/debian-openssl-3.0.x) else (echo [THIEU] .next/server/debian-openssl-3.0.x)

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
echo   - DB connection_limit=8 (toi uu cho shared host)
echo   - UV_THREADPOOL_SIZE=4 (trong ecosystem.config.js)
echo   - Memory limit 500M
echo   - Progressive loading dashboard (giam 80%% queries)
echo.
echo   CHUC NANG BAO GOM:
echo   - Dashboard, Learn, Practice, Compete
echo   - Adventure (Kho bau tri thuc) - MOI
echo   - Toolbox (13+ cong cu) - MOI
echo   - Blog system
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
