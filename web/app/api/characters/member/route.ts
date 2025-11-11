import { NextRequest, NextResponse } from 'next/server';
import { getUserMemberForCourse } from '@/backend/services/character/character.service';

/**
 * @swagger
 * /api/characters/member:
 *   get:
 *     summary: Obtener member ID del usuario
 *     description: Retorna el ID de membresía del usuario para un curso específico
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *       - in: query
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del curso
 *     responses:
 *       200:
 *         description: Member ID encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 memberId:
 *                   type: string
 *                   description: ID de la membresía
 *       400:
 *         description: userId o courseId no proporcionados
 *       404:
 *         description: Membresía no encontrada
 *       500:
 *         description: Error interno del servidor
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'userId y courseId son requeridos' },
        { status: 400 }
      );
    }

    const memberId = await getUserMemberForCourse(userId, courseId);

    if (!memberId) {
      return NextResponse.json(
        { error: 'No se encontró membresía para este usuario y curso' },
        { status: 404 }
      );
    }

    return NextResponse.json({ memberId }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/characters/member:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener member ID' },
      { status: 500 }
    );
  }
}
