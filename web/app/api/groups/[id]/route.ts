import { NextRequest, NextResponse } from 'next/server';
import { GroupService } from '@/backend/services/group/group.service';
import { UpdateGroupSchema } from '@/backend/validators/group.validator';
import { authenticateToken } from '@/backend/middleware/auth/auth.middleware';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * @swagger
 * /api/groups/{id}:
 *   get:
 *     summary: Obtener grupo por ID
 *     description: Retorna la información de un grupo específico
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del grupo
 *     responses:
 *       200:
 *         description: Información del grupo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 group:
 *                   $ref: '#/components/schemas/Group'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Grupo no encontrado
 *       500:
 *         description: Error interno del servidor
 *   put:
 *     summary: Actualizar grupo
 *     description: Actualiza la información de un grupo
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del grupo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nuevo nombre del grupo
 *     responses:
 *       200:
 *         description: Grupo actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 group:
 *                   $ref: '#/components/schemas/Group'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Grupo no encontrado
 *       500:
 *         description: Error interno del servidor
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
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

    const group = await GroupService.getGroupById(params.id);

    return NextResponse.json({ group }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/groups/[id]:', error);

    if (error.message === 'Grupo no encontrado') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Error al obtener grupo' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
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

    const validation = UpdateGroupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const group = await GroupService.updateGroup(params.id, validation.data);

    return NextResponse.json({ group }, { status: 200 });
  } catch (error: any) {
    console.error('Error in PUT /api/groups/[id]:', error);

    if (error.message === 'Grupo no encontrado') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Error al actualizar grupo' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
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

    await GroupService.deleteGroup(params.id);

    return NextResponse.json({ message: 'Grupo eliminado correctamente' }, { status: 200 });
  } catch (error: any) {
    console.error('Error in DELETE /api/groups/[id]:', error);

    if (error.message === 'Grupo no encontrado') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Error al eliminar grupo' },
      { status: 500 }
    );
  }
}
