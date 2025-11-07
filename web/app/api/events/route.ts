import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/backend/services/event/event.service';
import { CreateEventSchema } from '@/backend/validators/event.validator';

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
