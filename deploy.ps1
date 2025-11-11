Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LEADTOOLS Compression Suite Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build Frontend
Write-Host "[1/4] Building frontend..." -ForegroundColor Yellow
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install failed!" -ForegroundColor Red
    Set-Location ..
    Read-Host "Press Enter to exit"
    exit 1
}

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend build failed!" -ForegroundColor Red
    Set-Location ..
    Read-Host "Press Enter to exit"
    exit 1
}
Set-Location ..

# Step 2: Copy frontend build to backend wwwroot
Write-Host "[2/4] Copying frontend to backend..." -ForegroundColor Yellow
if (-not (Test-Path "backend\wwwroot")) {
    New-Item -ItemType Directory -Path "backend\wwwroot" | Out-Null
}

Copy-Item -Path "frontend\dist\*" -Destination "backend\wwwroot\" -Recurse -Force
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to copy frontend files!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 3: Publish backend
Write-Host "[3/4] Publishing backend..." -ForegroundColor Yellow
Set-Location backend
dotnet publish -c Release -r win-x64 --self-contained false -o ./publish
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend publish failed!" -ForegroundColor Red
    Set-Location ..
    Read-Host "Press Enter to exit"
    exit 1
}
Set-Location ..

# Step 4: Create deployment package
Write-Host "[4/4] Creating deployment package..." -ForegroundColor Yellow
if (Test-Path "leadtools-deployment.zip") {
    Remove-Item "leadtools-deployment.zip" -Force
}

Compress-Archive -Path "backend\publish\*" -DestinationPath "leadtools-deployment.zip" -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment package created successfully!" -ForegroundColor Green
Write-Host "Location: leadtools-deployment.zip" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Upload leadtools-deployment.zip to Somee.com" -ForegroundColor White
Write-Host "2. Extract it in the wwwroot folder" -ForegroundColor White
Write-Host "3. Configure .NET version in Somee.com control panel" -ForegroundColor White
Write-Host ""
Write-Host "FTP Details:" -ForegroundColor Cyan
Write-Host "Host: 192.52.242.121" -ForegroundColor White
Write-Host "Username: baraamashaal" -ForegroundColor White
Write-Host "Target: www.leadtools.somee.com" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"
