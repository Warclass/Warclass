import { NextRequest, NextResponse } from 'next/server';
import { TeacherService } from '@/backend/services/teacher/teacher.service';
import { CreateTeacherSchema } from '@/backend/validators/teacher.validator';
import { requireAdmin, requireAuth } from '@/backend/middleware/auth.middleware';

/**
 * @swagger
 * /api/teachers:
 *   post:
 *     summary: Crear profesor
 *     description: Convierte un usuario en profesor (requiere permisos de administrador)
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID del usuario a convertir en profesor
 *                 example: "123"
 *               institutionId:
 *                 type: string
 *                 description: ID de la institución (opcional)
 *                 example: "5"
 *     responses:
 *       201:
 *         description: Profesor creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 teacher:
 *                   type: object
 *       400:
 *         description: Datos inválidos o usuario ya es profesor
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tiene permisos de administrador
 *       500:
 *         description: Error interno del servidor
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar que es admin
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();

    // Validar datos de entrada
    const validatedData = CreateTeacherSchema.parse(body);

    const result = await TeacherService.createTeacher(validatedData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/teachers:', error);
    return NextResponse.json(
      { error: 'Error al crear el profesor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/teachers
 * Obtener todos los teachers
 * 🔒 Requiere: Autenticación
 */
/**
 * @swagger
 * /api/teachers:
 *   get:
 *     summary: Listar profesores
 *     description: Retorna la lista de todos los profesores registrados
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de profesores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 teachers:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const result = await TeacherService.getAllTeachers();

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/teachers:', error);
    return NextResponse.json(
      { error: 'Error al obtener los profesores' },
      { status: 500 }
    );
  }
}
