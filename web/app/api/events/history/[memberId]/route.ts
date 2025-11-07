import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/backend/services/event/event.service';

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
