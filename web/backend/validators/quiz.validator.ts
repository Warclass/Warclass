import { z } from 'zod';

/**
 * Quiz Validators
 * Esquemas de validación Zod para quizzes multi-pregunta
 */

// ⭐ NUEVO: Validador para una pregunta individual
export const QuizQuestionSchema = z.object({
  question: z.string().min(10, 'La pregunta debe tener al menos 10 caracteres').max(1000, 'La pregunta es muy larga'),
  answers: z.array(
    z.object({
      text: z.string().min(1, 'El texto de la respuesta es requerido').max(500, 'La respuesta es muy larga'),
      isCorrect: z.boolean(),
    })
  )
    .min(2, 'Cada pregunta debe tener al menos 2 respuestas')
    .max(4, 'Máximo 4 respuestas por pregunta')
    .refine(
      (answers) => answers.filter(a => a.isCorrect).length === 1,
      { message: 'Cada pregunta debe tener exactamente una respuesta correcta' }
    ),
  correctAnswerIndex: z.number().int().min(0).max(3),
  points: z.number().int().min(10, 'Mínimo 10 puntos por pregunta').max(500, 'Máximo 500 puntos por pregunta').default(10),
  timeLimit: z.number().int().min(5, 'Mínimo 5 segundos por pregunta').max(120, 'Máximo 120 segundos por pregunta').default(30),
});

export const QuizAnswerSchema = z.object({
  text: z.string().min(1, 'El texto de la respuesta es requerido').max(500, 'La respuesta es muy larga'),
  isCorrect: z.boolean(),
});

export const CreateQuizSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(100, 'El título es muy largo'),
  questions: z.array(QuizQuestionSchema)
    .min(5, 'El quiz debe tener al menos 5 preguntas')
    .max(20, 'El quiz puede tener máximo 20 preguntas'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  courseId: z.string().uuid('ID de curso inválido'),
});

export const UpdateQuizSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  questions: z.array(QuizQuestionSchema)
    .min(5)
    .max(20)
    .optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

export const SubmitQuizAnswerSchema = z.object({
  quizId: z.string().uuid('ID de quiz inválido'),
  characterId: z.string().uuid('ID de personaje inválido'),
  questionIndex: z.number().int().min(0, 'El índice de pregunta debe ser >= 0'), // ⭐ NUEVO
  selectedAnswer: z.number().int().min(0).max(3, 'Respuesta inválida'),
  timeTaken: z.number().int().min(0, 'El tiempo no puede ser negativo'),
  isOnQuest: z.boolean().default(false),
});

export const GetQuizzesQuerySchema = z.object({
  groupId: z.string().uuid().optional(),
  courseId: z.string().uuid().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  completed: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(50).optional(),
  offset: z.number().int().min(0).default(0).optional(),
});

// Validación para parámetros de ID
export const QuizIdSchema = z.object({
  id: z.string().uuid('ID de quiz inválido'),
});

export const GroupIdSchema = z.object({
  groupId: z.string().uuid('ID de grupo inválido'),
});

// Tipos inferidos de los schemas
export type CreateQuizInput = z.infer<typeof CreateQuizSchema>;
export type UpdateQuizInput = z.infer<typeof UpdateQuizSchema>;
export type SubmitQuizAnswerInput = z.infer<typeof SubmitQuizAnswerSchema>;
export type GetQuizzesQuery = z.infer<typeof GetQuizzesQuerySchema>;
export type QuizQuestionInput = z.infer<typeof QuizQuestionSchema>;
