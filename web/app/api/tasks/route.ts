import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/backend/services/task/task.service';
import { CreateTaskSchema } from '@/backend/validators/task.validator';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');

    if (groupId) {
      const tasks = await TaskService.getTasksByGroup(groupId);
      return NextResponse.json({ tasks }, { status: 200 });
    }

    const tasks = await TaskService.getAllTasks();
    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/tasks:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener tareas' },
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

    const validation = CreateTaskSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const task = await TaskService.createTask(validation.data);

    return NextResponse.json({ task }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/tasks:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear tarea' },
      { status: 500 }
    );
  }
}
