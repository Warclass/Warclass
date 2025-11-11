import { NextRequest, NextResponse } from 'next/server';
import { 
  getCharacterClasses,
  getUserCharacterForCourse,
  userHasCharacter
} from '@/backend/services/character/character.service';
import { authenticateToken } from '@/backend/middleware/auth/auth.middleware';

/**
 * @swagger
 * /api/characters:
 *   get:
 *     summary: Obtener información de personajes
 *     description: Endpoint multipropósito para obtener clases de personajes, verificar si el usuario tiene personaje, u obtener personaje de un curso
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [classes, check]
 *         description: Acción a realizar (classes para obtener clases, check para verificar si tiene personaje)
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: ID del curso para obtener el personaje asociado
 *     responses:
 *       200:
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                     hasCharacter:
 *                       type: boolean
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                     data:
 *                       $ref: '#/components/schemas/Character'
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Personaje no encontrado
 *       500:
 *         description: Error interno del servidor
 */
export async function GET(req: NextRequest) {
  try {
    // Autenticar token
    const authError = await authenticateToken(req);
    if (authError) {
      return authError;
    }

    const userId = req.headers.get('x-user-id');
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const action = searchParams.get('action');

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Endpoint para obtener clases de personaje
    if (action === 'classes') {
      const classes = await getCharacterClasses();
      return NextResponse.json({
        success: true,
        data: classes
      });
    }

    // Endpoint para verificar si tiene personaje
    if (action === 'check') {
      const hasCharacter = await userHasCharacter(userId);
      return NextResponse.json({
        success: true,
        hasCharacter
      });
    }

    // Endpoint para obtener personaje de un curso
    if (courseId) {
      const character = await getUserCharacterForCourse(userId, courseId);
      
      if (!character) {
        return NextResponse.json({
          success: false,
          error: 'No se encontró personaje para este curso'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: character
      });
    }

    return NextResponse.json(
      { error: 'Parámetros inválidos' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error en GET /api/characters:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener datos del personaje' 
      },
      { status: 500 }
    );
  }
}
