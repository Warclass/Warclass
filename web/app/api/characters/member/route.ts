import { NextRequest, NextResponse } from 'next/server';
import { getUserCharacterForCourse } from '@/backend/services/character/character.service';

/**
 * @swagger
 * /api/characters/member:
 *   get:
 *     summary: Obtener personaje del usuario para un curso
 *     description: Retorna el personaje activo del usuario en un curso específico
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario (UUID)
 *       - in: query
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del curso (UUID)
 *     responses:
 *       200:
 *         description: Personaje encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Character'
 *       400:
 *         description: userId o courseId no proporcionados
 *       404:
 *         description: Personaje no encontrado o inscripción inactiva
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

    const character = await getUserCharacterForCourse(userId, courseId);

    if (!character) {
      return NextResponse.json(
        { error: 'No se encontró personaje activo para este usuario y curso' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      data: character 
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/characters/member:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener personaje del usuario' },
      { status: 500 }
    );
  }
}
