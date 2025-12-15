@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ============================================================
echo   SOROKIDS - BUILD CHO LINUX SHARED HOST
echo   Toi uu dung luong, chi giu thu vien can thiet
echo ============================================================
echo.

set "PROJECT_DIR=%~dp0"
set "OUTPUT_DIR=%PROJECT_DIR%deploy_linux"

:: Hoi nguoi dung chon Linux target
echo Chon moi truong Linux (anh huong Prisma binary):
echo   1. Debian/Ubuntu (openssl 3.0) - Pho bien nhat [MAC DINH]
echo   2. Debian/Ubuntu (openssl 1.1) - Ubuntu 18-20
echo   3. RHEL/CentOS/AlmaLinux (openssl 3.0)
echo   4. RHEL/CentOS (openssl 1.1)
echo   5. Alpine Linux (musl)
echo   6. Giu tat ca Linux binaries
echo.
set /p LINUX_TARGET="Nhap so (1-6, Enter = 1): "
if "%LINUX_TARGET%"=="" set LINUX_TARGET=1

:: Map lua chon sang ten file
if "%LINUX_TARGET%"=="1" set "KEEP_ENGINE=libquery_engine-debian-openssl-3.0.x.so.node"
if "%LINUX_TARGET%"=="2" set "KEEP_ENGINE=libquery_engine-debian-openssl-1.1.x.so.node"
if "%LINUX_TARGET%"=="3" set "KEEP_ENGINE=libquery_engine-rhel-openssl-3.0.x.so.node"
if "%LINUX_TARGET%"=="4" set "KEEP_ENGINE=libquery_engine-rhel-openssl-1.1.x.so.node"
if "%LINUX_TARGET%"=="5" set "KEEP_ENGINE=libquery_engine-linux-musl-openssl-3.0.x.so.node"
if "%LINUX_TARGET%"=="6" set "KEEP_ENGINE=ALL"

echo.
echo Da chon: %KEEP_ENGINE%
echo.

:: ========================================
:: BUOC 1: Dung Node processes
:: ========================================
echo [1/12] Dung cac tien trinh Node.js...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

:: ========================================
:: BUOC 2: Xoa thu muc deploy cu
:: ========================================
echo [2/12] Xoa thu muc deploy cu...
if exist "%OUTPUT_DIR%" rd /s /q "%OUTPUT_DIR%"
mkdir "%OUTPUT_DIR%"

:: ========================================
:: BUOC 3: Xoa cache
:: ========================================
echo [3/12] Xoa cache cu...
if exist "%PROJECT_DIR%.next" rd /s /q "%PROJECT_DIR%.next"
if exist "%PROJECT_DIR%node_modules\.cache" rd /s /q "%PROJECT_DIR%node_modules\.cache"

:: ========================================
:: BUOC 4: npm install
:: ========================================
echo [4/12] Cai dat dependencies...
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
echo [5/12] Generate Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo [LOI] Prisma generate that bai!
    pause
    exit /b 1
)

:: ========================================
:: BUOC 6: Next.js build
:: ========================================
echo [6/12] Build Next.js (standalone mode)...
call npm run build
if errorlevel 1 (
    echo [LOI] Next.js build that bai!
    pause
    exit /b 1
)

:: ========================================
:: BUOC 7: Copy cac file chinh
:: ========================================
echo [7/12] Copy cac file chinh...

:: Copy server.js
copy "%PROJECT_DIR%server.js" "%OUTPUT_DIR%\" >nul

:: Copy .next standalone (neu co)
if exist "%PROJECT_DIR%.next\standalone" (
    xcopy "%PROJECT_DIR%.next\standalone\*" "%OUTPUT_DIR%\" /E /I /Q /Y >nul
)

:: Copy .next (server va static)
if not exist "%OUTPUT_DIR%\.next" mkdir "%OUTPUT_DIR%\.next"
xcopy "%PROJECT_DIR%.next\server" "%OUTPUT_DIR%\.next\server\" /E /I /Q /Y >nul
xcopy "%PROJECT_DIR%.next\static" "%OUTPUT_DIR%\.next\static\" /E /I /Q /Y >nul

:: Copy cac file .next khac
copy "%PROJECT_DIR%.next\BUILD_ID" "%OUTPUT_DIR%\.next\" >nul 2>&1
copy "%PROJECT_DIR%.next\build-manifest.json" "%OUTPUT_DIR%\.next\" >nul 2>&1
copy "%PROJECT_DIR%.next\prerender-manifest.json" "%OUTPUT_DIR%\.next\" >nul 2>&1
copy "%PROJECT_DIR%.next\routes-manifest.json" "%OUTPUT_DIR%\.next\" >nul 2>&1
copy "%PROJECT_DIR%.next\react-loadable-manifest.json" "%OUTPUT_DIR%\.next\" >nul 2>&1
copy "%PROJECT_DIR%.next\app-build-manifest.json" "%OUTPUT_DIR%\.next\" >nul 2>&1
copy "%PROJECT_DIR%.next\app-path-routes-manifest.json" "%OUTPUT_DIR%\.next\" >nul 2>&1

