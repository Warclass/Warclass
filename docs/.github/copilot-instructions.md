# Instrucciones del repositorio para Copilot — Proyecto Warclass

## 🎯 Visión General del Proyecto

**Warclass** es un proyecto académico de tesis que desarrolla una **aplicación educativa 3D gamificada** para transformar tareas académicas en experiencias inmersivas tipo RPG medieval. El proyecto consta de:

1. **Documentación de Tesis (LaTeX)**: Tesis completa en formato APA 7 usando la clase `apa7`
2. **Aplicación Web (Next.js)**: Plataforma educativa 3D interactiva
3. **Aplicación Móvil (React Native - Futuro)**: Extensión móvil de la plataforma

### Autores y Contexto
- **Autores**: Fernando Marcos Chocce Janampa & Abel Mauricio Santisteban Gamboa
- **Institución**: Instituto Superior Tecnológico TECSUP - Departamento de Tecnología Digital
- **Año**: 2025 (Lima - Perú)
- **Asesores**: Elliot Garamendi, Jaime Gómez

### Problema que Resuelve
Warclass transforma el aprendizaje tradicional donde los estudiantes usan herramientas digitales como "atajos académicos" sin comprender el contenido, en una experiencia gamificada que genera motivación intrínseca mediante recompensas, progresión y narrativa educativa.

## Estructura importante (rutas relativas al root del repo)

### 📁 Estructura General del Repositorio

```
Warclass/
├── archived/              # Proyecto Laravel original (REFERENCIA)
│   ├── app/              # Modelos, controladores, lógica de negocio
│   ├── resources/views/  # Vistas Blade (base para frontend)
│   └── ...
├── docs/                 # Documentación de Tesis (LaTeX)
│   ├── tex/
│   │   ├── main.tex     # Documento principal de tesis
│   │   ├── config.tex   # Configuración LaTeX
│   │   └── chapters/    # Capítulos de la tesis
│   ├── bib/
│   │   └── references.bib  # Bibliografía BibTeX
│   ├── images/          # Figuras y capturas
│   ├── scripts/
│   │   ├── build.ps1    # Script de compilación PowerShell
│   │   └── build.sh     # Script de compilación Bash
│   └── build/           # Salida de compilación (NO versionar)
├── web/                 # Aplicación Web Next.js
│   ├── app/            # App Router de Next.js
│   ├── components/     # Componentes React reutilizables
│   ├── prisma/         # Esquema y migraciones Prisma
│   ├── public/         # Assets estáticos y modelos 3D
│   ├── assets/         # Modelos 3D originales (copiar a public/)
│   ├── scripts/        # Scripts de utilidad
│   ├── Dockerfile      # Imagen Docker para producción
│   └── docker-compose.yml  # Orquestación Docker
└── mobile/             # Aplicación React Native (FUTURO)
```

### 📝 Capítulos de la Tesis (en orden)

```
docs/tex/chapters/
├── 01-resumen.tex          # Resumen ejecutivo y palabras clave
├── 02-introduccion.tex     # Contexto, justificación y estructura
├── 03-diagnostico.tex      # Planteamiento del problema, objetivos, alcance
├── 04-marco.tex            # Marco teórico y estado del arte
├── 05-propuesta.tex        # Arquitectura, diagramas, prototipos
├── 06-desarrollo.tex       # Implementación técnica
├── 07-producto-final.tex   # Resultados y demostración (MANUALES)
└── 08-conclusiones.tex     # Conclusiones y recomendaciones
```

## 🏗️ Stack Tecnológico del Proyecto

**Proyecto de Referencia**: El proyecto Laravel en `/archived` es la base para toda la migración. Usa su lógica, modelos, vistas y arquitectura como referencia tanto para el frontend como para el backend.

### Frontend Web (Next.js)
- **Framework**: Next.js 15.5.4 con App Router
- **UI**: React 19, TypeScript 5
- **Estilos**: Tailwind CSS 3.x
- **Componentes**: shadcn/ui, Radix UI
- **3D**: Three.js 0.180, React Three Fiber 9.3, Drei 10.7
- **Ubicación**: `/web`
- **Referencia**: Vistas Blade de Laravel en `/archived/resources/views`

