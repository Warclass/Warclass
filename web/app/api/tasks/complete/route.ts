import { NextRequest, NextResponse } from 'next/server';
import { TaskService } from '@/backend/services/task/task.service';

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { taskId, memberId } = body;

    if (!taskId || !memberId) {
      return NextResponse.json(
        { error: 'taskId y memberId son requeridos' },
        { status: 400 }
      );
    }

    await TaskService.completeTask({ taskId, memberId });

    return NextResponse.json(
      { 
        success: true,
        message: 'Tarea completada exitosamente' 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/tasks/complete:', error);

    if (error.message === 'Tarea no encontrada' || error.message === 'Miembro no encontrado') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error.message === 'Esta tarea ya fue completada por este miembro') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: error.message || 'Error al completar tarea' },
      { status: 500 }
    );
  }
}
