@echo off
echo ========================================
echo LEADTOOLS Compression Suite Deployment
echo ========================================
echo.

REM Step 1: Build Frontend
echo [1/4] Building frontend...
cd frontend
call npm install
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)
cd ..

REM Step 2: Copy frontend build to backend wwwroot
echo [2/4] Copying frontend to backend...
if not exist "backend\wwwroot" mkdir "backend\wwwroot"
xcopy /E /I /Y "frontend\dist\*" "backend\wwwroot\"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to copy frontend files!
    pause
    exit /b 1
)

REM Step 3: Publish backend
echo [3/4] Publishing backend...
cd backend
dotnet publish -c Release -r win-x64 --self-contained false -o ./publish
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Backend publish failed!
    pause
    exit /b 1
)
cd ..

REM Step 4: Create deployment package
echo [4/4] Creating deployment package...
cd backend\publish
powershell Compress-Archive -Path * -DestinationPath ..\..\leadtools-deployment.zip -Force
cd ..\..

echo.
echo ========================================
echo Deployment package created successfully!
echo Location: leadtools-deployment.zip
echo ========================================
echo.
echo Next steps:
echo 1. Upload leadtools-deployment.zip to Somee.com
echo 2. Extract it in the wwwroot folder
echo 3. Configure .NET version in Somee.com control panel
echo.
pause