### Backend (Next.js API Routes)
- **Framework**: Next.js 15.5.4 API Routes
- **Base de datos**: PostgreSQL 15+
- **ORM**: Prisma 6.17
- **Autenticación**: JWT (jsonwebtoken + Passport.js)
- **Validación**: Zod 4.1
- **Estado**: Zustand 5.0
- **Documentación API**: Swagger (swagger-jsdoc, swagger-ui-react)
- **TypeScript**: Habilitado
- **Ubicación**: `/web/app/api` (API Routes dentro del proyecto web)
- **Referencia**: Modelos, controladores y lógica de negocio de Laravel en `/archived/app`

### Mobile (React Native - Futuro)
- **Framework**: Expo
- **Estilos**: Tailwind CSS 3.x (NativeWind)
- **TypeScript**: Habilitado
- **Ubicación**: `/mobile`
- **Referencia**: Lógica y flujos del frontend Laravel

### Infraestructura
- **Contenedores**: Docker 24+, Docker Compose
- **CI/CD**: GitHub Actions, Vercel (opcional)
- **Despliegue**: Vercel / Railway / DigitalOcean / AWS

## Requisitos (entorno de desarrollo)

### Para Documentación LaTeX
- Windows: MiKTeX o TeX Live instalados.
- latexmk (recomendado) o pdflatex + bibtex disponibles en PATH.
- Powershell (el script `scripts/build.ps1` está escrito para PowerShell).
- Codificación: UTF-8. Idioma: español (babel).

### Para Aplicación Web
- Node.js 18+ y npm 9+
- PostgreSQL 15+
- Docker y Docker Compose (opcional, recomendado)
- Git

## Comandos clave

### Documentación LaTeX (PowerShell)
### Documentación LaTeX (PowerShell)

Compilar documento principal (desde la raíz del repo):

```powershell
# Desde docs/
scripts\build.ps1 tex\main.tex
```

### Aplicación Web (desde /web)

```bash
# Desarrollo
npm install
.\scripts\copy-models.ps1  # CRÍTICO: Copiar modelos 3D
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev

# Producción con Docker
docker-compose up -d

# Ver logs
docker-compose logs -f web
```

## Qué hace `scripts/build.ps1` (resumen)

- Resuelve la ruta del archivo .tex y el root del repo.
- Intenta ejecutar `latexmk -pdf -outdir=<outdir>` si `latexmk` está disponible.
- Si `latexmk` no existe, usa `pdflatex` + `bibtex` + `pdflatex` (varias pasadas), guardando artefactos en el directorio de salida.
- Devuelve código de salida del motor LaTeX y muestra errores estándar si faltan herramientas.

## Validación / checks a hacer antes de aceptar cambios

### Para LaTeX
- Ejecutar `scripts\build.ps1 tex\main.tex` y verificar que `build\main.pdf` (o `<nombre>.pdf`) se genera sin errores.
- Revisar `build/` para advertencias de LaTeX (log) y problemas con referencias/bibliografía.
- Comprobar que la bibliografía se regenera (BibTeX) cuando se actualiza `bib/references.bib`.
- Si agregas imágenes, confirmar que `images/` contiene las rutas correctas y que no hay tamaños absurdos que rompan el diseño.

### Para Aplicación Web
- Ejecutar `npm run build` sin errores
- Verificar que los modelos 3D están copiados en `public/` (ejecutar `copy-models.ps1`)
- Ejecutar `npx prisma generate` después de cambios en el schema
- Probar que la aplicación arranca con `npm run dev`
- Verificar que no hay errores de TypeScript

## Convenciones y reglas importantes

### LaTeX
- Usar UTF-8 y evitar caracteres especiales sin escape en .tex.
- Mantener cada capítulo en `tex/chapters/` y usar `\include{tex/chapters/XX-nombre}` desde `main.tex`.
- No commitear la carpeta `build/` ni archivos auxiliares (.aux, .log, .bbl, etc.).
- La plantilla usa la clase `apa7`, no cambiar la clase global salvo indicación explícita.

### Código (Web/Mobile)
- **Siempre usa TypeScript** para todos los archivos nuevos
- **Componentes reutilizables**: Prioriza la creación de componentes modulares
- **shadcn/ui**: SIEMPRE usa componentes de shadcn/ui cuando estén disponibles
- **Nomenclatura**: 
  - Componentes: PascalCase (ej: `UserProfile.tsx`)
  - Funciones/variables: camelCase (ej: `getUserData`)
  - Archivos de utilidades: kebab-case (ej: `api-client.ts`)
  - Constantes: UPPER_SNAKE_CASE (ej: `API_BASE_URL`)

