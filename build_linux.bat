@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo.
echo ============================================================
echo   BUILD NEXT.JS CHO LINUX SHARED HOST
echo   Sau build chi can upload va chay: node server.js
echo ============================================================
echo.

set "PROJECT_DIR=%~dp0"
set "BUILD_OUTPUT=%PROJECT_DIR%.next\standalone"
set "DEPLOY_DIR=%PROJECT_DIR%deploy_linux"

:: Kiem tra Node.js
echo [1/8] Kiem tra Node.js...
node -v >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js chua duoc cai dat!
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do echo Node.js version: %%i

:: Clean build cu
echo.
echo [2/8] Don dep build cu...
if exist "%PROJECT_DIR%.next" rmdir /s /q "%PROJECT_DIR%.next" 2>nul
if exist "%DEPLOY_DIR%" rmdir /s /q "%DEPLOY_DIR%" 2>nul
echo Done.

:: Cai dat dependencies
echo.
echo [3/8] Cai dat dependencies...
cd /d "%PROJECT_DIR%"
call npm install
if errorlevel 1 (
    echo ERROR: npm install that bai!
    exit /b 1
)

:: Generate Prisma Client
echo.
echo [4/8] Generate Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo ERROR: Prisma generate that bai!
    exit /b 1
)

:: Build Next.js
echo.
echo [5/8] Build Next.js standalone...
set NODE_ENV=production
set NEXT_TELEMETRY_DISABLED=1
call npx next build
if errorlevel 1 (
    echo ERROR: Next.js build that bai!
    exit /b 1
)

:: Kiem tra server.js
echo.
echo [6/8] Kiem tra standalone output...
if not exist "%BUILD_OUTPUT%\server.js" (
    echo ERROR: Khong tim thay .next/standalone/server.js
    exit /b 1
)
echo OK - server.js ton tai

:: Tao thu muc deploy
echo.
echo [7/8] Tao thu muc deploy_linux...
mkdir "%DEPLOY_DIR%" 2>nul

:: Copy standalone (bao gom server.js va node_modules)
xcopy "%BUILD_OUTPUT%\*" "%DEPLOY_DIR%\" /E /I /H /Y /Q

:: Copy them cac thu vien server-side can thiet (Next.js standalone co the thieu)
echo   Copy them thu vien server-side...
set "SRC_MODULES=%PROJECT_DIR%node_modules"
set "DEST_MODULES=%DEPLOY_DIR%\node_modules"

:: next-auth va dependencies
if exist "%SRC_MODULES%\next-auth" xcopy "%SRC_MODULES%\next-auth\*" "%DEST_MODULES%\next-auth\" /E /I /H /Y /Q 2>nul
if exist "%SRC_MODULES%\@auth" xcopy "%SRC_MODULES%\@auth\*" "%DEST_MODULES%\@auth\" /E /I /H /Y /Q 2>nul
if exist "%SRC_MODULES%\@panva" xcopy "%SRC_MODULES%\@panva\*" "%DEST_MODULES%\@panva\" /E /I /H /Y /Q 2>nul
if exist "%SRC_MODULES%\jose" xcopy "%SRC_MODULES%\jose\*" "%DEST_MODULES%\jose\" /E /I /H /Y /Q 2>nul
if exist "%SRC_MODULES%\oauth" xcopy "%SRC_MODULES%\oauth\*" "%DEST_MODULES%\oauth\" /E /I /H /Y /Q 2>nul
if exist "%SRC_MODULES%\openid-client" xcopy "%SRC_MODULES%\openid-client\*" "%DEST_MODULES%\openid-client\" /E /I /H /Y /Q 2>nul
if exist "%SRC_MODULES%\preact" xcopy "%SRC_MODULES%\preact\*" "%DEST_MODULES%\preact\" /E /I /H /Y /Q 2>nul
if exist "%SRC_MODULES%\preact-render-to-string" xcopy "%SRC_MODULES%\preact-render-to-string\*" "%DEST_MODULES%\preact-render-to-string\" /E /I /H /Y /Q 2>nul
if exist "%SRC_MODULES%\cookie" xcopy "%SRC_MODULES%\cookie\*" "%DEST_MODULES%\cookie\" /E /I /H /Y /Q 2>nul
if exist "%SRC_MODULES%\uuid" xcopy "%SRC_MODULES%\uuid\*" "%DEST_MODULES%\uuid\" /E /I /H /Y /Q 2>nul

