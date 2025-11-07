import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/backend/services/event/event.service';

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
