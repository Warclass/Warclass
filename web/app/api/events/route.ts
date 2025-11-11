import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/backend/services/event/event.service';
import { CreateEventSchema } from '@/backend/validators/event.validator';

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Obtener eventos
 *     description: Retorna la lista de todos los eventos disponibles
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de eventos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const events = await EventService.getAllEvents();
    return NextResponse.json({ events }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/events:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener eventos' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Crear evento
 *     description: Crea un nuevo evento en el sistema
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
 *               - name
 *               - description
 *               - eventType
 *               - difficulty
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del evento
 *                 example: Batalla del Dragón Antiguo
 *               description:
 *                 type: string
 *                 description: Descripción del evento
 *                 example: Enfrenta al temible dragón en su guarida
 *               eventType:
 *                 type: string
 *                 enum: [QUEST, BOSS, DUNGEON, PVP]
 *                 description: Tipo de evento
 *                 example: BOSS
 *               difficulty:
 *                 type: string
 *                 enum: [EASY, MEDIUM, HARD, LEGENDARY]
 *                 description: Dificultad del evento
 *                 example: HARD
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de inicio
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de fin
 *               experienceReward:
 *                 type: integer
 *                 description: Recompensa de experiencia
 *                 example: 500
 *     responses:
 *       201:
 *         description: Evento creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 event:
 *                   $ref: '#/components/schemas/Event'
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

    const validation = CreateEventSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const event = await EventService.createEvent(validation.data);

    return NextResponse.json({ event }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/events:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear evento' },
      { status: 500 }
    );
  }
}
