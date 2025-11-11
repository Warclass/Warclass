import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/backend/middleware/auth/auth.middleware';
import { DashboardService } from '@/backend/services/dashboard/dashboard.service';

/**
 * @swagger
 * /api/dashboard/enrolled-courses:
 *   get:
 *     summary: Obtener cursos inscritos
 *     description: Retorna todos los cursos donde el usuario está inscrito como estudiante
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cursos inscritos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
export async function GET(request: NextRequest) {
  try {
    const authError = await authenticateToken(request);
    if (authError) {
      return authError;
    }

    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    const courses = await DashboardService.getEnrolledCourses(userId);

    return NextResponse.json(
      {
        success: true,
        data: courses,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/dashboard/enrolled-courses:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al obtener cursos inscritos',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      },
      { status: 500 }
    );
  }
}
