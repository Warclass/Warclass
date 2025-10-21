# Setup - Sistema de Personajes 3D

## 📋 Prerrequisitos

- Node.js 18+ 
- npm o yarn

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/AbelMSG89/Warclass.git
cd Warclass/web
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. **IMPORTANTE: Copiar modelos 3D**

Los modelos 3D están en `assets/` pero deben copiarse a `public/` para que Next.js pueda servirlos.

#### Opción A: Script automático (Recomendado)

**Windows (PowerShell):**
```bash
.\scripts\copy-models.ps1
```

**Linux/Mac:**
```bash
chmod +x scripts/copy-models.sh
./scripts/copy-models.sh
```

#### Opción B: Manual

**Windows:**
```bash
xcopy /E /I /Y assets\character_scene public\character_scene
xcopy /E /I /Y assets\welcome_scene public\welcome_scene
```

**Linux/Mac:**
```bash
cp -r assets/character_scene public/
cp -r assets/welcome_scene public/
```

### 4. Ejecutar servidor de desarrollo

```bash
npm run dev
```

### 5. Abrir en navegador

```
http://localhost:3000/character
```

## 📁 Estructura de Rutas

Después de copiar los modelos, tu estructura debe verse así:

```
web/
├── assets/                      # ← Modelos originales (no servidos)
│   ├── character_scene/
│   └── welcome_scene/
├── public/                      # ← Modelos copiados (servidos por Next.js)
│   ├── character_scene/         # ✅ Debe existir
│   │   └── models/
│   │       ├── Ambience/
│   │       └── Character/
│   └── welcome_scene/           # ✅ Debe existir
│       └── models/
└── ...
```

## ❓ Solución de Problemas

### Error: 404 Not Found al cargar modelos

**Problema:** Los modelos no se encuentran en `/public`

**Solución:** Ejecuta el script de copia de modelos (paso 3)

```bash
# Verificar que existan
ls public/models/character_scene/     # Linux/Mac
dir public\character_scene\models\    # Windows

# Si no existen, ejecutar script
.\scripts\copy-models.ps1             # Windows
./scripts/copy-models.sh              # Linux/Mac
```

### Modelos no se actualizan

**Problema:** Cambios en `assets/` no se reflejan

**Solución:** Volver a ejecutar el script de copia

```bash
.\scripts\copy-models.ps1   # Windows
./scripts/copy-models.sh    # Linux/Mac
```

### Error de TypeScript

**Problema:** Errores de tipos

**Solución:** 
```bash
npm run build   # Verificar compilación
```

## 🔄 Workflow de Desarrollo

1. **Primera vez:**
   ```bash
   npm install
   .\scripts\copy-models.ps1  # o .sh
   npm run dev
   ```

2. **Desarrollo normal:**
   ```bash
   npm run dev
   ```

3. **Después de actualizar modelos en `assets/`:**
   ```bash
   .\scripts\copy-models.ps1  # o .sh
   # Recarga automática en el navegador
   ```

4. **Antes de commit:**
   ```bash
   npm run lint
   npm run build
   ```

## 📝 Notas

- Los modelos en `assets/` son la fuente original
- Los modelos en `public/` son copias para Next.js
- No editar directamente en `public/`, siempre en `assets/`
- Los modelos en `public/` pueden ser ignorados en git si son pesados
- El script de copia es idempotente (puede ejecutarse múltiples veces)

## 📚 Documentación Adicional

- **Sistema completo**: [CHARACTER_SYSTEM.md](./docs/CHARACTER_SYSTEM.md)
- **Migración**: [MIGRATION_SUMMARY.md](./docs/MIGRATION_SUMMARY.md)
- **API Reference**: Ver archivos con JSDoc

## ✅ Checklist de Setup

- [ ] Node.js 18+ instalado
- [ ] Repositorio clonado
- [ ] `npm install` ejecutado
- [ ] **Modelos copiados a public/**
- [ ] `npm run dev` funciona
- [ ] http://localhost:3000/character carga correctamente
- [ ] Animaciones funcionan (botones Accept/Reject)

---

**¡Listo para desarrollar! 🚀**
