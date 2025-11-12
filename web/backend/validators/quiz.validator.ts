import { z } from 'zod';

/**
 * Quiz Validators
 * Esquemas de validación Zod para quizzes
 */

export const QuizAnswerSchema = z.object({
  text: z.string().min(1, 'El texto de la respuesta es requerido').max(500, 'La respuesta es muy larga'),
  isCorrect: z.boolean(),
});

export const CreateQuizSchema = z.object({
  question: z.string().min(10, 'La pregunta debe tener al menos 10 caracteres').max(1000, 'La pregunta es muy larga'),
  answers: z.array(QuizAnswerSchema)
    .min(2, 'Debe haber al menos 2 respuestas')
    .max(4, 'Máximo 4 respuestas permitidas')
    .refine(
      (answers) => answers.filter(a => a.isCorrect).length === 1,
      { message: 'Debe haber exactamente una respuesta correcta' }
    ),
  correctAnswerIndex: z.number().int().min(0).max(3),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  points: z.number().int().min(10).max(1000).default(100),
  timeLimit: z.number().int().min(5).max(300).default(30),
  courseId: z.string().uuid('ID de curso inválido'),
});

export const UpdateQuizSchema = z.object({
  question: z.string().min(10).max(1000).optional(),
  answers: z.array(QuizAnswerSchema)
    .min(2)
    .max(4)
    .refine(
      (answers) => answers.filter(a => a.isCorrect).length === 1,
      { message: 'Debe haber exactamente una respuesta correcta' }
    )
    .optional(),
  correctAnswerIndex: z.number().int().min(0).max(3).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  points: z.number().int().min(10).max(1000).optional(),
  timeLimit: z.number().int().min(5).max(300).optional(),
});

export const SubmitQuizAnswerSchema = z.object({
  quizId: z.string().uuid('ID de quiz inválido'),
  characterId: z.string().uuid('ID de personaje inválido'),
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
