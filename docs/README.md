# Proyecto tesis

## Estructura

- tex/: archivos LaTeX fuente
- tex/chapters/: capítulos separados
- bib/: archivo BibTeX
- images/: imágenes y figuras
- build/: salida de compilación (no versionada)
- scripts/: scripts auxiliares (build.ps1)

## Compilar localmente (PowerShell)

```powershell
scripts\build.ps1 tex\tesis.tex
```

## Requisitos

- MiKTeX o TeX Live instalados
- latexmk (recomendado) o pdflatex
- Perl (si usas MiKTeX+latexmk en Windows)
