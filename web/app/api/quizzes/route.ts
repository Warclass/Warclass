import { NextRequest, NextResponse } from 'next/server';
import { QuizService } from '@/backend/services/quiz/quiz.service';
import { CreateQuizSchema, GetQuizzesQuerySchema } from '@/backend/validators/quiz.validator';

/**
 * GET /api/quizzes
 * Obtener quizzes con filtros opcionales
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');
    const courseId = searchParams.get('courseId');
    const memberId = searchParams.get('memberId');

    // Validar parámetros
    const queryValidation = GetQuizzesQuerySchema.safeParse({
      groupId: groupId || undefined,
      courseId: courseId || undefined,
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        { error: 'Parámetros inválidos', details: queryValidation.error.issues },
        { status: 400 }
      );
    }

    let quizzes;

    if (groupId) {
      // Obtener quizzes de un grupo específico
      quizzes = await QuizService.getQuizzesByGroup(groupId, memberId || undefined);
    } else if (courseId) {
      // Obtener quizzes de un curso específico
      quizzes = await QuizService.getQuizzesByCourse(courseId, memberId || undefined);
    } else {
      return NextResponse.json(
        { error: 'Debe proporcionar groupId o courseId' },
        { status: 400 }
      );
    }

    return NextResponse.json({ quizzes }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/quizzes:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener quizzes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/quizzes
 * Crear un nuevo quiz
 */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();

    // Validar datos
    const validation = CreateQuizSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    // TODO: Verificar que el usuario es profesor del curso/grupo

    const quiz = await QuizService.createQuiz(validation.data);

    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/quizzes:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear quiz' },
      { status: 500 }
    );
  }
}
