import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/backend/services/task/task.service';
import { UpdateTaskSchema } from '@/backend/validators/task.validator';

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

    const task = await TaskService.getTaskById(params.id);

    return NextResponse.json({ task }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/tasks/[id]:', error);

    if (error.message === 'Tarea no encontrada') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Error al obtener tarea' },
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

    const validation = UpdateTaskSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const task = await TaskService.updateTask(params.id, validation.data);

    return NextResponse.json({ task }, { status: 200 });
  } catch (error: any) {
    console.error('Error in PUT /api/tasks/[id]:', error);

    if (error.message === 'Tarea no encontrada') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Error al actualizar tarea' },
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

    await TaskService.deleteTask(params.id);

    return NextResponse.json({ message: 'Tarea eliminada correctamente' }, { status: 200 });
  } catch (error: any) {
    console.error('Error in DELETE /api/tasks/[id]:', error);

    if (error.message === 'Tarea no encontrada') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Error al eliminar tarea' },
      { status: 500 }
    );
  }
}
