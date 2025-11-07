import { z } from 'zod';

export const CreateInvitationSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre es muy largo'),
  courseId: z.string().uuid('ID de curso inválido'),
  email: z.string().email('Email inválido').optional(),
});

export const CreateBulkInvitationsSchema = z.object({
  courseId: z.string().uuid('ID de curso inválido'),
  emails: z.array(z.string().email('Email inválido')).min(1, 'Debe proporcionar al menos un email'),
});

export const ValidateInvitationSchema = z.object({
  code: z.string().length(8, 'El código debe tener 8 caracteres'),
  userId: z.string().uuid('ID de usuario inválido'),
});

export const InvitationCodeSchema = z.object({
  code: z.string().length(8, 'El código debe tener 8 caracteres'),
});

export type CreateInvitationInput = z.infer<typeof CreateInvitationSchema>;
export type CreateBulkInvitationsInput = z.infer<typeof CreateBulkInvitationsSchema>;
export type ValidateInvitationInput = z.infer<typeof ValidateInvitationSchema>;