:: Copy public
xcopy "%PROJECT_DIR%public" "%OUTPUT_DIR%\public\" /E /I /Q /Y >nul

:: Copy prisma
xcopy "%PROJECT_DIR%prisma" "%OUTPUT_DIR%\prisma\" /E /I /Q /Y >nul

:: Copy components (MonsterAvatar, etc.)
xcopy "%PROJECT_DIR%components" "%OUTPUT_DIR%\components\" /E /I /Q /Y >nul

:: KHONG copy lib va app - da co trong .next build

:: ========================================
:: BUOC 8: Copy node_modules can thiet
:: ========================================
echo [8/12] Copy node_modules (chi thu vien can thiet)...

:: Danh sach cac package PRODUCTION can thiet (da toi uu, loai bo @dicebear, pngjs, caniuse-lite)
set PACKAGES=@prisma .prisma next react react-dom next-auth bcryptjs dotenv
set PACKAGES=%PACKAGES% jspdf html2canvas qrcode lucide-react
set PACKAGES=%PACKAGES% styled-jsx jose preact preact-render-to-string
set PACKAGES=%PACKAGES% postcss openid-client oauth
set PACKAGES=%PACKAGES% cookie @panva client-only scheduler
set PACKAGES=%PACKAGES% nanoid uuid object-hash @babel busboy streamsearch
set PACKAGES=%PACKAGES% graceful-fs picocolors source-map-js @swc

for %%p in (%PACKAGES%) do (
    if exist "%PROJECT_DIR%node_modules\%%p" (
        xcopy "%PROJECT_DIR%node_modules\%%p" "%OUTPUT_DIR%\node_modules\%%p\" /E /I /Q /Y >nul 2>&1
    )
)

:: ========================================
:: BUOC 9: Toi uu Prisma (chi giu Linux binary)
:: ========================================
echo [9/12] Toi uu Prisma binaries cho Linux...

set "PRISMA_CLIENT=%OUTPUT_DIR%\node_modules\.prisma\client"

if exist "%PRISMA_CLIENT%" (
    :: Xoa tat ca Windows binaries
    del /q "%PRISMA_CLIENT%\query_engine-windows*" 2>nul
    del /q "%PRISMA_CLIENT%\*.dll*" 2>nul
    del /q "%PRISMA_CLIENT%\*.tmp*" 2>nul
    
    :: Xoa deno folder
    if exist "%PRISMA_CLIENT%\deno" rd /s /q "%PRISMA_CLIENT%\deno" 2>nul
    
    :: Neu khong giu tat ca, chi giu 1 Linux binary
    if not "%KEEP_ENGINE%"=="ALL" (
        for %%f in ("%PRISMA_CLIENT%\libquery_engine-*.so.node") do (
            if not "%%~nxf"=="%KEEP_ENGINE%" (
                del /q "%%f" 2>nul
            )
        )
        echo     Giu lai: %KEEP_ENGINE%
    ) else (
        echo     Giu tat ca Linux binaries
    )
)

:: Xoa cache trong @prisma/engines
if exist "%OUTPUT_DIR%\node_modules\@prisma\engines\node_modules" (
    rd /s /q "%OUTPUT_DIR%\node_modules\@prisma\engines\node_modules" 2>nul
)

:: Xoa Windows/Mac binaries trong @prisma/engines
for /r "%OUTPUT_DIR%\node_modules\@prisma\engines" %%f in (*windows* *darwin* *.exe) do del /q "%%f" 2>nul

:: ========================================
:: BUOC 10: Xoa cac file khong can thiet
:: ========================================
echo [10/12] Xoa cac file khong can thiet de toi uu dung luong...

:: Xoa experimental packages trong next/dist/compiled (tiet kiem ~15MB)
if exist "%OUTPUT_DIR%\node_modules\next\dist\compiled\react-dom-experimental" (
    rd /s /q "%OUTPUT_DIR%\node_modules\next\dist\compiled\react-dom-experimental" 2>nul
)
if exist "%OUTPUT_DIR%\node_modules\next\dist\compiled\react-server-dom-webpack-experimental" (
    rd /s /q "%OUTPUT_DIR%\node_modules\next\dist\compiled\react-server-dom-webpack-experimental" 2>nul
)
if exist "%OUTPUT_DIR%\node_modules\next\dist\compiled\react-server-dom-turbopack-experimental" (
    rd /s /q "%OUTPUT_DIR%\node_modules\next\dist\compiled\react-server-dom-turbopack-experimental" 2>nul
)
if exist "%OUTPUT_DIR%\node_modules\next\dist\compiled\react-server-dom-turbopack" (
    rd /s /q "%OUTPUT_DIR%\node_modules\next\dist\compiled\react-server-dom-turbopack" 2>nul
)

