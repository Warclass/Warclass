import { z } from 'zod';

/**
 * Validator para crear un teacher
 * Convierte un user existente en teacher
 */
export const CreateTeacherSchema = z.object({
  userId: z.string().uuid('userId debe ser un UUID válido'),
  internalId: z.string().min(1).max(50).optional().nullable(),
  institutionId: z.string().uuid('institutionId debe ser un UUID válido').optional().nullable(),
});

/**
 * Validator para actualizar un teacher
 * Permite cambiar internal_id o institution_id
 */
export const UpdateTeacherSchema = z.object({
  internalId: z.string().min(1).max(50).optional().nullable(),
  institutionId: z.string().uuid('institutionId debe ser un UUID válido').optional().nullable(),
});

export type CreateTeacherInput = z.infer<typeof CreateTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof UpdateTeacherSchema>;
