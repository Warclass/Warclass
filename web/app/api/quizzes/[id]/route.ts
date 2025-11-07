import { NextRequest, NextResponse } from 'next/server';
import { QuizService } from '@/backend/services/quiz/quiz.service';
import { UpdateQuizSchema } from '@/backend/validators/quiz.validator';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/quizzes/[id]
 * Obtener un quiz específico
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId');

    const quiz = await QuizService.getQuizById(params.id, memberId || undefined);

    return NextResponse.json({ quiz }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/quizzes/[id]:', error);
    
    if (error.message === 'Quiz no encontrado') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Error al obtener quiz' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/quizzes/[id]
 * Actualizar un quiz
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();

    // Validar datos
    const validation = UpdateQuizSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    // TODO: Verificar que el usuario es profesor del curso/grupo

    const quiz = await QuizService.updateQuiz(params.id, validation.data);

    return NextResponse.json({ quiz }, { status: 200 });
  } catch (error: any) {
    console.error('Error in PUT /api/quizzes/[id]:', error);
    
    if (error.message === 'Quiz no encontrado') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Error al actualizar quiz' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/quizzes/[id]
 * Eliminar un quiz
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // TODO: Verificar que el usuario es profesor del curso/grupo

    await QuizService.deleteQuiz(params.id);

    return NextResponse.json({ message: 'Quiz eliminado correctamente' }, { status: 200 });
  } catch (error: any) {
    console.error('Error in DELETE /api/quizzes/[id]:', error);
    
    if (error.message === 'Quiz no encontrado') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Error al eliminar quiz' },
      { status: 500 }
    );
  }
}
