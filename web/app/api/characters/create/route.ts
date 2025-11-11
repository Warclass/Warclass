import { NextRequest, NextResponse } from 'next/server';
import { createCharacter } from '@/backend/services/character/character.service';

/**
 * @swagger
 * /api/characters/create:
 *   post:
 *     summary: Crear personaje
 *     description: Crea un nuevo personaje para el usuario en un curso específico
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
 *               - memberId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del personaje
 *                 example: Arthas
 *               classId:
 *                 type: integer
 *                 description: ID de la clase del personaje
 *                 example: 1
 *               memberId:
 *                 type: integer
 *                 description: ID del miembro del curso
 *                 example: 5
 *               appearance:
 *                 type: object
 *                 description: Apariencia del personaje (opcional)
 *                 properties:
 *                   skin:
 *                     type: string
 *                   hair:
 *                     type: string
 *                   eyes:
 *                     type: string
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
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, classId, memberId, appearance } = body;

    if (!name || !classId || !memberId) {
      return NextResponse.json(
        { error: 'Datos incompletos: se requiere name, classId y memberId' },
        { status: 400 }
      );
    }

    const character = await createCharacter({
      name,
      classId,
      memberId,
      appearance // Pasamos el appearance al servicio
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
