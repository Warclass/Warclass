/**
 * Quiz Types
 * Definiciones de tipos para el sistema de quizzes tipo Kahoot
 */

export interface QuizAnswer {
  text: string;
  isCorrect: boolean;
}

export interface Quiz {
  id: string;
  question: string;
  answers: QuizAnswer[];
  correctAnswerIndex: number;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeLimit: number; // segundos
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizHistory {
  id: string;
  quizId: string;
  characterId: string;
  isOnQuest: boolean;
  selectedAnswer: number;
  isCorrect: boolean;
  pointsEarned: number;
  timeTaken: number; // segundos
  answeredAt: Date;
}

export interface CreateQuizDTO {
  question: string;
  answers: QuizAnswer[];
  correctAnswerIndex: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  points?: number;
  timeLimit?: number;
  courseId: string;
}

export interface UpdateQuizDTO {
  question?: string;
  answers?: QuizAnswer[];
  correctAnswerIndex?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  points?: number;
  timeLimit?: number;
}

export interface SubmitQuizAnswerDTO {
  quizId: string;
  characterId: string;
  selectedAnswer: number;
  timeTaken: number;
  isOnQuest?: boolean;
}

export interface QuizResponse {
  id: string;
  question: string;
  answers: { text: string }[]; // Sin la propiedad isCorrect para no dar pistas
  difficulty: string;
  points: number;
  timeLimit: number;
  courseId: string;
  courseName?: string;
  teacherId?: string | null;
  teacherName?: string;
  completed?: boolean;
  score?: number;
  timeTaken?: number;
  createdAt?: Date;
}

export interface QuizResultResponse {
  id: string;
  quizId: string;
  isCorrect: boolean;
  pointsEarned: number;
  timeTaken: number;
  correctAnswer: number;
  selectedAnswer: number;
  explanation?: string;
}

export interface QuizStatistics {
  totalQuizzes: number;
  completedQuizzes: number;
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
  question: string;
  answers: { text: string }[]; // Sin isCorrect para no revelar la respuesta
  correctAnswerIndex: number;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeLimit: number;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
  completed: boolean;
  userAnswer?: number;
  isCorrect?: boolean;
  pointsEarned?: number;
}
