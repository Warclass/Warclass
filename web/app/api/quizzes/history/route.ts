import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/backend/config/prisma';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const characterId = searchParams.get('characterId');
    const courseId = searchParams.get('courseId');

    if (!characterId && !courseId) {
      return NextResponse.json(
        { error: 'Se requiere characterId o courseId' },
        { status: 400 }
      );
    }

    // Obtener todas las respuestas
    let allAnswers;

    if (characterId) {
      allAnswers = await prisma.quizzes_history.findMany({
        where: {
          character_id: characterId,
        },
        include: {
          quiz: true,
          character: true,
        },
        orderBy: {
          answered_at: 'desc',
        },
      });
    } else if (courseId) {
      allAnswers = await prisma.quizzes_history.findMany({
        where: {
          quiz: {
            course_id: courseId,
          },
        },
        include: {
          quiz: true,
          character: true,
        },
        orderBy: {
          answered_at: 'desc',
        },
      });
    }

    // Agrupar respuestas por quiz_id + character_id
    const groupedByQuiz = new Map<string, any[]>();

    allAnswers?.forEach((answer) => {
      const key = `${answer.quiz_id}_${answer.character_id}`;
      if (!groupedByQuiz.has(key)) {
        groupedByQuiz.set(key, []);
      }
      groupedByQuiz.get(key)!.push(answer);
    });

    // Procesar solo quizzes completados y calcular estadísticas finales
    const completedQuizzes: any[] = [];

    for (const [key, answers] of groupedByQuiz.entries()) {
      const firstAnswer = answers[0];
      const quiz = firstAnswer.quiz;

      // Parsear las preguntas del quiz para saber cuántas hay
      let totalQuestions = 0;
      try {
        const parsedQuestions = JSON.parse(quiz.questions);
        totalQuestions = Array.isArray(parsedQuestions) ? parsedQuestions.length : 0;
      } catch (e) {
        console.error('Error parsing quiz questions:', e);
        continue;
      }

      // Verificar si el quiz está completo (todas las preguntas respondidas)
      const uniqueQuestionIndices = new Set(answers.map(a => a.question_index));
      const isComplete = uniqueQuestionIndices.size === totalQuestions;

      if (!isComplete) {
        continue; // Solo mostrar quizzes completados
      }

      // Calcular estadísticas
      const correctAnswers = answers.filter(a => a.is_correct).length;
      const totalPointsEarned = answers.reduce((sum, a) => sum + a.points_earned, 0);
      const totalTimeTaken = answers.reduce((sum, a) => sum + a.time_taken, 0);
      const percentage = Math.round((correctAnswers / totalQuestions) * 100);

      // Usar la fecha de la última respuesta como fecha de completación
      const completedAt = answers.reduce((latest, a) => {
        return new Date(a.answered_at) > new Date(latest) ? a.answered_at : latest;
      }, answers[0].answered_at);

      completedQuizzes.push({
        id: key,
        quizId: quiz.id,
        character: {
          id: firstAnswer.character.id,
          name: firstAnswer.character.name,
        },
        quiz: quiz.title, // ✅ Just return the title as string for PlayerLayout compatibility
        score: percentage,
        correctAnswers: correctAnswers,
        totalQuestions: totalQuestions,
        pointsEarned: totalPointsEarned,
        timeTaken: totalTimeTaken,
        completedAt: completedAt,
      });
    }

    // Ordenar por fecha de completación (más reciente primero)
    completedQuizzes.sort((a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    // Tomar solo los últimos 10
    const recentQuizzes = completedQuizzes.slice(0, 10);

    return NextResponse.json({
      success: true,
      data: recentQuizzes
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error in GET /api/quizzes/history:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener historial' },
      { status: 500 }
    );
  }
}