:: Xoa build tools khong can cho runtime (tiet kiem ~5MB)
if exist "%OUTPUT_DIR%\node_modules\next\dist\compiled\babel-packages" (
    rd /s /q "%OUTPUT_DIR%\node_modules\next\dist\compiled\babel-packages" 2>nul
)
if exist "%OUTPUT_DIR%\node_modules\next\dist\compiled\babel" (
    rd /s /q "%OUTPUT_DIR%\node_modules\next\dist\compiled\babel" 2>nul
)
if exist "%OUTPUT_DIR%\node_modules\next\dist\compiled\webpack" (
    rd /s /q "%OUTPUT_DIR%\node_modules\next\dist\compiled\webpack" 2>nul
)

:: Xoa edge runtime neu khong dung
if exist "%OUTPUT_DIR%\node_modules\next\dist\compiled\edge-runtime" (
    rd /s /q "%OUTPUT_DIR%\node_modules\next\dist\compiled\edge-runtime" 2>nul
)
if exist "%OUTPUT_DIR%\node_modules\next\dist\compiled\@edge-runtime" (
    rd /s /q "%OUTPUT_DIR%\node_modules\next\dist\compiled\@edge-runtime" 2>nul
)

:: Xoa @dicebear (khong can - chi dung API URL)
if exist "%OUTPUT_DIR%\node_modules\@dicebear" (
    rd /s /q "%OUTPUT_DIR%\node_modules\@dicebear" 2>nul
)
if exist "%OUTPUT_DIR%\node_modules\pngjs" (
    rd /s /q "%OUTPUT_DIR%\node_modules\pngjs" 2>nul
)

:: Xoa caniuse-lite (chi can cho build)
if exist "%OUTPUT_DIR%\node_modules\caniuse-lite" (
    rd /s /q "%OUTPUT_DIR%\node_modules\caniuse-lite" 2>nul
)

:: Xoa source maps
for /r "%OUTPUT_DIR%\node_modules" %%f in (*.map) do del /q "%%f" 2>nul

:: Xoa TypeScript definitions
for /r "%OUTPUT_DIR%\node_modules" %%f in (*.d.ts *.d.ts.map) do del /q "%%f" 2>nul

:: Xoa test/docs folders
for /d /r "%OUTPUT_DIR%\node_modules" %%d in (__tests__ test tests docs example examples .github) do (
    if exist "%%d" rd /s /q "%%d" 2>nul
)

:: Xoa markdown/license files trong node_modules
for /r "%OUTPUT_DIR%\node_modules" %%f in (README.md CHANGELOG.md HISTORY.md LICENSE LICENSE.md .npmignore .eslintrc* .prettierrc* tsconfig.json) do (
    del /q "%%f" 2>nul
)

:: ========================================
:: BUOC 11: Tao cac file cau hinh
:: ========================================
echo [11/12] Tao cac file cau hinh...

:: Copy .env tu .env.example hoac .env.production
if exist "%PROJECT_DIR%.env.example" (
    copy "%PROJECT_DIR%.env.example" "%OUTPUT_DIR%\.env" >nul
    echo     Da copy .env.example -^> .env
) else if exist "%PROJECT_DIR%.env.production" (
    copy "%PROJECT_DIR%.env.production" "%OUTPUT_DIR%\.env" >nul
    echo     Da copy .env.production -^> .env
) else (
    echo     [CANH BAO] Khong tim thay file .env mau!
)

:: Tao package.json don gian
(
echo {
echo   "name": "sorokids",
echo   "version": "1.0.0",
echo   "private": true,
echo   "scripts": {
echo     "start": "node server.js",
echo     "db:push": "npx prisma db push",
echo     "db:migrate": "npx prisma migrate deploy"
echo   }
echo }
) > "%OUTPUT_DIR%\package.json"

:: Tao README huong dan
(
echo # SoroKids - Linux Deployment
echo.
echo ## Yeu cau
echo - Node.js 18+ hoac 22+
echo - MySQL database ^(da co san^)
echo.
echo ## Cau hinh
echo Chinh sua file `.env` voi thong tin database cua ban.
echo.
echo ## Khoi chay
echo ```bash
echo # Neu chua co tables trong database
echo npx prisma db push
echo.
echo # Chay server
echo node server.js
echo.
echo # Hoac dung PM2 de chay background
echo pm2 start server.js --name sorokids
echo pm2 save
echo ```
echo.
echo ## Port
echo Mac dinh: 3000 ^(thay doi trong .env^)
) > "%OUTPUT_DIR%\README.md"

