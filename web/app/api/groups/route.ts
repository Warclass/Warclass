import { NextRequest, NextResponse } from 'next/server';
import { GroupService } from '@/backend/services/group/group.service';
import { CreateGroupSchema } from '@/backend/validators/group.validator';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'courseId es requerido' }, { status: 400 });
    }

    const groups = await GroupService.getGroupsByCourse(courseId);

    return NextResponse.json({ groups }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/groups:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener grupos' },
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

    const validation = CreateGroupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const group = await GroupService.createGroup(validation.data);

    return NextResponse.json({ group }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/groups:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear grupo' },
      { status: 500 }
    );
  }
}
