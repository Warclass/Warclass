# 📚 Contexto del Proyecto: Warclass - Aplicación Educativa 3D Gamificada

> **Documento de referencia rápida** para entender la estructura, contenido y contexto completo del proyecto de tesis.

---

## 🎯 Visión General del Proyecto

### Título Completo
**"Desarrollo de una aplicación educativa 3D para la gamificación de tareas en contextos educativos secundarios, institucionales y universitarios"**

### Autores
- **Fernando Marcos Chocce Janampa**
- **Abel Mauricio Santisteban Gamboa**

### Institución
**Instituto Superior Tecnológico TECSUP** - Departamento de Tecnología Digital

### Asesores
- Elliot Garamendi
- Jaime Gómez

### Año
2025 (Lima - Perú)

---

## 🎮 ¿Qué es Warclass?

Warclass es una **plataforma educativa 3D gamificada** que transforma el aprendizaje tradicional en una experiencia inmersiva tipo RPG medieval. El sistema convierte tareas académicas en **misiones y aventuras** dentro de un entorno virtual, aumentando la motivación estudiantil y reduciendo el uso de "atajos digitales" que evitan el aprendizaje genuino.

### Problema que Resuelve

**Situación actual:**
- Los estudiantes perciben las tareas como irrelevantes para su vida real
- Priorizan **aprobar sobre aprender**
- Usan herramientas digitales (IA, buscadores) como **atajos académicos** sin comprender el contenido
- Resultado: aprendizaje superficial sin retención ni comprensión real

**Solución propuesta:**
- Transformar tareas en experiencias gamificadas atractivas
- Convertir herramientas digitales en **facilitadores** del aprendizaje
- Generar motivación intrínseca mediante recompensas, progresión y narrativa
- Crear relevancia práctica percibida por los estudiantes

---

## 📁 Estructura del Repositorio

### Archivo Principal
```
tex/main.tex
```
Este es el **archivo raíz** que orquesta toda la tesis. Usa la clase `apa7` (formato APA 7ª edición).

### Configuración
```
tex/config.tex
```
Contiene todos los paquetes LaTeX y configuraciones comunes (babel español, gráficos, tablas, etc.).

### Capítulos (en orden de inclusión)
```
tex/chapters/
├── 01-resumen.tex          # Resumen ejecutivo y palabras clave
├── 02-introduccion.tex     # Contexto, justificación y estructura
├── 03-diagnostico.tex      # Planteamiento del problema, objetivos, alcance
├── 04-marco.tex            # Marco teórico y estado del arte
├── 05-propuesta.tex        # Arquitectura, diagramas, prototipos
├── 06-desarrollo.tex       # Implementación técnica
├── 07-producto-final.tex   # Resultados y demostración
└── 08-conclusiones.tex     # Conclusiones y recomendaciones
```

### Bibliografía
```
bib/references.bib
```
Archivo BibTeX con todas las referencias académicas (APA 7).

### Recursos
```
images/                # Figuras, diagramas, capturas de pantalla
scripts/build.ps1      # Script PowerShell para compilar el PDF
scripts/build.sh       # Script Bash para compilar el PDF
```

### Salida de Compilación
```
build/                 # Carpeta de salida (NO versionada)
├── main.pdf          # PDF final generado
└── aux/              # Archivos auxiliares (.aux, .bbl, .log, etc.)
```

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

#### Frontend
- **Framework**: Next.js (React + TypeScript)
- **Renderizado 3D**: Three.js
- **Interfaz**: Componentes React responsivos
- **Diseño**: Figma (prototipos)

#### Backend
- **API**: Next.js API Routes (TypeScript)
- **Autenticación**: OAuth2 (Google/Microsoft) + JWT
- **ORM**: Prisma (opcional, según implementación)

#### Base de Datos
- **Motor**: PostgreSQL
- **Cloud**: AWS (RDS o similar)
- **Estructura**: Relacional (usuarios, cursos, misiones, evaluaciones, progreso)

#### Integraciones
- **Canvas LMS**: Importación/exportación de cursos y calificaciones
- **Discord**: Canales de comunicación y notificaciones
- **Push Notifications**: Notificaciones en tiempo real

#### Infraestructura
- **Despliegue**: Vercel / AWS Cloud
- **Contenedores**: Docker
- **Orquestación**: Kubernetes (opcional según escala)

### Componentes Principales

1. **Sistema de Autenticación**
   - Registro y login seguro
   - OAuth2 con correos institucionales
   - Tokens JWT (access + refresh)

2. **Entorno Virtual 3D**
   - Mundo medieval inmersivo
   - Personajes y avatares personalizables
   - Interacciones y narrativa contextualizada

3. **Gestión de Misiones**
   - Creación por docentes
   - Asignación a estudiantes
   - Ejecución en entorno 3D
   - Evaluación y retroalimentación

