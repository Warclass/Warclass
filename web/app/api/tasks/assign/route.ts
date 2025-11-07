import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/backend/services/task/task.service';
import { AssignTaskSchema } from '@/backend/validators/task.validator';

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();

    const validation = AssignTaskSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    await TaskService.assignTaskToGroups(validation.data);

    return NextResponse.json({ message: 'Tarea asignada correctamente' }, { status: 200 });
  } catch (error: any) {
    console.error('Error in POST /api/tasks/assign:', error);

    if (error.message === 'Tarea no encontrada' || error.message.includes('Grupo')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Error al asignar tarea' },
      { status: 500 }
    );
  }
}
