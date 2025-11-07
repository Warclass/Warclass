import { z } from 'zod';

export const CreateGroupSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre es muy largo'),
  courseId: z.string().uuid('ID de curso inválido'),
});

export const UpdateGroupSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre es muy largo').optional(),
});

export const AssignMembersSchema = z.object({
  groupId: z.string().uuid('ID de grupo inválido'),
  memberIds: z.array(z.string().uuid('ID de miembro inválido')).min(1, 'Debe asignar al menos un miembro'),
});

export const GroupIdSchema = z.object({
  id: z.string().uuid('ID de grupo inválido'),
});

export type CreateGroupInput = z.infer<typeof CreateGroupSchema>;
export type UpdateGroupInput = z.infer<typeof UpdateGroupSchema>;
export type AssignMembersInput = z.infer<typeof AssignMembersSchema>;
