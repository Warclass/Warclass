import { prisma } from '@/backend/config/prisma';
import {
  CreateQuizDTO,
  UpdateQuizDTO,
  SubmitQuizAnswerDTO,
  QuizResponse,
  QuizResultResponse,
  QuizStatistics,
  LeaderboardEntry,
  QuizWithHistory,
  QuizQuestion,
} from '@/backend/types/quiz.types';
import { notifyQuizCompleted } from '@/backend/services/discord/discord-webhook.service';

export class QuizService {
  /**
   * Crear un nuevo quiz con múltiples preguntas
   */
  static async createQuiz(data: CreateQuizDTO, teacherId?: string): Promise<QuizResponse> {
    try {
      // Verificar que el curso existe
      const course = await prisma.courses.findUnique({
        where: { id: data.courseId },
      });

      if (!course) {
        throw new Error('Curso no encontrado');
      }

      // Si se proporciona teacherId, verificar que sea profesor del curso
      if (teacherId) {
        const isTeacher = await prisma.teachers_courses.findFirst({
          where: {
            teacher_id: teacherId,
            course_id: data.courseId,
          },
        });

        if (!isTeacher) {
          throw new Error('No  tienes permiso para crear quizzes en este curso');
        }
      }

      // Calcular puntos y tiempo totales
      const totalPoints = data.questions.reduce((sum, q) => sum + q.points, 0);
      const totalTimeLimit = data.questions.reduce((sum, q) => sum + q.timeLimit, 0);

      // Crear el quiz
      const quiz = await prisma.quizzes.create({
        data: {
          title: data.title,
          questions: JSON.stringify(data.questions),
          difficulty: data.difficulty || 'medium',
          points: totalPoints,
          time_limit: totalTimeLimit,
          course_id: data.courseId,
          teacher_id: teacherId || null,
        },
        include: {
          course: true,
          teacher: teacherId ? {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          } : false,
        },
      });

      return this.formatQuizResponse(quiz);
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  }

  /**
   * Obtener un quiz por ID con progreso del personaje
   */
  static async getQuizById(quizId: string, characterId?: string): Promise<QuizWithHistory> {
    try {
      const quiz = await prisma.quizzes.findUnique({
        where: { id: quizId },
        include: {
          course: true,
          quizzes_history: characterId
            ? {
              where: { character_id: characterId },
            }
            : false,
        },
      });

      if (!quiz) {
        throw new Error('Quiz no encontrado');
      }

      const questions: QuizQuestion[] = JSON.parse(quiz.questions);
      const history = Array.isArray(quiz.quizzes_history) ? quiz.quizzes_history : [];

      // Mapear preguntas con su historial
      const questionsWithHistory = questions.map((q, index) => {
        const questionHistory = history.find(h => h.question_index === index);

        return {
          question: q.question,
          answers: q.answers.map(a => ({ text: a.text })), // Sin isCorrect
          correctAnswerIndex: questionHistory ? q.correctAnswerIndex : undefined, // Solo revelar si ya respondió
          points: q.points,
          timeLimit: q.timeLimit,
          answered: !!questionHistory,
          userAnswer: questionHistory?.selected_answer,
          isCorrect: questionHistory?.is_correct,
          pointsEarned: questionHistory?.points_earned,
        };
      });

      const questionsCompleted = history.length;
      const completed = questionsCompleted === questions.length;

      return {
        id: quiz.id,
        title: quiz.title,
        questions: questionsWithHistory,
        difficulty: quiz.difficulty as 'easy' | 'medium' | 'hard',
        points: quiz.points,
        timeLimit: quiz.time_limit,
        totalQuestions: questions.length,
        questionsCompleted,
        courseId: quiz.course_id,
        createdAt: quiz.created_at,
        updatedAt: quiz.updated_at,
        completed,
      };
    } catch (error) {
      console.error('Error getting quiz:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los quizzes de un grupo (deprecated)
   */
  static async getQuizzesByGroup(
    groupId: string,
    characterId?: string
  ): Promise<QuizResponse[]> {
    const group = await prisma.groups.findUnique({
      where: { id: groupId },
      select: { course_id: true },
    });

    if (!group) {
      throw new Error('Grupo no encontrado');
    }

    return this.getQuizzesByCourse(group.course_id, characterId);
  }

  /**
   * Obtener todos los quizzes de un curso
   */
  static async getQuizzesByCourse(
    courseId: string,
    characterId?: string
  ): Promise<QuizResponse[]> {
    try {
      const quizzes = await prisma.quizzes.findMany({
        where: {
          course_id: courseId,
        },
        include: {
          course: true,
          teacher: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          quizzes_history: characterId
            ? {
              where: { character_id: characterId },
            }
            : false,
        },
        orderBy: { created_at: 'desc' },
      });

      return quizzes.map((quiz) => this.formatQuizResponse(quiz, characterId));
    } catch (error) {
      console.error('Error getting quizzes by course:', error);
      throw error;
    }
  }

  /**
   * Actualizar un quiz
   */
  static async updateQuiz(quizId: string, data: UpdateQuizDTO): Promise<QuizResponse> {
    try {
      console.log('🔄 Updating quiz:', quizId, 'with data:', data);

      const updateData: any = {};

      if (data.title) updateData.title = data.title;
      if (data.questions) {
        updateData.questions = JSON.stringify(data.questions);
        // Recalcular puntos y tiempo totales
        const totalPoints = data.questions.reduce((sum, q) => sum + q.points, 0);
        const totalTimeLimit = data.questions.reduce((sum, q) => sum + q.timeLimit, 0);
        updateData.points = totalPoints;
        updateData.time_limit = totalTimeLimit;
      }
      if (data.difficulty) updateData.difficulty = data.difficulty;

      console.log('📦 Update data prepared:', updateData);

      const quiz = await prisma.quizzes.update({
        where: { id: quizId },
        data: updateData,
        include: {
          course: true,
        },
      });

      console.log('✅ Quiz updated successfully:', quiz.id);

      return this.formatQuizResponse(quiz);
    } catch (error) {
      console.error('❌ Error updating quiz:', error);
      throw error;
    }
  }

  /**
   * Eliminar un quiz
   */
  static async deleteQuiz(quizId: string): Promise<void> {
    try {
      await prisma.quizzes.delete({
        where: { id: quizId },
      });
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  }

  /**
   * Enviar respuesta a una pregunta específica de un quiz
   */
  static async submitAnswer(data: SubmitQuizAnswerDTO): Promise<QuizResultResponse> {
    try {
      // Obtener el quiz con curso incluido
      const quiz = await prisma.quizzes.findUnique({
        where: { id: data.quizId },
        include: {
          course: true,
        },
      });

      if (!quiz) {
        throw new Error('Quiz no encontrado');
      }

      const questions: QuizQuestion[] = JSON.parse(quiz.questions);

      // Validar questionIndex
      if (data.questionIndex < 0 || data.questionIndex >= questions.length) {
        throw new Error(`Índice de pregunta inválido. Debe estar entre 0 y ${questions.length - 1}`);
      }

      const currentQuestion = questions[data.questionIndex];

      // Verificar que el personaje existe
      const character = await prisma.characters.findUnique({
        where: { id: data.characterId },
      });

      if (!character) {
        throw new Error('Personaje no encontrado');
      }

      // Verificar si ya respondió esta pregunta
      const existingHistory = await prisma.quizzes_history.findUnique({
        where: {
          quiz_id_character_id_question_index: {
            quiz_id: data.quizId,
            character_id: data.characterId,
            question_index: data.questionIndex,
          },
        },
      });

      if (existingHistory) {
        throw new Error('Ya has respondido esta pregunta');
      }

      // Verificar si la respuesta es correcta
      const isCorrect = data.selectedAnswer === currentQuestion.correctAnswerIndex;

      // Calcular puntos ganados
      let pointsEarned = 0;
      if (isCorrect) {
        // Bonus por velocidad
        const timeBonus = Math.max(0, 1 - data.timeTaken / currentQuestion.timeLimit);
        pointsEarned = Math.round(currentQuestion.points * (1 + timeBonus * 0.5));
      }

      // Guardar en el historial
      const history = await prisma.quizzes_history.create({
        data: {
          quiz_id: data.quizId,
          character_id: data.characterId,
          question_index: data.questionIndex,
          selected_answer: data.selectedAnswer,
          is_correct: isCorrect,
          points_earned: pointsEarned,
          time_taken: data.timeTaken,
          is_on_quest: data.isOnQuest || false,
        },
      });

      // Verificar si completó todas las preguntas del quiz
      const allHistory = await prisma.quizzes_history.findMany({
        where: {
          quiz_id: data.quizId,
          character_id: data.characterId,
        },
      });

      const completedQuiz = allHistory.length === questions.length;

      // Si completó el quiz, actualizar experiencia y oro
      if (completedQuiz) {
        const totalPointsEarned = allHistory.reduce((sum, h) => sum + h.points_earned, 0);
        const bonusMultiplier = 1.2; // 20% bonus por completar todo el quiz

        await prisma.characters.update({
          where: { id: data.characterId },
          data: {
            experience: { increment: Math.round(totalPointsEarned * bonusMultiplier) },
            gold: { increment: Math.round((totalPointsEarned * bonusMultiplier) / 10) },
          },
        });
      } else if (isCorrect) {
        // Si no completó el quiz pero respondió correctamente, dar experiencia/oro parcial
        await prisma.characters.update({
          where: { id: data.characterId },
          data: {
            experience: { increment: pointsEarned },
            gold: { increment: Math.round(pointsEarned / 10) },
          },
        });
      }

      // 🔔 Enviar notificación a Discord si el curso tiene webhook configurado
      if (quiz.course_id) {
        try {
          const teacherCourse = await prisma.teachers_courses.findFirst({
            where: {
              course_id: quiz.course_id,
              discord_webhook_url: { not: null },
            },
          });

          if (teacherCourse?.discord_webhook_url) {
            await notifyQuizCompleted(teacherCourse.discord_webhook_url, {
              characterName: character.name,
              quizQuestion: quiz.question,
              isCorrect,
              pointsEarned,
              timeTaken: data.timeTaken,
              courseName: quiz.course?.name || 'Curso desconocido',
            });
          }
        } catch (webhookError) {
          console.error('❌ Error al enviar notificación de quiz a Discord:', webhookError);
          // No lanzamos error para no interrumpir el flujo principal
        }
      }

      return {
        id: history.id,
        quizId: data.quizId,
        questionIndex: data.questionIndex,
        isCorrect,
        pointsEarned,
        timeTaken: data.timeTaken,
        correctAnswer: currentQuestion.correctAnswerIndex,
        selectedAnswer: data.selectedAnswer,
      };
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de un personaje en quizzes
   */
  static async getCharacterStatistics(characterId: string): Promise<QuizStatistics> {
    try {
      const history = await prisma.quizzes_history.findMany({
        where: { character_id: characterId },
        include: {
          quiz: true,
        },
      });

      const character = await prisma.characters.findUnique({
        where: { id: characterId },
        include: {
          course: true,
        },
      });

      // Obtener todos los quizzes del curso
      const allQuizzes = character?.course_id
        ? await prisma.quizzes.findMany({
          where: { course_id: character.course_id }
        })
        : [];

      const totalQuizzes = allQuizzes.length;
      const totalQuestions = allQuizzes.reduce((sum, quiz) => {
        const questions = JSON.parse(quiz.questions);
        return sum + questions.length;
      }, 0);

      // Agrupar historial por quiz para contar completados
      const quizCompletionMap = new Map<string, number>();
      history.forEach(h => {
        quizCompletionMap.set(h.quiz_id, (quizCompletionMap.get(h.quiz_id) || 0) + 1);
      });

      let completedQuizzes = 0;
      allQuizzes.forEach(quiz => {
        const questions = JSON.parse(quiz.questions);
        const answered = quizCompletionMap.get(quiz.id) || 0;
        if (answered === questions.length) {
          completedQuizzes++;
        }
      });

      const answeredQuestions = history.length;
      const correctAnswers = history.filter((h) => h.is_correct).length;
      const incorrectAnswers = answeredQuestions - correctAnswers;
      const totalPoints = history.reduce((sum, h) => sum + h.points_earned, 0);
      const averageTimeTaken =
        answeredQuestions > 0
          ? history.reduce((sum, h) => sum + h.time_taken, 0) / answeredQuestions
          : 0;
      const accuracy = answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0;

      return {
        totalQuizzes,
        totalQuestions,
        completedQuizzes,
        answeredQuestions,
        correctAnswers,
        incorrectAnswers,
        totalPoints,
        averageTimeTaken,
        accuracy,
      };
    } catch (error) {
      console.error('Error getting character statistics:', error);
      throw error;
    }
  }

  /**
   * Obtener leaderboard de un grupo
   */
  static async getGroupLeaderboard(groupId: string): Promise<LeaderboardEntry[]> {
    try {
      const characters = await prisma.characters.findMany({
        where: { group_id: groupId },
        include: {
          quizzes_history: true,
          class: true,
        },
      });

      const leaderboard = characters.map((character) => {
        const correctAnswers = character.quizzes_history.filter((h) => h.is_correct).length;
        const totalAnswers = character.quizzes_history.length;
        const totalPoints = character.quizzes_history.reduce((sum, h) => sum + h.points_earned, 0);
        const averageTimeTaken =
          totalAnswers > 0
            ? character.quizzes_history.reduce((sum, h) => sum + h.time_taken, 0) / totalAnswers
            : 0;
        const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

        return {
          position: 0,
          characterId: character.id,
          characterName: character.name,
          className: character.class?.name,
          totalPoints,
          correctAnswers,
          totalAnswers,
          accuracy,
          averageTimeTaken,
        };
      });

      leaderboard.sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
        return a.averageTimeTaken - b.averageTimeTaken;
      });

      leaderboard.forEach((entry, index) => {
        entry.position = index + 1;
      });

      return leaderboard;
    } catch (error) {
      console.error('Error getting group leaderboard:', error);
      throw error;
    }
  }

  /**
   * Obtener leaderboard de un curso
   */
  static async getCourseLeaderboard(courseId: string): Promise<LeaderboardEntry[]> {
    try {
      const characters = await prisma.characters.findMany({
        where: {
          group: {
            course_id: courseId,
          },
        },
        include: {
          quizzes_history: true,
          class: true,
        },
      });

      const leaderboard = characters.map((character) => {
        const correctAnswers = character.quizzes_history.filter((h) => h.is_correct).length;
        const totalAnswers = character.quizzes_history.length;
        const totalPoints = character.quizzes_history.reduce((sum, h) => sum + h.points_earned, 0);
        const averageTimeTaken =
          totalAnswers > 0
            ? character.quizzes_history.reduce((sum, h) => sum + h.time_taken, 0) / totalAnswers
            : 0;
        const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

        return {
          position: 0,
          characterId: character.id,
          characterName: character.name,
          className: character.class?.name,
          totalPoints,
          correctAnswers,
          totalAnswers,
          accuracy,
          averageTimeTaken,
        };
      });

      leaderboard.sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
        return a.averageTimeTaken - b.averageTimeTaken;
      });

      leaderboard.forEach((entry, index) => {
        entry.position = index + 1;
      });

      return leaderboard;
    } catch (error) {
      console.error('Error getting course leaderboard:', error);
      throw error;
    }
  }

  /**
   * Formatear respuesta de quiz
   */
  private static formatQuizResponse(quiz: any, characterId?: string): QuizResponse {
    const questions: QuizQuestion[] = JSON.parse(quiz.questions);
    const history = Array.isArray(quiz.quizzes_history) ? quiz.quizzes_history : [];

    const questionsForResponse = questions.map((q, index) => ({
      question: q.question,
      answers: q.answers.map((a: any) => ({ text: a.text })),
      points: q.points,
      timeLimit: q.timeLimit,
    }));

    const questionsCompleted = characterId ? history.length : undefined;
    const completed = characterId ? (history.length === questions.length) : undefined;

    return {
      id: quiz.id,
      title: quiz.title,
      questions: questionsForResponse,
      difficulty: quiz.difficulty,
      points: quiz.points,
      timeLimit: quiz.time_limit,
      totalQuestions: questions.length,
      courseId: quiz.course_id,
      courseName: quiz.course?.name,
      teacherId: quiz.teacher_id,
      teacherName: quiz.teacher?.user?.name,
      questionsCompleted,
      completed,
      createdAt: quiz.created_at,
    };
  }
}
