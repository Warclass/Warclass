# Script para convertir documento LaTeX a DOCX
# Uso: .\latex-to-docx.ps1 tex\main.tex

param(
    [Parameter(Mandatory=$true)]
    [string]$InputFile
)

# Verificar que el archivo existe
if (-not (Test-Path $InputFile)) {
    Write-Error "El archivo $InputFile no existe"
    exit 1
}

# Obtener directorio del script y raíz del proyecto
$ScriptDir = Split-Path -Parent $PSCommandPath
$RootDir = Split-Path -Parent $ScriptDir
$BuildDir = Join-Path $RootDir "build"

# Crear directorio de salida si no existe
if (-not (Test-Path $BuildDir)) {
    New-Item -ItemType Directory -Path $BuildDir | Out-Null
}

# Obtener nombre base del archivo
$BaseName = [System.IO.Path]::GetFileNameWithoutExtension($InputFile)
$OutputFile = Join-Path $BuildDir "$BaseName.docx"

Write-Host "=== Conversión LaTeX a DOCX ===" -ForegroundColor Cyan
Write-Host "Archivo de entrada: $InputFile" -ForegroundColor Yellow
Write-Host "Archivo de salida: $OutputFile" -ForegroundColor Yellow

# Verificar si pandoc está instalado
$PandocPath = Get-Command pandoc -ErrorAction SilentlyContinue

if (-not $PandocPath) {
    Write-Host ""
    Write-Error "Pandoc no está instalado o no está en PATH"
    Write-Host ""
    Write-Host "Para instalar Pandoc:" -ForegroundColor Yellow
    Write-Host "1. Descargar desde: https://pandoc.org/installing.html" -ForegroundColor White
    Write-Host "2. O usar Chocolatey: choco install pandoc" -ForegroundColor White
    Write-Host "3. O usar winget: winget install --id=JohnMacFarlane.Pandoc" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "Usando Pandoc: $($PandocPath.Source)" -ForegroundColor Green

# Opciones de conversión
$PandocArgs = @(
    $InputFile,
    "-o", $OutputFile,
    "--from=latex",
    "--to=docx",
    "--standalone",
    "--number-sections",
    "--table-of-contents",
    "--toc-depth=3",
    "--shift-heading-level-by=0",
    "--highlight-style=tango",
    "--reference-doc=reference.docx"  # Opcional: plantilla de estilos
)

# Ejecutar conversión
Write-Host ""
Write-Host "Ejecutando conversión..." -ForegroundColor Cyan

try {
    # Si existe archivo de referencia, usarlo; si no, omitir esa opción
    $RefDoc = Join-Path $ScriptDir "reference.docx"
    if (-not (Test-Path $RefDoc)) {
        $PandocArgs = $PandocArgs | Where-Object { $_ -ne "--reference-doc=reference.docx" }
    }

    & pandoc $PandocArgs

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Conversión exitosa" -ForegroundColor Green
        Write-Host "Archivo generado: $OutputFile" -ForegroundColor Green
        Write-Host ""
        
        # Abrir el archivo DOCX automáticamente
        $OpenFile = Read-Host "¿Desea abrir el archivo DOCX? (S/N)"
        if ($OpenFile -eq "S" -or $OpenFile -eq "s") {
            Start-Process $OutputFile
        }
    }
    else {
        Write-Error "Error en la conversión (código: $LASTEXITCODE)"
        exit $LASTEXITCODE
    }
}
catch {
    Write-Error "Error al ejecutar Pandoc: $_"
    exit 1
}
