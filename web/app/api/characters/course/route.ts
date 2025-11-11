import { NextRequest, NextResponse } from 'next/server';
import { getUserCharacterForCourse } from '@/backend/services/character/character.service';

/**
 * @swagger
 * /api/characters/course:
 *   get:
 *     summary: Obtener personaje por curso
 *     description: Retorna el personaje activo del usuario para un curso específico con relaciones completas
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 hasCharacter:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Character'
 *       400:
 *         description: courseId no proporcionado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Personaje no encontrado o inscripción inactiva
 *       500:
 *         description: Error interno del servidor
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId es requerido' },
        { status: 400 }
      );
    }

    // Usar el servicio que valida inscripción activa y obtiene el personaje
    const character = await getUserCharacterForCourse(userId, courseId);

    if (!character) {
      return NextResponse.json(
        { 
          success: false,
          hasCharacter: false,
          message: 'No tienes personaje activo en este curso' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      hasCharacter: true,
      data: character
    });
  } catch (error) {
    console.error('Error en GET /api/characters/course:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener personaje del curso' 
      },
      { status: 500 }
    );
  }
}
