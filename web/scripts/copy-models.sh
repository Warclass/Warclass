#!/bin/bash
# Script para copiar modelos 3D de assets/ a public/
# Linux/Mac

echo "Copiando modelos 3D de assets/ a public/..."

# Crear directorio public si no existe
mkdir -p public

# Copiar character_scene
if [ -d "assets/character_scene" ]; then
    echo "Copiando character_scene..."
    cp -r assets/character_scene public/
    echo "✓ character_scene copiado"
else
    echo "✗ assets/character_scene no encontrado"
fi

# Copiar welcome_scene
if [ -d "assets/welcome_scene" ]; then
    echo "Copiando welcome_scene..."
    cp -r assets/welcome_scene public/
    echo "✓ welcome_scene copiado"
else
    echo "✗ assets/welcome_scene no encontrado"
fi

echo ""
echo "Proceso completado!"
echo "Los modelos 3D ahora están disponibles en public/"
