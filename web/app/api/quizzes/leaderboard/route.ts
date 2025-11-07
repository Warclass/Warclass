import { NextRequest, NextResponse } from 'next/server';
import { QuizService } from '@/backend/services/quiz/quiz.service';

/**
 * GET /api/quizzes/leaderboard
 * Obtener leaderboard de un grupo o curso
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

    if (!groupId && !courseId) {
      return NextResponse.json(
        { error: 'Debe proporcionar groupId o courseId' },
        { status: 400 }
      );
    }

    let leaderboard;

    if (groupId) {
      // Leaderboard de un grupo específico
      leaderboard = await QuizService.getGroupLeaderboard(groupId);
    } else if (courseId) {
      // Leaderboard de un curso específico
      leaderboard = await QuizService.getCourseLeaderboard(courseId);
    }

    return NextResponse.json({ leaderboard }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/quizzes/leaderboard:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener leaderboard' },
      { status: 500 }
    );
  }
}
