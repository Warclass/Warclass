import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/backend/services/event/event.service';
import { ApplyEventSchema } from '@/backend/validators/event.validator';

/**
 * @swagger
 * /api/events/apply:
 *   post:
 *     summary: Aplicar evento a miembros
 *     description: Registra miembros/personajes en un evento específico
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
 *               - memberIds
 *             properties:
 *               eventId:
 *                 type: integer
 *                 description: ID del evento
 *                 example: 10
 *               memberIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: IDs de los miembros a registrar
 *                 example: [25, 30, 35]
 *     responses:
 *       200:
 *         description: Evento aplicado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Evento aplicado correctamente
 *                 result:
 *                   type: object
 *       400:
 *         description: Datos inválidos
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

    const validation = ApplyEventSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const result = await EventService.applyEventToMembers(validation.data);

    return NextResponse.json(
      {
        message: 'Evento aplicado correctamente',
        result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/events/apply:', error);
    return NextResponse.json(
      { error: error.message || 'Error al aplicar evento' },
      { status: 500 }
    );
  }
}