:: ========================================
:: BUOC 12: Kiem tra va bao cao
:: ========================================
echo [12/12] Kiem tra ket qua...
echo.
echo ============================================================
echo   KIEM TRA THU VIEN CAN THIET
echo ============================================================

set "MISSING=0"
set "TOTAL_CHECK=0"

:: Function kiem tra
call :check_item "server.js" "server.js" "Server entry point"
call :check_item ".next\server" ".next/server" "Next.js server build"
call :check_item ".next\static" ".next/static" "Static assets"
call :check_item "public" "public" "Public files"
call :check_item "prisma\schema.prisma" "prisma/schema" "Database schema"
call :check_item "node_modules\.prisma\client" "Prisma Client" "Database ORM"
call :check_item "node_modules\@prisma\client" "@prisma/client" "Prisma package"
call :check_item "node_modules\next-auth" "next-auth" "Authentication"
call :check_item "node_modules\bcryptjs" "bcryptjs" "Password hashing"
call :check_item "node_modules\jspdf" "jspdf" "PDF certificate"
call :check_item "node_modules\html2canvas" "html2canvas" "Screenshot/capture"
call :check_item "node_modules\qrcode" "qrcode" "QR code payment"
call :check_item "node_modules\lucide-react" "lucide-react" "Icons"
call :check_item "node_modules\dotenv" "dotenv" "Env variables"
call :check_item "node_modules\next" "next" "Next.js framework"
call :check_item "node_modules\react" "react" "React library"
call :check_item "node_modules\react-dom" "react-dom" "React DOM"
call :check_item ".env" ".env" "Config file"

:: Kiem tra Linux binary
echo.
echo === Prisma Linux Binary ===
if exist "%OUTPUT_DIR%\node_modules\.prisma\client\libquery_engine-debian-openssl-3.0.x.so.node" echo [OK] debian-openssl-3.0.x
if exist "%OUTPUT_DIR%\node_modules\.prisma\client\libquery_engine-debian-openssl-1.1.x.so.node" echo [OK] debian-openssl-1.1.x
if exist "%OUTPUT_DIR%\node_modules\.prisma\client\libquery_engine-rhel-openssl-3.0.x.so.node" echo [OK] rhel-openssl-3.0.x
if exist "%OUTPUT_DIR%\node_modules\.prisma\client\libquery_engine-rhel-openssl-1.1.x.so.node" echo [OK] rhel-openssl-1.1.x
if exist "%OUTPUT_DIR%\node_modules\.prisma\client\libquery_engine-linux-musl-openssl-3.0.x.so.node" echo [OK] linux-musl-openssl-3.0.x

:: Tinh dung luong
echo.
set "TOTAL_SIZE=0"
for /f "tokens=3" %%a in ('dir "%OUTPUT_DIR%" /s /-c 2^>nul ^| findstr "File(s)"') do set "TOTAL_SIZE=%%a"

:: Chuyen sang MB
set /a SIZE_MB=%TOTAL_SIZE:~0,-6% 2>nul
if "%SIZE_MB%"=="" set "SIZE_MB=0"

echo ============================================================
if "%MISSING%"=="0" (
    echo   BUILD THANH CONG!
) else (
    echo   [CANH BAO] CO %MISSING% THU VIEN BI THIEU!
)
echo ============================================================
echo.
echo   Thu muc output: %OUTPUT_DIR%
echo   Dung luong: khoang %SIZE_MB% MB
echo.
echo   HUONG DAN DEPLOY:
echo   ---------------------------------------------------------
echo   1. Chinh sua file deploy_linux\.env
echo      - DATABASE_URL: mysql://user:pass@host:3306/database
echo      - NEXTAUTH_URL: https://yourdomain.com
echo      - NEXTAUTH_SECRET: your-secret-key
echo.
echo   2. Upload thu muc deploy_linux len hosting
echo      - Dung FTP/SFTP/File Manager
echo      - Hoac nen thanh .zip roi upload
echo.
echo   3. Tren server Linux:
echo      cd /path/to/deploy_linux
echo      node server.js
echo      # Hoac: pm2 start server.js --name sorokids
echo.
echo   4. Website se chay tai port 3000 (hoac PORT trong .env)
echo ============================================================
echo.

pause
exit /b 0

:: ========================================
:: FUNCTION: Kiem tra item
:: ========================================
:check_item
set "PATH_CHECK=%OUTPUT_DIR%\%~1"
set "NAME=%~2"
set "DESC=%~3"
set /a TOTAL_CHECK+=1
if exist "%PATH_CHECK%" (
    echo [OK]    %NAME% - %DESC%
) else (
    echo [THIEU] %NAME% - %DESC%
    set /a MISSING+=1
)
exit /b 0
