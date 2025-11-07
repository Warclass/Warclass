import { NextRequest, NextResponse } from 'next/server';
import { QuizService } from '@/backend/services/quiz/quiz.service';
import { SubmitQuizAnswerSchema } from '@/backend/validators/quiz.validator';

/**
 * POST /api/quizzes/submit
 * Enviar respuesta a un quiz
 */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();

    // Validar datos
    const validation = SubmitQuizAnswerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    // TODO: Verificar que el memberId pertenece al usuario

    const result = await QuizService.submitAnswer(validation.data);

    return NextResponse.json({ result }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/quizzes/submit:', error);

    if (error.message === 'Quiz no encontrado' || error.message === 'Miembro no encontrado') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error.message === 'Ya has respondido este quiz') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: error.message || 'Error al enviar respuesta' },
      { status: 500 }
    );
  }
}
