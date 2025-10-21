# Instrucciones del repositorio para Copilot — Proyecto LaTeX (tesis)

## Resumen breve

Este repositorio contiene una plantilla/framework para escribir y compilar una tesis en LaTeX usando la clase `apa7` y una estructura modular de capítulos bajo `tex/`. El archivo principal es `tex/main.tex`. El build se realiza desde PowerShell mediante el script `scripts/build.ps1` que usa `latexmk` si está disponible o `pdflatex`/`bibtex` como alternativa.

## Estructura importante (rutas relativas al root del repo)

- `tex/main.tex` — documento principal (incluye `tex/config.tex` y `tex/chapters/*`).
- `tex/config.tex` — paquetes y configuración común.
- `tex/chapters/` — capítulos individuales, p. ej. `02-introduccion.tex`.
- `bib/references.bib` — bibliografía (BibTeX).
- `images/` — figuras y gráficos.
- `scripts/build.ps1` — script de compilación para Windows/PowerShell.
- `build/` — carpeta de salida (PDF y archivos auxiliares). No versionar.

## Requisitos (entorno de desarrollo)

- Windows: MiKTeX o TeX Live instalados.
- latexmk (recomendado) o pdflatex + bibtex disponibles en PATH.
- Powershell (el script `scripts/build.ps1` está escrito para PowerShell).
- Codificación: UTF-8. Idioma: español (babel).

Comandos clave (PowerShell)

- Compilar documento principal (desde la raíz del repo):

```powershell
scripts\build.ps1 tex\main.tex
```

Qué hace `scripts/build.ps1` (resumen)

- Resuelve la ruta del archivo .tex y el root del repo.
- Intenta ejecutar `latexmk -pdf -outdir=<outdir>` si `latexmk` está disponible.
- Si `latexmk` no existe, usa `pdflatex` + `bibtex` + `pdflatex` (varias pasadas), guardando artefactos en el directorio de salida.
- Devuelve código de salida del motor LaTeX y muestra errores estándar si faltan herramientas.

Validación / checks a hacer antes de aceptar cambios

- Ejecutar `scripts\build.ps1 tex\main.tex` y verificar que `build\main.pdf` (o `<nombre>.pdf`) se genera sin errores.
- Revisar `build/` para advertencias de LaTeX (log) y problemas con referencias/bibliografía.
- Comprobar que la bibliografía se regenera (BibTeX) cuando se actualiza `bib/references.bib`.
- Si agregas imágenes, confirmar que `images/` contiene las rutas correctas y que no hay tamaños absurdos que rompan el diseño.

## Convenciones y reglas importantes

- Usar UTF-8 y evitar caracteres especiales sin escape en .tex.
- Mantener cada capítulo en `tex/chapters/` y usar `\include{tex/chapters/XX-nombre}` desde `main.tex`.
- No commitear la carpeta `build/` ni archivos auxiliares (.aux, .log, .bbl, etc.).
- La plantilla usa la clase `apa7`, no cambiar la clase global salvo indicación explícita.

## Pautas para Copilot (cómo debe usar estas instrucciones)

- Antes de proponer cambios en .tex, asegurar que los comandos de build que proponga coincidan con `scripts/build.ps1` y que la construcción local pase.
- No modificar `tex/config.tex` ni la clase `apa7` sin documentar el motivo y verificar el impacto en el PDF final.
- Si una sugerencia implica agregar paquetes LaTeX, incluir una breve razón (compatibilidad o necesidad) y comprobar que no rompe la compilación.
- Cuando trabajes en un capítulo, limitar los cambios al archivo de capítulo salvo que sea necesario actualizar `main.tex` (p. ej. nuevo `\include{...}`).
- Priorizar cambios que mantengan la compatibilidad con `latexmk` y pdflatex en Windows.

## Errores comunes y soluciones rápidas

- "No LaTeX engine found": instalar MiKTeX/TeX Live y asegurarse de que `latexmk` o `pdflatex` estén en PATH.
- Errores de codificación (caracteres raros): guardar archivos en UTF-8 y usar `inputenc`/`babel` (ya están en `tex/config.tex`).
- Problemas con bibliografía: ejecutar el build completo (pdflatex → bibtex → pdflatex ×2) o usar `latexmk`.

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

## Notas finales

- Estas instrucciones están pensadas para que Copilot entienda cómo construir, validar y modificar este proyecto LaTeX durante la creación de sugerencias o PRs. Confía en estas reglas y solo realiza búsquedas adicionales si la información proporcionada aquí es insuficiente o contradictoria.

Gracias.