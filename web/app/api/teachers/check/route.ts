import { NextRequest, NextResponse } from 'next/server';
import { TeacherService } from '@/backend/services/teacher/teacher.service';

/**
 * @swagger
 * /api/teachers/check:
 *   get:
 *     summary: Verificar si un usuario es profesor
 *     description: Verifica si el usuario autenticado tiene permisos de profesor
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado de profesor del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isTeacher:
 *                   type: boolean
 *                   description: Indica si el usuario es profesor
 *                 teacher:
 *                   type: object
 *                   description: Información del profesor (solo si isTeacher es true)
 *                 message:
 *                   type: string
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const teacherRes = await TeacherService.getTeacherByUserId(userId);

    if (!teacherRes.success || !teacherRes.teacher) {
      return NextResponse.json(
        {
          isTeacher: false,
          message: teacherRes.message || 'Usuario no es profesor',
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        isTeacher: true,
        teacher: teacherRes.teacher,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/teachers/check:', error);
    return NextResponse.json(
      { error: error.message || 'Error al verificar profesor' },
      { status: 500 }
    );
  }
}