### Next.js 15.5.4
- **App Router**: Usa el App Router (no Pages Router)
- **Server Components**: Por defecto, crea Server Components. Usa `'use client'` solo cuando sea necesario
- **File conventions**: 
  - `page.tsx` para páginas
  - `layout.tsx` para layouts
  - `loading.tsx` para estados de carga
  - `error.tsx` para manejo de errores
- **Data fetching**: Usa `async/await` directamente en Server Components
- **Optimizaciones**: Usa `next/image`, `next/link`, `next/font`

### Tailwind CSS
- **Mobile-first**: Usa el enfoque mobile-first (`sm:`, `md:`, `lg:`, `xl:`)
- **Utility classes**: Prefiere utility classes sobre CSS custom
- **Dark mode**: Considera soporte con `dark:` prefix
- **Responsive**: Asegúrate de que todos los componentes sean responsivos

## Pautas para Copilot (cómo debe usar estas instrucciones)

### Para LaTeX
- Antes de proponer cambios en .tex, asegurar que los comandos de build que proponga coincidan con `scripts/build.ps1` y que la construcción local pase.
- No modificar `tex/config.tex` ni la clase `apa7` sin documentar el motivo y verificar el impacto en el PDF final.
- Si una sugerencia implica agregar paquetes LaTeX, incluir una breve razón (compatibilidad o necesidad) y comprobar que no rompe la compilación.
- Cuando trabajes en un capítulo, limitar los cambios al archivo de capítulo salvo que sea necesario actualizar `main.tex` (p. ej. nuevo `\include{...}`).
- Priorizar cambios que mantengan la compatibilidad con `latexmk` y pdflatex en Windows.

### Para Código Web/Mobile
- **Referencia Laravel**: Siempre consulta `/archived` para entender la lógica de negocio antes de implementar
- **Modelos 3D**: Recuerda que SIEMPRE deben copiarse de `assets/` a `public/` con el script
- **Prisma**: Ejecuta `npx prisma generate` después de cambios en el schema
- **Componentes**: Usa shadcn/ui antes de crear componentes custom
- **TypeScript**: Usa tipos estrictos, evita `any`
- **Accesibilidad**: Usa etiquetas semánticas y `aria-*` attributes
- **Performance**: Considera lazy loading, memoización, optimización de imágenes
- **Seguridad**: Valida inputs con Zod, usa variables de entorno para secretos

## Errores comunes y soluciones rápidas

### LaTeX
- "No LaTeX engine found": instalar MiKTeX/TeX Live y asegurarse de que `latexmk` o `pdflatex` estén en PATH.
- Errores de codificación (caracteres raros): guardar archivos en UTF-8 y usar `inputenc`/`babel` (ya están en `tex/config.tex`).
- Problemas con bibliografía: ejecutar el build completo (pdflatex → bibtex → pdflatex ×2) o usar `latexmk`.

### Web/Mobile
- **Error 404 modelos 3D**: Ejecutar `.\scripts\copy-models.ps1` desde `/web`
- **Error de base de datos**: Verificar que PostgreSQL esté corriendo y `DATABASE_URL` sea correcta
- **Sesiones expiran**: Verificar `JWT_SECRET` en `.env` (mínimo 32 caracteres)
- **Error de Prisma**: Ejecutar `npx prisma generate` después de cambios en schema
- **Error de TypeScript**: Revisar tipos y ejecutar `npm run build`

## Ejemplo: plantilla APA7 (sintaxis y uso)

Incluye a continuación un ejemplo real de archivo de plantilla (`tex/templates/plantilla-apa7.tex`). Copilot puede usar este fragmento para aprender la sintaxis de LaTeX en este repositorio y las convenciones usadas (clase `apa7`, paquetes, estructura de portada, índices, referencias).

