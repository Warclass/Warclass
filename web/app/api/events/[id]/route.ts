import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/backend/services/event/event.service';
import { UpdateEventSchema } from '@/backend/validators/event.validator';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const event = await EventService.getEventById(id);
    return NextResponse.json({ event }, { status: 200 });
  } catch (error: any) {
    const { id } = await params;
    console.error(`Error in GET /api/events/${id}:`, error);
    if (error.message === 'Evento no encontrado') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: error.message || 'Error al obtener evento' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();

    const validation = UpdateEventSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { id } = await params;
    const event = await EventService.updateEvent(id, validation.data);

    return NextResponse.json({ event }, { status: 200 });
  } catch (error: any) {
    const { id } = await params;
    console.error(`Error in PUT /api/events/${id}:`, error);
    if (error.message === 'Evento no encontrado') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: error.message || 'Error al actualizar evento' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    await EventService.deleteEvent(id);

    return NextResponse.json({ message: 'Evento eliminado' }, { status: 200 });
  } catch (error: any) {
    const { id } = await params;
    console.error(`Error in DELETE /api/events/${id}:`, error);
    if (error.message === 'Evento no encontrado') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: error.message || 'Error al eliminar evento' },
      { status: 500 }
    );
  }
}
