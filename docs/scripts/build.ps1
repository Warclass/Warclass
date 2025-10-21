param(
    [string]$texfile = "tex\tesis.tex",
    [string]$outdir = ""
)

$texfile = $texfile -replace '/', '\\'

if ([string]::IsNullOrWhiteSpace($outdir)) {
    $outdir = Join-Path (Get-Location) "build"
} else {
    $outdir = $outdir -replace '/', '\\'
}

if ($outdir.EndsWith('\')) { $outdir = $outdir.TrimEnd('\') }

try {
    $fullTex = (Resolve-Path -LiteralPath $texfile -ErrorAction Stop).Path
} catch {
    $fullTex = (Resolve-Path -LiteralPath ($texfile + '.tex') -ErrorAction Stop).Path
}

if ($fullTex -match '(?i)\\tex\\') {
    $repoRoot = $fullTex -replace '(?i)\\tex\\.*$',''
    $texRel = $fullTex -replace '^(?i)' + [regex]::Escape($repoRoot) + '\\?',''
} else {
    $repoRoot = Split-Path $fullTex -Parent
    $texRel = $fullTex
}

Write-Host "Using repo root: $repoRoot"
Write-Host "Tex (project-relative): $texRel"
Write-Host "Output directory: $outdir"

if ([IO.Path]::IsPathRooted($outdir)) {
    $outdirFull = [IO.Path]::GetFullPath($outdir)
} else {
    $outdirFull = [IO.Path]::GetFullPath((Join-Path $repoRoot $outdir))
}

if ($outdirFull.EndsWith('\')) { $outdirFull = $outdirFull.TrimEnd('\') }

Write-Host "Resolved absolute output directory: $outdirFull"

if (-not (Test-Path -Path $outdirFull)) {
    New-Item -ItemType Directory -Path $outdirFull -Force | Out-Null
}

Push-Location $repoRoot


$latexmk = (Get-Command latexmk -ErrorAction SilentlyContinue)
if ($latexmk) {

    latexmk -pdf -interaction=nonstopmode -outdir="$outdirFull" $texRel
    $code = $LASTEXITCODE
    Pop-Location
    exit $code
}

$pdflatex = (Get-Command pdflatex -ErrorAction SilentlyContinue)
if ($pdflatex) {
    $texName = Split-Path $texRel -Leaf
    pdflatex -interaction=nonstopmode -output-directory="$outdirFull" $texRel
    bibtex "$($texName -replace '\.tex$','')" | Out-Null
    pdflatex -interaction=nonstopmode -output-directory="$outdirFull" $texRel
    pdflatex -interaction=nonstopmode -output-directory="$outdirFull" $texRel
    $code = $LASTEXITCODE
    Pop-Location
    exit $code
}

Pop-Location
Write-Error "No LaTeX engine found (latexmk or pdflatex)."
exit 1