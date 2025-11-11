import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/backend/services/event/event.service';
import { CreateEventSchema } from '@/backend/validators/event.validator';

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Obtener eventos
 *     description: Retorna la lista de eventos disponibles (globales o de un curso específico)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: ID del curso para filtrar eventos (incluye globales + custom del curso)
 *       - in: query
 *         name: includeCustom
 *         schema:
 *           type: boolean
 *         description: Incluir eventos custom (solo para administradores)
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

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const includeCustom = searchParams.get('includeCustom') === 'true';

    let events;

    if (courseId) {
      // Obtener eventos disponibles para un curso (globales + custom del curso)
      events = await EventService.getAvailableEventsForCourse(courseId);
    } else {
      // Obtener solo eventos globales (o todos si includeCustom es true)
      events = await EventService.getAllEvents(includeCustom);
    }

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
 *     description: Crea un nuevo evento en el sistema (global o custom para un curso)
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del evento
 *                 example: Hackathon de Programación
 *               description:
 *                 type: string
 *                 description: Descripción del evento
 *                 example: Evento especial de programación con premios
 *               type:
 *                 type: string
 *                 enum: [disaster, fortune, neutral]
 *                 description: Tipo de evento
 *                 example: fortune
 *               rank:
 *                 type: string
 *                 enum: [S, A, B, C, D]
 *                 description: Rango del evento
 *                 example: A
 *               experience:
 *                 type: integer
 *                 description: Cambio en experiencia
 *                 example: 200
 *               gold:
 *                 type: integer
 *                 description: Cambio en oro
 *                 example: 300
 *               health:
 *                 type: integer
 *                 description: Cambio en salud
 *                 example: 0
 *               energy:
 *                 type: integer
 *                 description: Cambio en energía
 *                 example: -20
 *               isGlobal:
 *                 type: boolean
 *                 description: Si es true, el evento es del sistema. Si es false, es custom del curso.
 *                 example: false
 *               courseId:
 *                 type: string
 *                 description: ID del curso (requerido si isGlobal es false)
 *                 example: uuid-del-curso
 *               isActive:
 *                 type: boolean
 *                 description: Si el evento está activo
 *                 example: true
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
 *       403:
 *         description: Sin permisos para crear eventos en este curso
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

    // Obtener el teacher_id del usuario autenticado
    const { prisma } = await import('@/backend/config/prisma');
    const teacher = await prisma.teachers.findFirst({
      where: { user_id: userId },
    });

    // Si es un evento custom (no global), el usuario debe ser profesor
    if (validation.data.isGlobal === false && !teacher) {
      return NextResponse.json(
        { error: 'Solo los profesores pueden crear eventos personalizados' },
        { status: 403 }
      );
    }

    // Crear el evento (con teacher_id si es custom)
    const event = await EventService.createEvent(
      validation.data,
      teacher?.id
    );

    return NextResponse.json({ event }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/events:', error);
    
    // Si el error es de permisos, retornar 403
    if (error.message.includes('No tienes permiso')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Error al crear evento' },
      { status: 500 }
    );
  }
}
