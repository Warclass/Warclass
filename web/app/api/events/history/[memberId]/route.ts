import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/backend/services/event/event.service';

/**
 * @swagger
 * /api/events/history/{memberId}:
 *   get:
 *     summary: Obtener historial de eventos de un miembro
 *     description: Retorna el historial de participación en eventos de un miembro específico
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del miembro
 *     responses:
 *       200:
 *         description: Historial de eventos del miembro
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       eventId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       participation:
 *                         type: string
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { memberId: string } }
) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const history = await EventService.getMemberEventHistory(params.memberId);

    return NextResponse.json({ history }, { status: 200 });
  } catch (error: any) {
    console.error(`Error in GET /api/events/history/${params.memberId}:`, error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener historial de eventos' },
      { status: 500 }
    );
  }
}
