#!/bin/bash
# Script para convertir documento LaTeX a DOCX
# Uso: ./latex-to-docx.sh tex/main.tex

set -e  # Salir si hay error

# Verificar argumentos
if [ $# -eq 0 ]; then
    echo "Error: Se requiere especificar el archivo LaTeX"
    echo "Uso: $0 archivo.tex"
    exit 1
fi

INPUT_FILE="$1"

# Verificar que el archivo existe
if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: El archivo $INPUT_FILE no existe"
    exit 1
fi

# Obtener directorio del script y raíz del proyecto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$ROOT_DIR/build"

# Crear directorio de salida si no existe
mkdir -p "$BUILD_DIR"

# Obtener nombre base del archivo
BASE_NAME=$(basename "$INPUT_FILE" .tex)
OUTPUT_FILE="$BUILD_DIR/$BASE_NAME.docx"

echo "=== Conversión LaTeX a DOCX ==="
echo "Archivo de entrada: $INPUT_FILE"
echo "Archivo de salida: $OUTPUT_FILE"

# Verificar si pandoc está instalado
if ! command -v pandoc &> /dev/null; then
    echo ""
    echo "Error: Pandoc no está instalado"
    echo ""
    echo "Para instalar Pandoc:"
    echo "  Ubuntu/Debian: sudo apt-get install pandoc"
    echo "  macOS: brew install pandoc"
    echo "  O descarga desde: https://pandoc.org/installing.html"
    echo ""
    exit 1
fi

echo "Usando Pandoc: $(which pandoc)"
echo "Versión: $(pandoc --version | head -n1)"

# Opciones de conversión
PANDOC_ARGS=(
    "$INPUT_FILE"
    -o "$OUTPUT_FILE"
    --from=latex
    --to=docx
    --standalone
    --number-sections
    --toc
    --toc-depth=3
    --highlight-style=tango
)

# Si existe archivo de referencia, usarlo
REF_DOC="$SCRIPT_DIR/reference.docx"
if [ -f "$REF_DOC" ]; then
    PANDOC_ARGS+=(--reference-doc="$REF_DOC")
fi

# Ejecutar conversión
echo ""
echo "Ejecutando conversión..."

pandoc "${PANDOC_ARGS[@]}"

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Conversión exitosa"
    echo "Archivo generado: $OUTPUT_FILE"
    echo ""
    
    # Abrir el archivo DOCX automáticamente (Linux/macOS)
    if command -v xdg-open &> /dev/null; then
        read -p "¿Desea abrir el archivo DOCX? (s/N): " OPEN_FILE
        if [[ "$OPEN_FILE" =~ ^[Ss]$ ]]; then
            xdg-open "$OUTPUT_FILE" &
        fi
    elif command -v open &> /dev/null; then
        read -p "¿Desea abrir el archivo DOCX? (s/N): " OPEN_FILE
        if [[ "$OPEN_FILE" =~ ^[Ss]$ ]]; then
            open "$OUTPUT_FILE"
        fi
    fi
else
    echo "Error en la conversión"
    exit 1
fi