4. **Sistema de Recompensas**
   - Puntos de experiencia (XP)
   - Niveles y progresión
   - Logros y reconocimientos
   - Personalización de avatar

5. **Analítica Educativa**
   - Dashboard para docentes
   - Seguimiento de progreso
   - Métricas de engagement
   - Identificación de dificultades

---

## 📊 Estructura de la Tesis

### Capítulo I: Diagnóstico
**Contenido clave:**
- Planteamiento del problema educativo actual
- Análisis de causas (Diagrama Ishikawa)
- Objetivos general y específicos
- Alcance funcional de la solución

**Conceptos importantes:**
- Desalineamiento entre tareas y percepción de relevancia
- Uso de herramientas digitales como "atajos"
- Aprendizaje superficial vs. comprensión profunda
- Falta de motivación intrínseca

### Capítulo II: Introducción
**Contenido clave:**
- Contextualización en la era digital
- Paradoja tecnológica educativa
- Justificación de la gamificación
- Estructura del documento

### Capítulo III: Propuesta
**Contenido clave:**
- Descripción detallada de la solución
- Diagrama de arquitectura técnica
- Diagramas BPMN de procesos de negocio
- Modelo entidad-relación (MER)
- Prototipos de interfaces (Figma)

**Procesos BPMN documentados:**
1. Gestión de misiones educativas
2. Sistema de evaluación gamificada
3. Análisis y seguimiento del progreso

### Capítulo IV: Marco Teórico
**Temas esperados:**
- Teorías de gamificación educativa
- Motivación intrínseca (Teoría de Autodeterminación - Deci & Ryan)
- Tecnologías inmersivas en educación
- Estado del arte en plataformas educativas 3D

### Capítulo V: Desarrollo
**Contenido esperado:**
- Metodología de desarrollo (Scrum, DevOps, etc.)
- Implementación de componentes
- Pruebas y validación
- Iteraciones y mejoras

### Capítulo VI: Producto Final
**Contenido esperado:**
- Demostración del sistema funcionando
- Casos de uso implementados
- Resultados de pruebas con usuarios
- Métricas de efectividad

### Capítulo VII: Conclusiones
**Contenido esperado:**
- Logros alcanzados vs. objetivos
- Lecciones aprendidas
- Limitaciones identificadas
- Trabajo futuro y recomendaciones

---

## 🔨 Compilación del Documento

### Requisitos Previos
- **Windows**: MiKTeX o TeX Live instalado
- **Herramientas**: `latexmk` (recomendado) o `pdflatex` + `bibtex`
- **Shell**: PowerShell (Windows) o Bash (Linux/Mac)

### Comando de Compilación (PowerShell)
```powershell
# Desde la raíz del repositorio
scripts\build.ps1 tex\main.tex
```

### Proceso de Compilación
1. El script detecta automáticamente `latexmk` o usa `pdflatex`
2. Ejecuta las pasadas necesarias para bibliografía (BibTeX)
3. Genera `build/main.pdf` y archivos auxiliares en `build/aux/`

### Verificación Post-Compilación
✅ **Checks obligatorios:**
- Verificar que `build/main.pdf` se genera sin errores
- Revisar logs en `build/aux/main.log` para advertencias
- Comprobar que referencias bibliográficas aparecen correctamente
- Validar que todas las imágenes se cargan (no hay placeholders vacíos)

---

## 📚 Referencias Bibliográficas Clave

### Principales Citas Utilizadas

1. **Deci & Ryan (2017)** - Teoría de Autodeterminación y motivación intrínseca
2. **Chen et al. (2023)** - Impacto de gamificación en cognición, emociones y motivación
3. **Martínez et al. (2023)** - Herramientas digitales e integridad académica
4. **Saputra et al. (2025)** - Tendencias en gamificación para educación científica
5. **Coelho et al. (2025)** - Gamificación educativa controlada
6. **Nurhayati et al. (2025)** - Metodologías de aprendizaje interactivo
7. **Sappaile et al. (2024)** - Orientación a resultados vs. aprendizaje
8. **Rahmi et al. (2025)** - Comprensión superficial vs. profunda

### Archivo BibTeX
Todas las referencias están en formato APA 7 en:
```
bib/references.bib
```

---

## 🎨 Convenciones y Reglas

### Codificación
- **UTF-8** obligatorio
- Usar `\cite{}` para citas
- Escapar caracteres especiales LaTeX (`&`, `%`, `_`, etc.)

### Estructura Modular
- Cada capítulo es un archivo independiente en `tex/chapters/`
- Usar `\include{tex/chapters/XX-nombre}` desde `main.tex`
- NO modificar `tex/config.tex` sin documentar el motivo

### Control de Versiones
- **NO** versionar carpeta `build/`
- **NO** versionar archivos `.aux`, `.log`, `.bbl`, `.blg`, `.toc`, etc.
- **SÍ** versionar `.tex`, `.bib`, imágenes y scripts

