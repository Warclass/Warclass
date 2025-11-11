import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/backend/services/event/event.service';

/**
 * @swagger
 * /api/events/apply/group:
 *   post:
 *     summary: Aplicar evento a grupo
 *     description: Aplica un evento a todos los estudiantes de un grupo
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - groupId
 *             properties:
 *               eventId:
 *                 type: string
 *                 description: ID del evento (UUID)
 *               groupId:
 *                 type: string
 *                 description: ID del grupo (UUID)
 *     responses:
 *       200:
 *         description: Evento aplicado al grupo exitosamente
 *       400:
 *         description: Faltan campos requeridos
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
    const { eventId, groupId } = body;

    if (!eventId || !groupId) {
      return NextResponse.json(
        { error: 'eventId y groupId son requeridos' },
        { status: 400 }
      );
    }

    const result = await EventService.applyEventToGroup(eventId, groupId);

    return NextResponse.json(
      {
        message: 'Evento aplicado al grupo correctamente',
        result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/events/apply/group:', error);
    return NextResponse.json(
      { error: error.message || 'Error al aplicar evento al grupo' },
      { status: 500 }
    );
  }
}
