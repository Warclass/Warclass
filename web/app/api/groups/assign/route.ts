import { NextRequest, NextResponse } from 'next/server';
import { GroupService } from '@/backend/services/group/group.service';
import { AssignCharactersSchema } from '@/backend/validators/group.validator';
import { authenticateToken } from '@/backend/middleware/auth/auth.middleware';

/**
 * @swagger
 * /api/groups/assign:
 *   post:
 *     summary: Asignar personajes a grupo
 *     description: Asigna uno o varios personajes a un grupo específico (cambia el grupo del personaje)
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *               - characterIds
 *             properties:
 *               groupId:
 *                 type: string
 *                 description: ID del grupo destino (UUID)
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *               characterIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs de los personajes a asignar (UUIDs)
 *                 example: ["660e8400-e29b-41d4-a716-446655440001", "770e8400-e29b-41d4-a716-446655440002"]
 *     responses:
 *       200:
 *         description: Personajes asignados exitosamente
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
 *                   example: Personajes asignados correctamente
 *                 count:
 *                   type: integer
 *                   example: 2
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Grupo no encontrado
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
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();

    const validation = AssignCharactersSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const result = await GroupService.assignCharacters(validation.data);

    return NextResponse.json({ 
      success: true,
      message: 'Personajes asignados correctamente',
      count: result.count
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error in POST /api/groups/assign:', error);

    if (error.message === 'Grupo no encontrado') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Error al asignar personajes' },
      { status: 500 }
    );
  }
}
