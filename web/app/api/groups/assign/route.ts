import { NextRequest, NextResponse } from 'next/server';
import { GroupService } from '@/backend/services/group/group.service';
import { AssignMembersSchema } from '@/backend/validators/group.validator';

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();

    const validation = AssignMembersSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    await GroupService.assignMembers(validation.data);

    return NextResponse.json({ message: 'Miembros asignados correctamente' }, { status: 200 });
  } catch (error: any) {
    console.error('Error in POST /api/groups/assign:', error);

    if (error.message === 'Grupo no encontrado') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Error al asignar miembros' },
      { status: 500 }
    );
  }
}
