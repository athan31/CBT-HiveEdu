# Catalyst CBT Engine — Start Script
# Jalankan script ini untuk memulai backend dan frontend sekaligus

Write-Host "Starting Catalyst CBT Engine..." -ForegroundColor Cyan
Write-Host ""

# Start Backend
Write-Host "Starting Backend on Port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\backend'; node src/index.js" -WindowStyle Normal

Start-Sleep -Seconds 2

# Start Frontend
Write-Host "Starting Frontend on Port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\frontend'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Catalyst CBT Engine is running!" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend  : http://localhost:5173" -ForegroundColor White
Write-Host "  Backend   : http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "  Admin    : admin@catalyst.id / admin123" -ForegroundColor Cyan
Write-Host "  Peserta  : budi@test.id / peserta123" -ForegroundColor Cyan
Write-Host ""
