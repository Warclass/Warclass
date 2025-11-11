import { NextRequest, NextResponse } from 'next/server';
import { GroupService } from '@/backend/services/group/group.service';
import { AssignMembersSchema } from '@/backend/validators/group.validator';

/**
 * @swagger
 * /api/groups/assign:
 *   post:
 *     summary: Asignar miembros a grupo
 *     description: Asigna uno o varios miembros a un grupo específico
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
 *               - memberIds
 *             properties:
 *               groupId:
 *                 type: string
 *                 description: ID del grupo
 *                 example: "5"
 *               memberIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs de los miembros a asignar
 *                 example: ["10", "15", "20"]
 *     responses:
 *       200:
 *         description: Miembros asignados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Miembros asignados correctamente
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
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();

    const validation = AssignMembersSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    await GroupService.assignMembers(validation.data);

    return NextResponse.json({ message: 'Miembros asignados correctamente' }, { status: 200 });
  } catch (error: any) {
    console.error('Error in POST /api/groups/assign:', error);

    if (error.message === 'Grupo no encontrado') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Error al asignar miembros' },
      { status: 500 }
    );
  }
}