:: bcryptjs cho password hashing
if exist "%SRC_MODULES%\bcryptjs" xcopy "%SRC_MODULES%\bcryptjs\*" "%DEST_MODULES%\bcryptjs\" /E /I /H /Y /Q 2>nul

:: qrcode cho server-side rendering (neu can)
if exist "%SRC_MODULES%\qrcode" xcopy "%SRC_MODULES%\qrcode\*" "%DEST_MODULES%\qrcode\" /E /I /H /Y /Q 2>nul
if exist "%SRC_MODULES%\dijkstrajs" xcopy "%SRC_MODULES%\dijkstrajs\*" "%DEST_MODULES%\dijkstrajs\" /E /I /H /Y /Q 2>nul
if exist "%SRC_MODULES%\encode-utf8" xcopy "%SRC_MODULES%\encode-utf8\*" "%DEST_MODULES%\encode-utf8\" /E /I /H /Y /Q 2>nul
if exist "%SRC_MODULES%\pngjs" xcopy "%SRC_MODULES%\pngjs\*" "%DEST_MODULES%\pngjs\" /E /I /H /Y /Q 2>nul

:: Copy .next/static
mkdir "%DEPLOY_DIR%\.next\static" 2>nul
xcopy "%PROJECT_DIR%.next\static\*" "%DEPLOY_DIR%\.next\static\" /E /I /H /Y /Q

:: Copy public
if exist "%PROJECT_DIR%public" (
    mkdir "%DEPLOY_DIR%\public" 2>nul
    xcopy "%PROJECT_DIR%public\*" "%DEPLOY_DIR%\public\" /E /I /H /Y /Q
)

:: Copy prisma schema
mkdir "%DEPLOY_DIR%\prisma" 2>nul
copy "%PROJECT_DIR%prisma\schema.prisma" "%DEPLOY_DIR%\prisma\" /Y >nul

:: TOI UU DUNG LUONG - Xoa cac file khong can thiet
echo.
echo [8/10] Toi uu dung luong...

:: Xoa Prisma binaries khong dung (chi giu linux)
echo   Xoa Prisma Windows/Mac binaries...
del /s /q "%DEPLOY_DIR%\node_modules\*windows*" 2>nul
del /s /q "%DEPLOY_DIR%\node_modules\*darwin*" 2>nul
del /s /q "%DEPLOY_DIR%\node_modules\*win32*" 2>nul
del /s /q "%DEPLOY_DIR%\node_modules\*macos*" 2>nul

:: Chi giu 1 Prisma Linux binary (debian-openssl-3.0.x la pho bien nhat)
echo   Giu lai chi 1 Prisma Linux binary (debian-openssl-3.0.x)...
del /q "%DEPLOY_DIR%\node_modules\.prisma\client\libquery_engine-linux-musl*" 2>nul
del /q "%DEPLOY_DIR%\node_modules\.prisma\client\libquery_engine-rhel*" 2>nul
del /q "%DEPLOY_DIR%\node_modules\.prisma\client\libquery_engine-debian-openssl-1.1*" 2>nul
del /q "%DEPLOY_DIR%\node_modules\@prisma\engines\libquery_engine-linux-musl*" 2>nul
del /q "%DEPLOY_DIR%\node_modules\@prisma\engines\libquery_engine-rhel*" 2>nul
del /q "%DEPLOY_DIR%\node_modules\@prisma\engines\libquery_engine-debian-openssl-1.1*" 2>nul

:: Xoa cac file doc, test, typescript definitions
echo   Xoa README, LICENSE, test files...
del /s /q "%DEPLOY_DIR%\node_modules\*.md" 2>nul
del /s /q "%DEPLOY_DIR%\node_modules\*.map" 2>nul
del /s /q "%DEPLOY_DIR%\node_modules\LICENSE*" 2>nul
del /s /q "%DEPLOY_DIR%\node_modules\CHANGELOG*" 2>nul

