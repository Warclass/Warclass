import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/backend/services/event/event.service';
import { ApplyEventSchema } from '@/backend/validators/event.validator';

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
