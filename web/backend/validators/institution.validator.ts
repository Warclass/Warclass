import { z } from 'zod';

/**
 * Validator para crear una institución
 */
export const CreateInstitutionSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(200),
  phoneNumber: z.string().min(7).max(20).optional().nullable(),
});

/**
 * Validator para actualizar una institución
 */
export const UpdateInstitutionSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(200).optional(),
  phoneNumber: z.string().min(7).max(20).optional().nullable(),
});

/**
 * Validator para asignar un teacher a una institución
 */
export const AssignTeacherSchema = z.object({
  teacherId: z.string().uuid('teacherId debe ser un UUID válido'),
  internalId: z.string().min(1).max(50).optional().nullable(),
});

export type CreateInstitutionInput = z.infer<typeof CreateInstitutionSchema>;
export type UpdateInstitutionInput = z.infer<typeof UpdateInstitutionSchema>;
export type AssignTeacherInput = z.infer<typeof AssignTeacherSchema>;
