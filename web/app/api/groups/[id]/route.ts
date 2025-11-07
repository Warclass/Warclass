import { NextRequest, NextResponse } from 'next/server';
import { GroupService } from '@/backend/services/group/group.service';
import { UpdateGroupSchema } from '@/backend/validators/group.validator';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const group = await GroupService.getGroupById(params.id);

    return NextResponse.json({ group }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/groups/[id]:', error);

    if (error.message === 'Grupo no encontrado') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Error al obtener grupo' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();

    const validation = UpdateGroupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const group = await GroupService.updateGroup(params.id, validation.data);

    return NextResponse.json({ group }, { status: 200 });
  } catch (error: any) {
    console.error('Error in PUT /api/groups/[id]:', error);

    if (error.message === 'Grupo no encontrado') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Error al actualizar grupo' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await GroupService.deleteGroup(params.id);

    return NextResponse.json({ message: 'Grupo eliminado correctamente' }, { status: 200 });
  } catch (error: any) {
    console.error('Error in DELETE /api/groups/[id]:', error);

    if (error.message === 'Grupo no encontrado') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Error al eliminar grupo' },
      { status: 500 }
    );
  }
}
