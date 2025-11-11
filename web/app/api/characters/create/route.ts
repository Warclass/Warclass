import { NextRequest, NextResponse } from 'next/server';
import { createCharacter } from '@/backend/services/character/character.service';
import { authenticateToken } from '@/backend/middleware/auth/auth.middleware';

/**
 * @swagger
 * /api/characters/create:
 *   post:
 *     summary: Crear personaje
 *     description: Crea un nuevo personaje para el usuario en un curso específico. El personaje se crea sin asignar a un grupo; el profesor asignará grupos posteriormente.
 *     tags: [Characters]
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
 *               - classId
 *               - courseId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del personaje
 *                 example: Arthas el Valiente
 *               classId:
 *                 type: string
 *                 description: ID de la clase del personaje (UUID)
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               courseId:
 *                 type: string
 *                 description: ID del curso (UUID)
 *                 example: "660e8400-e29b-41d4-a716-446655440001"
 *               appearance:
 *                 type: object
 *                 description: Apariencia del personaje (opcional)
 *                 properties:
 *                   Hair:
 *                     type: string
 *                     example: "Brown"
 *                   Eyes:
 *                     type: string
 *                     example: "Blue"
 *                   Skin:
 *                     type: string
 *                     example: "Light"
 *     responses:
 *       200:
 *         description: Personaje creado exitosamente
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
 *                   example: Personaje creado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Character'
 *       400:
 *         description: Datos incompletos o inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
export async function POST(req: NextRequest) {
  try {
    // Autenticar token
    const authError = await authenticateToken(req);
    if (authError) {
      return authError;
    }

    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, classId, courseId, appearance } = body;

    if (!name || !classId || !courseId) {
      return NextResponse.json(
        { error: 'Datos incompletos: se requiere name, classId y courseId' },
        { status: 400 }
      );
    }

    const character = await createCharacter({
      name,
      classId,
      userId, // Usar el userId del header autenticado
      courseId, // Curso en el que se crea el personaje (sin grupo asignado aún)
      appearance // Personalización visual (opcional)
    });

    return NextResponse.json({
      success: true,
      data: character,
      message: 'Personaje creado exitosamente'
    });
  } catch (error) {
    console.error('Error en POST /api/characters/create:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear personaje' 
      },
      { status: 500 }
    );
  }
}
