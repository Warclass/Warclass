import { NextRequest, NextResponse } from 'next/server';
import { GroupService } from '@/backend/services/group/group.service';
import { authenticateToken } from '@/backend/middleware/auth/auth.middleware';

/**
 * @swagger
 * /api/groups/remove:
 *   post:
 *     summary: Quitar personajes de su grupo
 *     description: Desasigna uno o varios personajes del grupo actual (pone group_id = null)
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
 *               - characterIds
 *             properties:
 *               characterIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs de los personajes a quitar del grupo
 *     responses:
 *       200:
 *         description: Personajes removidos correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
export async function POST(req: NextRequest) {
  try {
    const authError = await authenticateToken(req);
    if (authError) return authError;

    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const characterIds: unknown = body?.characterIds;

    if (!Array.isArray(characterIds) || characterIds.length === 0) {
      return NextResponse.json({ error: 'characterIds es requerido' }, { status: 400 });
    }

    // Ejecutar removals en paralelo
    await Promise.all(
      characterIds.map((id) => GroupService.removeCharacterFromGroup(String(id)))
    );

    return NextResponse.json({ success: true, count: characterIds.length }, { status: 200 });
  } catch (error: any) {
    console.error('Error in POST /api/groups/remove:', error);
    return NextResponse.json(
      { error: error.message || 'Error al quitar personajes del grupo' },
      { status: 500 }
    );
  }
}
