/**
 * Quiz Types
 * Definiciones de tipos para el sistema de quizzes (multi-pregunta)
 */

// ⭐ NUEVO: Interfaz para una pregunta individual dentro de un quiz
export interface QuizQuestion {
  question: string;
  answers: QuizAnswer[];
  correctAnswerIndex: number;
  points: number;
  timeLimit: number; // segundos
}

export interface QuizAnswer {
  text: string;
  isCorrect?: boolean; // Opcional para no revelar respuestas al estudiante
}

export interface Quiz {
  id: string;
  title: string; // ⭐ NUEVO
  questions: QuizQuestion[]; // ⭐ MODIFICADO: Array de preguntas (antes era un solo "question")
  difficulty: 'easy' | 'medium' | 'hard';
  points: number; // Puntos totales (suma de todas las preguntas)
  timeLimit: number; // Tiempo total (suma de todas las preguntas)
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizHistory {
  id: string;
  quizId: string;
  characterId: string;
  questionIndex: number; // ⭐ NUEVO: Índice de la pregunta respondida
  isOnQuest: boolean;
  selectedAnswer: number;
  isCorrect: boolean;
  pointsEarned: number;
  timeTaken: number; // segundos
  answeredAt: Date;
}

export interface CreateQuizDTO {
  title: string; // ⭐ NUEVO
  questions: QuizQuestion[]; // ⭐ MODIFICADO: Array de 5-20 preguntas
  difficulty?: 'easy' | 'medium' | 'hard';
  courseId: string;
}

export interface UpdateQuizDTO {
  title?: string; // ⭐ NUEVO
  questions?: QuizQuestion[]; // ⭐ MODIFICADO
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface SubmitQuizAnswerDTO {
  quizId: string;
  characterId: string;
  questionIndex: number; // ⭐ NUEVO: Índice de la pregunta que se está respondiendo
  selectedAnswer: number;
  timeTaken: number;
  isOnQuest?: boolean;
}

export interface QuizResponse {
  id: string;
  title: string; // ⭐ NUEVO
  questions: {
    question: string;
    answers: { text: string }[]; // Sin isCorrect para no dar pistas
    points: number;
    timeLimit: number;
  }[]; // ⭐ MODIFICADO: Array de preguntas
  difficulty: string;
  points: number; // Puntos totales
  timeLimit: number; // Tiempo total
  totalQuestions: number; // ⭐ NUEVO: Número total de preguntas
  courseId: string;
  courseName?: string;
  teacherId?: string | null;
  teacherName?: string;
  questionsCompleted?: number; // ⭐ NUEVO: Cuántas preguntas ha respondido el estudiante
  completed?: boolean; // ⭐ MODIFICADO: true solo si respondió TODAS las preguntas
  score?: number;
  timeTaken?: number;
  createdAt?: Date;
}

export interface QuizResultResponse {
  id: string;
  quizId: string;
  questionIndex: number; // ⭐ NUEVO
  isCorrect: boolean;
  pointsEarned: number;
  timeTaken: number;
  correctAnswer: number;
  selectedAnswer: number;
  explanation?: string;
}

export interface QuizStatistics {
  totalQuizzes: number; // Total de quizzes del curso
  totalQuestions: number; // ⭐ NUEVO: Total de preguntas de todos los quizzes
  completedQuizzes: number; // Quizzes 100% completados
  answeredQuestions: number; // ⭐ NUEVO: Preguntas respondidas (no necesariamente todos los quizzes completos)
  correctAnswers: number;
  incorrectAnswers: number;
  totalPoints: number;
  averageTimeTaken: number;
  accuracy: number; // porcentaje
}

export interface LeaderboardEntry {
  position: number;
  characterId: string;
  characterName: string;
  className?: string;
  totalPoints: number;
  correctAnswers: number;
  totalAnswers: number;
  accuracy: number;
  averageTimeTaken: number;
}

export interface QuizWithHistory {
  id: string;
  title: string; // ⭐ NUEVO
  questions: {
    question: string;
    answers: { text: string }[];
    correctAnswerIndex?: number; // Solo revelado si ya respondió
    points: number;
    timeLimit: number;
    answered?: boolean; // ⭐ NUEVO: Si ya respondió esta pregunta
    userAnswer?: number; // ⭐ NUEVO: Respuesta del usuario si ya la respondió
    isCorrect?: boolean; // ⭐ NUEVO: Si fue correcta
    pointsEarned?: number; // ⭐ NUEVO: Puntos ganados en esta pregunta
  }[]; // ⭐ MODIFICADO
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeLimit: number;
  totalQuestions: number; // ⭐ NUEVO
  questionsCompleted: number; // ⭐ NUEVO
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
  completed: boolean; // true si respondió todas las preguntas
}
