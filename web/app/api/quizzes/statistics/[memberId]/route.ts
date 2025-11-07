import { NextRequest, NextResponse } from 'next/server';
import { QuizService } from '@/backend/services/quiz/quiz.service';

interface RouteParams {
  params: {
    memberId: string;
  };
}

/**
 * GET /api/quizzes/statistics/[memberId]
 * Obtener estadísticas de un miembro en quizzes
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // TODO: Verificar que el usuario tiene acceso a este miembro

    const statistics = await QuizService.getMemberStatistics(params.memberId);

    return NextResponse.json({ statistics }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/quizzes/statistics/[memberId]:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