```tex
% PLANTILLA APA7
% Creado por: Isaac Palma Medina
% Última actualización: 25/07/2021
% @COPYLEFT

% Fuentes consultadas (todos los derechos reservados):  
% Normas APA. (2019). Guía Normas APA. https://normas-apa.org/wp-content/uploads/Guia-Normas-APA-7ma-edicion.pdf
% Tecnológico de Costa Rica [Richmond]. (2020, 16 abril). LaTeX desde cero con Overleaf (1 de 3) [Vídeo]. YouTube. https://www.youtube.com/watch?v=kM1KvHVuaTY
% Weiss, D. (2021). Formatting documents in APA style (7th Edition) with the apa7 LATEX class. https://ctan.math.washington.edu/tex-archive/macros/latex/contrib/apa7/apa7.pdf

%+-+-+-+-++-+-+-+-+-+-+-+-+-++-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-++-+-+-+-+-+-+-+-+-+

% Preámbulo
\documentclass[stu, 12pt, letterpaper, donotrepeattitle, floatsintext, natbib]{apa7}
\usepackage[utf8]{inputenc}
\usepackage{comment}
\usepackage{marvosym}
\usepackage{graphicx}
\usepackage{float}
\usepackage[normalem]{ulem}
\usepackage[spanish]{babel} 
\selectlanguage{spanish}
\useunder{\uline}{\ul}{}
\newcommand{\myparagraph}[1]{\paragraph{#1}\mbox{}\\}

% Portada
\thispagestyle{empty}
\title{\Large Título del documento}
\author{Autor(a) \\\Autor(a) \\\Autor(a)} % (autores separados, consultar al docente)
% Manera oficial de colocar los autores:
%\author{Autor(a) I, Autor(a) II, Autor(a) III, Autor(a) X}
\affiliation{Nombre de la institución}
\course{Código del curso: Nombre del curso}
\professor{Nombre del docente}
\duedate{Fecha}
\begin{document}
    \maketitle
    
    
    % Índices
    \pagenumbering{roman}
    % Contenido
    \renewcommand\contentsname{\largeÍndice}
    \tableofcontents
    \setcounter{tocdepth}{2}
    \newpage
    % Fíguras
    \renewcommand{\listfigurename}{\largeÍndice de fíguras}
    \listoffigures
    \newpage
    % Tablas
    \renewcommand{\listtablename}{\largeÍndice de tablas}
    \listoftables
    \newpage
    
    % Cuerpo
    \pagenumbering{arabic}
    
    \section{\large Título I}
    \noindent \maskCitet{cervantes1999}\\
    En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga antigua, rocín flaco y galgo corredor.
    \subsection{Título II} 
    Una olla de algo más vaca que carnero, salpicón las más noches, duelos y quebrantos los sábados, lantejas los viernes, algún palomino de añadidura los domingos, consumían las tres partes de su hacienda.
    \subsubsection{Título III}
    El resto della concluían sayo de velarte, calzas de velludo para las fiestas, con sus pantuflos de lo mesmo, y los días de entresemana se honraba con su vellorí de lo más fino.
    \paragraph{Título IV}
    Tenía en su casa una ama que pasaba de los cuarenta, y una sobrina que no llegaba a los veinte, y un mozo de campo y plaza, que así ensillaba el rocín como tomaba la podadera.
    \myparagraph{Título IV ii}
    Frisaba la edad de nuestro hidalgo con los cincuenta años; era de complexión recia, seco de carnes, enjuto de rostro, gran madrugador y amigo de la caza. 
    \subparagraph{Título V}
    Quieren decir que tenía el sobrenombre de Quijada, o Quesada, que en esto hay alguna diferencia en los autores que deste caso escriben; aunque por conjeturas verosímiles se deja entender que se llamaba Quijana.
    
    \newpage
    % Referencias
    \renewcommand\refname{\large\textbf{Referencias}}
    \bibliography{mibibliografia}
    
\end{document}
```

Nota: el ejemplo anterior es una plantilla de muestra — ajusta `\bibliography{...}` y los metadatos de la portada a los valores reales de este repositorio (por ejemplo, `bib/references.bib` y los autores). Copilot debe respetar las convenciones listadas en este archivo al generar o editar `.tex`.

## 📚 Referencias Bibliográficas Clave

### Principales Citas Utilizadas en la Tesis

1. **Deci & Ryan (2017)** - Teoría de Autodeterminación y motivación intrínseca
2. **Chen et al. (2023)** - Impacto de gamificación en cognición, emociones y motivación
3. **Martínez et al. (2023)** - Herramientas digitales e integridad académica
4. **Saputra et al. (2025)** - Tendencias en gamificación para educación científica
5. **Coelho et al. (2025)** - Gamificación educativa controlada
6. **Nurhayati et al. (2025)** - Metodologías de aprendizaje interactivo
7. **Sappaile et al. (2024)** - Orientación a resultados vs. aprendizaje
8. **Rahmi et al. (2025)** - Comprensión superficial vs. profunda

### Archivo BibTeX
Todas las referencias están en formato APA 7 en `bib/references.bib`

