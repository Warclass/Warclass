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
  QuizAnswer,
} from '@/backend/types/quiz.types';

export class QuizService {
  /**
   * Crear un nuevo quiz
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
          throw new Error('No tienes permiso para crear quizzes en este curso');
        }
      }

      // Crear el quiz con course_id y teacher_id
      const quiz = await prisma.quizzes.create({
        data: {
          question: data.question,
          answers: JSON.stringify(data.answers),
          correct_answer_index: data.correctAnswerIndex,
          difficulty: data.difficulty || 'medium',
          points: data.points || 100,
          time_limit: data.timeLimit || 30,
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
   * Obtener un quiz por ID (sin revelar la respuesta correcta)
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
                take: 1,
              }
            : false,
        },
      });

      if (!quiz) {
        throw new Error('Quiz no encontrado');
      }

      const parsedAnswers = JSON.parse(quiz.answers);
      // Manejar tanto string[] como QuizAnswer[] del seed
      const answers = Array.isArray(parsedAnswers) 
        ? parsedAnswers.map((answer: any) => {
            // Si es un objeto con text, extraer solo el text
            if (typeof answer === 'object' && answer.text) {
              return { text: answer.text };
            }
            // Si es un string, convertirlo a objeto
            return { text: answer };
          })
        : [];
      
      const history = Array.isArray(quiz.quizzes_history) && quiz.quizzes_history[0];

      return {
        id: quiz.id,
        question: quiz.question,
        answers: answers,
        correctAnswerIndex: quiz.correct_answer_index,
        difficulty: quiz.difficulty as 'easy' | 'medium' | 'hard',
        points: quiz.points,
        timeLimit: quiz.time_limit,
        courseId: quiz.course_id,
        createdAt: quiz.created_at,
        updatedAt: quiz.updated_at,
        completed: !!history,
        userAnswer: history ? history.selected_answer : undefined,
        isCorrect: history ? history.is_correct : undefined,
        pointsEarned: history ? history.points_earned : undefined,
      };
    } catch (error) {
      console.error('Error getting quiz:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los quizzes de un curso
   * @deprecated Use getQuizzesByCourse instead
   */
  static async getQuizzesByGroup(
    groupId: string,
    characterId?: string
  ): Promise<QuizResponse[]> {
    // Mantener por compatibilidad, pero redirigir a getQuizzesByCourse
    // Necesitamos obtener el courseId del grupo
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

      return quizzes.map((quiz) => this.formatQuizResponse(quiz));
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

      if (data.question) updateData.question = data.question;
      if (data.answers) updateData.answers = JSON.stringify(data.answers);
      if (data.correctAnswerIndex !== undefined)
        updateData.correct_answer_index = data.correctAnswerIndex;
      if (data.difficulty) updateData.difficulty = data.difficulty;
      if (data.points !== undefined) updateData.points = data.points;
      if (data.timeLimit !== undefined) updateData.time_limit = data.timeLimit;

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
   * Enviar respuesta a un quiz
   */
  static async submitAnswer(data: SubmitQuizAnswerDTO): Promise<QuizResultResponse> {
    try {
      // Obtener el quiz
      const quiz = await prisma.quizzes.findUnique({
        where: { id: data.quizId },
      });

      if (!quiz) {
        throw new Error('Quiz no encontrado');
      }

      // Verificar que el personaje existe
      const character = await prisma.characters.findUnique({
        where: { id: data.characterId },
      });

      if (!character) {
        throw new Error('Personaje no encontrado');
      }

      // Verificar si ya respondió este quiz
      const existingHistory = await prisma.quizzes_history.findUnique({
        where: {
          quiz_id_character_id: {
            quiz_id: data.quizId,
            character_id: data.characterId,
          },
        },
      });

      if (existingHistory) {
        throw new Error('Ya has respondido este quiz');
      }

      // Verificar si la respuesta es correcta
      const isCorrect = data.selectedAnswer === quiz.correct_answer_index;

      // Calcular puntos ganados
      let pointsEarned = 0;
      if (isCorrect) {
        // Bonus por velocidad: más rápido = más puntos
        const timeBonus = Math.max(0, 1 - data.timeTaken / quiz.time_limit);
        pointsEarned = Math.round(quiz.points * (1 + timeBonus * 0.5));
      }

      // Guardar en el historial
      const history = await prisma.quizzes_history.create({
        data: {
          quiz_id: data.quizId,
          character_id: data.characterId,
          selected_answer: data.selectedAnswer,
          is_correct: isCorrect,
          points_earned: pointsEarned,
          time_taken: data.timeTaken,
          is_on_quest: data.isOnQuest || false,
        },
      });

      // Actualizar experiencia y oro del personaje si es correcto
      if (isCorrect) {
        await prisma.characters.update({
          where: { id: data.characterId },
          data: {
            experience: { increment: pointsEarned },
            gold: { increment: Math.round(pointsEarned / 10) },
          },
        });
      }

      return {
        id: history.id,
        quizId: data.quizId,
        isCorrect,
        pointsEarned,
        timeTaken: data.timeTaken,
        correctAnswer: quiz.correct_answer_index,
        selectedAnswer: data.selectedAnswer,
      };
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de un miembro en quizzes
   */
  static async getCharacterStatistics(characterId: string): Promise<QuizStatistics> {
    try {
      const history = await prisma.quizzes_history.findMany({
        where: { character_id: characterId },
      });

      const character = await prisma.characters.findUnique({
        where: { id: characterId },
        include: {
          course: true,
        },
      });

      // Obtener total de quizzes del curso
      const totalQuizzes = character?.course_id 
        ? await prisma.quizzes.count({
            where: { course_id: character.course_id }
          })
        : 0;
      
      const completedQuizzes = history.length;
      const correctAnswers = history.filter((h) => h.is_correct).length;
      const incorrectAnswers = completedQuizzes - correctAnswers;
      const totalPoints = history.reduce((sum, h) => sum + h.points_earned, 0);
      const averageTimeTaken =
        completedQuizzes > 0
          ? history.reduce((sum, h) => sum + h.time_taken, 0) / completedQuizzes
          : 0;
      const accuracy = completedQuizzes > 0 ? (correctAnswers / completedQuizzes) * 100 : 0;

      return {
        totalQuizzes,
        completedQuizzes,
        correctAnswers,
        incorrectAnswers,
        totalPoints,
        averageTimeTaken,
        accuracy,
      };
    } catch (error) {
      console.error('Error getting member statistics:', error);
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
          position: 0, // Se calcula después
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

      // Ordenar por puntos totales (descendente) y luego por tiempo promedio (ascendente)
      leaderboard.sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
        return a.averageTimeTaken - b.averageTimeTaken;
      });

      // Asignar posiciones
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
   * Formatear respuesta de quiz (sin revelar respuesta correcta)
   */
  private static formatQuizResponse(quiz: any): QuizResponse {
    const parsedAnswers = JSON.parse(quiz.answers);
    // Manejar tanto string[] como QuizAnswer[] del seed
    const answers = Array.isArray(parsedAnswers) 
      ? parsedAnswers.map((answer: any) => {
          // Si es un objeto con text, extraer solo el text
          if (typeof answer === 'object' && answer.text) {
            return { text: answer.text };
          }
          // Si es un string, convertirlo a objeto
          return { text: answer };
        })
      : [];
    
    const history = Array.isArray(quiz.quizzes_history) && quiz.quizzes_history[0];

    return {
      id: quiz.id,
      question: quiz.question,
      answers: answers, // Solo el texto, sin isCorrect
      difficulty: quiz.difficulty,
      points: quiz.points,
      timeLimit: quiz.time_limit,
      courseId: quiz.course_id,
      courseName: quiz.course?.name,
      teacherId: quiz.teacher_id,
      teacherName: quiz.teacher?.user?.name,
      completed: !!history,
      score: history ? (history.is_correct ? 100 : 0) : undefined,
      timeTaken: history?.time_taken,
      createdAt: quiz.created_at,
    };
  }
}
