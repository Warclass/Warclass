import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/backend/middleware/auth/auth.middleware';
import { DashboardService } from '@/backend/services/dashboard/dashboard.service';

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Obtener datos del dashboard
 *     description: Retorna todos los datos necesarios para el dashboard del usuario autenticado, incluyendo personaje, cursos, estadísticas y actividad reciente
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del dashboard obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     character:
 *                       $ref: '#/components/schemas/Character'
 *                     enrolledCourses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Course'
 *                     teachingCourses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Course'
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalExperience:
 *                           type: integer
 *                         completedTasks:
 *                           type: integer
 *                         completedQuizzes:
 *                           type: integer
 *                         averageScore:
 *                           type: number
 *                     recentActivity:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           description:
 *                             type: string
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authError = await authenticateToken(request);
    if (authError) {
      return authError;
    }

    // Get user from request (set by authenticateToken middleware)
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

    // Get dashboard data
    const result = await DashboardService.getDashboardData(userId);

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in /api/dashboard:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al obtener datos del dashboard',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      },
      { status: 500 }
    );
  }
}