### Clase de Documento
```latex
\documentclass[stu,12pt,letterpaper,donotrepeattitle,floatsintext,natbib]{apa7}
```
**NO cambiar** la clase `apa7` salvo indicación explícita del asesor.

---

## 🚀 Flujo de Trabajo Recomendado

### Para Editar Contenido
1. Abrir el capítulo correspondiente en `tex/chapters/`
2. Editar el contenido LaTeX
3. Guardar (UTF-8)
4. Compilar: `scripts\build.ps1 tex\main.tex`
5. Revisar `build/main.pdf`
6. Iterar hasta satisfacción

### Para Agregar Referencias
1. Buscar la cita en formato BibTeX
2. Agregar entrada a `bib/references.bib`
3. Citar en el texto: `\cite{clave2025}`
4. Compilar para regenerar bibliografía

### Para Agregar Imágenes
1. Guardar imagen en `images/`
2. Usar en LaTeX:
```latex
\begin{figure}[H]
    \centering
    \includegraphics[width=0.8\textwidth]{images/nombre.png}
    \caption{Descripción de la figura.}
    \label{fig:etiqueta}
\end{figure}
```
3. Referenciar: `Figura \ref{fig:etiqueta}`

---

## 🐛 Solución de Problemas Comunes

### Error: "No LaTeX engine found"
**Solución:**
- Instalar MiKTeX o TeX Live
- Agregar `pdflatex` y `bibtex` al PATH de Windows

### Error: "Undefined control sequence"
**Solución:**
- Revisar paquetes en `tex/config.tex`
- Asegurar que comandos personalizados estén definidos

### Error: Caracteres raros en el PDF
**Solución:**
- Guardar archivos en UTF-8
- Verificar que `\usepackage[utf8]{inputenc}` esté en `config.tex`

### Error: Referencias no aparecen
**Solución:**
- Ejecutar compilación completa:
  ```
  pdflatex → bibtex → pdflatex → pdflatex
  ```
- O usar `latexmk` que hace todo automáticamente

### Error: Imagen no carga
**Solución:**
- Verificar ruta relativa desde `tex/main.tex`
- Usar rutas como `images/nombre.png` (sin `./`)
- Asegurar que el archivo existe y tiene extensión correcta

---

## 📝 Palabras Clave del Proyecto

- Gamificación educativa
- Entorno virtual 3D
- Aprendizaje interactivo
- Motivación estudiantil
- Personalización educativa
- Análisis de aprendizaje
- Educación secundaria
- Educación universitaria
- Three.js
- Next.js
- PostgreSQL
- Canvas LMS
- Discord

---

## 🎓 Contexto Académico

### Tipo de Documento
**Proyecto de fin de carrera** (Tesis de grado)

### Área de Conocimiento
Tecnología Digital / Desarrollo de Software / Tecnología Educativa

### Modalidad
Desarrollo de software aplicado a educación

### Formato
APA 7ª edición (clase `apa7` de LaTeX)

### Idioma
Español (España/Latinoamérica)

---

## 🔮 Trabajo Futuro Potencial

**Ideas para extensiones (documentar en conclusiones):**
- Integración con más LMS (Moodle, Blackboard)
- Modo multijugador colaborativo
- IA adaptativa para dificultad dinámica
- Realidad virtual (VR) y realidad aumentada (AR)
- Soporte para más idiomas
- Blockchain para certificaciones y logros
- Analítica predictiva con Machine Learning

---

## 📞 Recursos Adicionales

### Documentación de Referencia
- [Guía APA 7](https://normas-apa.org/)
- [Documentación apa7 LaTeX](https://ctan.math.washington.edu/tex-archive/macros/latex/contrib/apa7/apa7.pdf)
- [Three.js Documentation](https://threejs.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)

### Herramientas Utilizadas
- **Editor LaTeX**: VS Code + LaTeX Workshop (recomendado)
- **Diseño**: Figma
- **Diagramas**: Bizagi Modeler (BPMN), Draw.io, Lucidchart
- **Control de versiones**: Git

---

## ✅ Checklist Antes de Entregar

- [ ] Compilación exitosa sin errores
- [ ] Todas las referencias citadas aparecen en bibliografía
- [ ] Todas las figuras tienen caption y están referenciadas
- [ ] Numeración de páginas correcta (romano para índices, árabe para contenido)
- [ ] Ortografía y gramática revisadas
- [ ] Formato APA 7 respetado
- [ ] Metadatos de portada correctos (título, autores, institución, fecha)
- [ ] Archivos no versionables eliminados del repositorio
- [ ] README.md actualizado con instrucciones claras
- [ ] Scripts de compilación funcionando en Windows

---

**Última actualización:** Diciembre 2025  
**Mantenido por:** Fernando Chocce & Abel Santisteban  
**Propósito:** Documento de referencia rápida para recuperar contexto del proyecto