## 🎯 Componentes Principales del Sistema

### 1. Sistema de Autenticación
- Registro y login seguro con JWT
- Gestión de sesiones mediante tokens
- Recuperación de contraseña
- Basado en jsonwebtoken + Passport.js

### 2. Entorno Virtual 3D
- Mundo medieval inmersivo
- Personajes y avatares personalizables
- Interacciones y narrativa contextualizada
- Three.js 0.180 con React Three Fiber 9.3

### 3. Gestión de Misiones
- Creación por docentes en dashboard
- Asignación a estudiantes por curso
- Ejecución en entorno 3D
- Evaluación y retroalimentación

### 4. Sistema de Recompensas
- Puntos de experiencia (XP)
- Niveles y progresión
- Logros y reconocimientos
- Personalización de avatar

### 5. Analítica Educativa
- Dashboard para docentes
- Seguimiento de progreso estudiantil
- Métricas de engagement
- Identificación de dificultades

## 🎨 Palabras Clave del Proyecto

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
- Discord webhooks

## ✅ Checklist de Calidad

### Antes de Commitear Cambios en LaTeX
- [ ] Compilación exitosa sin errores (`scripts\build.ps1 tex\main.tex`)
- [ ] Todas las referencias citadas aparecen en bibliografía
- [ ] Todas las figuras tienen caption y están referenciadas
- [ ] Numeración de páginas correcta (romano para índices, árabe para contenido)
- [ ] Ortografía y gramática revisadas
- [ ] Formato APA 7 respetado
- [ ] Archivos no versionables eliminados (.aux, .log, .bbl, etc.)

### Antes de Commitear Cambios en Código
- [ ] `npm run build` ejecuta sin errores
- [ ] Modelos 3D copiados a `public/` (`.\scripts\copy-models.ps1`)
- [ ] `npx prisma generate` ejecutado después de cambios en schema
- [ ] No hay errores de TypeScript
- [ ] Componentes usan shadcn/ui cuando es posible
- [ ] Variables de entorno documentadas en `.env.example`
- [ ] Código sigue convenciones de nomenclatura
- [ ] Validaciones con Zod implementadas

## 🔮 Trabajo Futuro Documentado

**Funcionalidades planificadas (mencionar en conclusiones):**
- OAuth2 con Google Workspace y Microsoft 365
- Integración con Canvas LMS y Moodle
- AWS S3 para almacenamiento de archivos
- Modo multijugador colaborativo
- Aplicación móvil React Native (Expo)
- IA adaptativa para dificultad dinámica
- Realidad virtual (VR) y realidad aumentada (AR)
- Analítica predictiva con Machine Learning
- Blockchain para certificaciones y logros

## Notas finales

### Contexto Académico
- **Tipo de Documento**: Proyecto de fin de carrera (Tesis de grado)
- **Área**: Tecnología Digital / Desarrollo de Software / Tecnología Educativa
- **Modalidad**: Desarrollo de software aplicado a educación
- **Formato**: APA 7ª edición (clase `apa7` de LaTeX)
- **Idioma**: Español

### Recursos Adicionales
- [Guía APA 7](https://normas-apa.org/)
- [Documentación apa7 LaTeX](https://ctan.math.washington.edu/tex-archive/macros/latex/contrib/apa7/apa7.pdf)
- [Three.js Documentation](https://threejs.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

### Para Copilot
Estas instrucciones están pensadas para que Copilot entienda cómo construir, validar y modificar este proyecto (tanto LaTeX como código) durante la creación de sugerencias o PRs. 

**Reglas importantes:**
1. Confía en estas reglas y solo realiza búsquedas adicionales si la información proporcionada aquí es insuficiente o contradictoria
2. El proyecto tiene DOS partes independientes pero relacionadas: documentación LaTeX (`/docs`) y aplicación web (`/web`)
3. SIEMPRE consulta `/archived` (Laravel) para entender la lógica de negocio antes de implementar features en `/web`
4. Los modelos 3D DEBEN estar en `public/` - es el paso más crítico y frecuentemente olvidado
5. Usa TypeScript estricto, shadcn/ui y Next.js App Router en todo el código nuevo
6. Mantén consistencia con el formato APA 7 en LaTeX y respeta la estructura modular

**Última actualización:** Diciembre 2025  
**Mantenido por:** Fernando Chocce & Abel Santisteban  
**Propósito:** Instrucciones unificadas para desarrollo del proyecto de tesis Warclass