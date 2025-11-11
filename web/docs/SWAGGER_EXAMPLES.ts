/**
 * Ejemplos de documentación Swagger para diferentes tipos de endpoints
 * Copia y adapta estos ejemplos según tus necesidades
 */

// ============================================================================
// EJEMPLO 1: GET simple con parámetros de query
// ============================================================================

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Obtener lista de cursos
 *     description: Retorna todos los cursos del usuario autenticado
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página para paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de resultados por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda para filtrar cursos
 *     responses:
 *       200:
 *         description: Lista de cursos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */

// ============================================================================
// EJEMPLO 2: POST con body complejo
// ============================================================================

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Crear nuevo curso
 *     description: Crea un curso nuevo en el sistema
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - institutionId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del curso
 *                 example: Matemáticas I
 *               description:
 *                 type: string
 *                 description: Descripción del curso
 *                 example: Curso introductorio de matemáticas
 *               code:
 *                 type: string
 *                 description: Código único del curso
 *                 example: MAT-101
 *               institutionId:
 *                 type: integer
 *                 description: ID de la institución
 *                 example: 1
 *               maxStudents:
 *                 type: integer
 *                 description: Número máximo de estudiantes
 *                 example: 30
 *     responses:
 *       201:
 *         description: Curso creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Curso creado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */

// ============================================================================
// EJEMPLO 3: GET con parámetro de ruta
// ============================================================================

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Obtener curso por ID
 *     description: Retorna la información detallada de un curso específico
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del curso
 *     responses:
 *       200:
 *         description: Curso encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 *       404:
 *         description: Curso no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */

// ============================================================================
// EJEMPLO 4: PUT para actualizar recurso
// ============================================================================

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Actualizar curso
 *     description: Actualiza la información de un curso existente
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del curso a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nuevo nombre del curso
 *               description:
 *                 type: string
 *                 description: Nueva descripción
 *               maxStudents:
 *                 type: integer
 *                 description: Nuevo número máximo de estudiantes
 *     responses:
 *       200:
 *         description: Curso actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Curso actualizado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Curso no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */

// ============================================================================
// EJEMPLO 5: DELETE
// ============================================================================

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Eliminar curso
 *     description: Elimina un curso del sistema
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del curso a eliminar
 *     responses:
 *       200:
 *         description: Curso eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Curso eliminado exitosamente
 *       404:
 *         description: Curso no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permisos para eliminar este curso
 *       500:
 *         description: Error interno del servidor
 */

// ============================================================================
// EJEMPLO 6: Endpoint con múltiples respuestas posibles
// ============================================================================

/**
 * @swagger
 * /api/tasks/submit:
 *   post:
 *     summary: Enviar tarea
 *     description: Permite a un estudiante enviar una tarea para revisión
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *               - file
 *             properties:
 *               taskId:
 *                 type: integer
 *                 description: ID de la tarea
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de la tarea
 *               comments:
 *                 type: string
 *                 description: Comentarios adicionales del estudiante
 *     responses:
 *       200:
 *         description: Tarea enviada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Tarea enviada exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     taskId:
 *                       type: integer
 *                     submittedAt:
 *                       type: string
 *                       format: date-time
 *                     experienceGained:
 *                       type: integer
 *       400:
 *         description: Archivo inválido o datos incompletos
 *       404:
 *         description: Tarea no encontrada
 *       409:
 *         description: Tarea ya enviada previamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */

// ============================================================================
// EJEMPLO 7: Endpoint sin autenticación (público)
// ============================================================================

/**
 * @swagger
 * /api/public/stats:
 *   get:
 *     summary: Obtener estadísticas públicas
 *     description: Retorna estadísticas generales del sistema (endpoint público)
 *     tags: [Public]
 *     security: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                   example: 1500
 *                 totalCourses:
 *                   type: integer
 *                   example: 250
 *                 totalInstitutions:
 *                   type: integer
 *                   example: 42
 *       500:
 *         description: Error interno del servidor
 */

// ============================================================================
// EJEMPLO 8: Endpoint con array en el body
// ============================================================================

/**
 * @swagger
 * /api/groups/assign:
 *   post:
 *     summary: Asignar estudiantes a grupo
 *     description: Asigna múltiples estudiantes a un grupo específico
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *               - studentIds
 *             properties:
 *               groupId:
 *                 type: integer
 *                 description: ID del grupo
 *                 example: 5
 *               studentIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array de IDs de estudiantes
 *                 example: [10, 15, 20, 25]
 *     responses:
 *       200:
 *         description: Estudiantes asignados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 4 estudiantes asignados exitosamente
 *                 assigned:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   example: [10, 15, 20, 25]
 *       400:
 *         description: Grupo lleno o estudiantes ya asignados
 *       404:
 *         description: Grupo no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
