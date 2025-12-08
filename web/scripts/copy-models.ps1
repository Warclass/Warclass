# Script para copiar modelos 3D de assets/ a public/
# Windows PowerShell

Write-Host "Copiando modelos 3D de assets/ a public/..." -ForegroundColor Cyan

# Crear directorio public si no existe
if (!(Test-Path "public")) {
    New-Item -ItemType Directory -Path "public" | Out-Null
}

# Copiar character_scene
if (Test-Path "assets\character_scene") {
    Write-Host "Copiando character_scene..." -ForegroundColor Yellow
    Copy-Item -Path "assets\character_scene" -Destination "public\" -Recurse -Force
    Write-Host "✓ character_scene copiado" -ForegroundColor Green
} else {
    Write-Host "✗ assets\character_scene no encontrado" -ForegroundColor Red
}

# Copiar welcome_scene
if (Test-Path "assets\welcome_scene") {
    Write-Host "Copiando welcome_scene..." -ForegroundColor Yellow
    Copy-Item -Path "assets\welcome_scene" -Destination "public\" -Recurse -Force
    Write-Host "✓ welcome_scene copiado" -ForegroundColor Green
} else {
    Write-Host "✗ assets\welcome_scene no encontrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "Proceso completado!" -ForegroundColor Cyan
Write-Host "Los modelos 3D ahora están disponibles en public/" -ForegroundColor Green