:: Xoa cac thu muc test, docs, examples
for /d /r "%DEPLOY_DIR%\node_modules" %%d in (test tests __tests__ docs example examples .github) do (
    if exist "%%d" rmdir /s /q "%%d" 2>nul
)

:: Xoa components folder (khong can trong standalone)
if exist "%DEPLOY_DIR%\components" rmdir /s /q "%DEPLOY_DIR%\components" 2>nul

:: Xoa .env.production neu co
if exist "%DEPLOY_DIR%\.env.production" del /q "%DEPLOY_DIR%\.env.production" 2>nul

echo   Done.

:: Copy .env.example thanh .env (file cau hinh production)
echo.
echo [9/10] Copy file .env...
if exist "%PROJECT_DIR%.env.example" (
    copy "%PROJECT_DIR%.env.example" "%DEPLOY_DIR%\.env" /Y >nul
    echo Da copy .env.example thanh .env
) else if exist "%PROJECT_DIR%.env" (
    copy "%PROJECT_DIR%.env" "%DEPLOY_DIR%\.env" /Y >nul
    echo Da copy .env tu project
    echo LUU Y: Kiem tra lai DATABASE_URL trong deploy_linux\.env truoc khi upload!
) else (
    echo CANH BAO: Khong tim thay file .env
    echo Tao file .env mau...
    (
        echo NODE_ENV=production
        echo DATABASE_URL="mysql://username:password@localhost:3306/database"
        echo NEXTAUTH_URL="https://yourdomain.com"
        echo NEXTAUTH_SECRET="your-secret-key-min-32-characters"
        echo PORT=3000
        echo HOSTNAME=0.0.0.0
    ) > "%DEPLOY_DIR%\.env"
    echo Da tao .env mau - CAN CHINH SUA TRUOC KHI UPLOAD!
)

:: Kiem tra ket qua
echo.
echo [10/10] Kiem tra ket qua...

set "OK=1"
if exist "%DEPLOY_DIR%\server.js" (echo [OK] server.js) else (echo [THIEU] server.js & set "OK=0")
if exist "%DEPLOY_DIR%\.next\static" (echo [OK] .next/static/) else (echo [THIEU] .next/static/ & set "OK=0")
if exist "%DEPLOY_DIR%\node_modules" (echo [OK] node_modules/) else (echo [THIEU] node_modules/ & set "OK=0")
if exist "%DEPLOY_DIR%\public" (echo [OK] public/) else (echo [CANH BAO] public/)
if exist "%DEPLOY_DIR%\.env" (echo [OK] .env) else (echo [THIEU] .env & set "OK=0")

:: Kiem tra Prisma Linux binary
echo.
echo Kiem tra Prisma Linux binary...
dir /s /b "%DEPLOY_DIR%\node_modules\*linux*" 2>nul | findstr /i "libquery" >nul
if errorlevel 1 (
    echo [CANH BAO] Khong tim thay Prisma Linux binary
) else (
    echo [OK] Prisma Linux binary
)

echo.
echo ============================================================
if "%OK%"=="1" (
    echo   BUILD THANH CONG!
    echo ============================================================
    echo.
    echo   Output: deploy_linux\
    echo.
    echo   TRUOC KHI UPLOAD, KIEM TRA FILE deploy_linux\.env:
    echo   - DATABASE_URL: thong tin MySQL tren host
    echo   - NEXTAUTH_URL: domain cua ban
    echo   - NEXTAUTH_SECRET: key bi mat
    echo.
    echo   DEPLOY:
    echo   1. Upload TOAN BO thu muc deploy_linux len host
    echo   2. SSH vao host, cd vao thu muc
    echo   3. Chay: node server.js
    echo.
    echo   Web se chay tai port 3000
) else (
    echo   BUILD THAT BAI - Kiem tra lai cac file thieu
    exit /b 1
)

echo.
endlocal
pause
