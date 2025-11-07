import { z } from 'zod';

export const CreateTaskSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre es muy largo'),
  description: z.string().max(1000, 'La descripción es muy larga').optional(),
  experience: z.number().int().min(0, 'La experiencia debe ser positiva').default(0),
  gold: z.number().int().min(0, 'El oro debe ser positivo').default(0),
  health: z.number().int().default(0),
  energy: z.number().int().default(0),
});

export const UpdateTaskSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre es muy largo').optional(),
  description: z.string().max(1000, 'La descripción es muy larga').optional(),
  experience: z.number().int().min(0, 'La experiencia debe ser positiva').optional(),
  gold: z.number().int().min(0, 'El oro debe ser positivo').optional(),
  health: z.number().int().optional(),
  energy: z.number().int().optional(),
});

export const AssignTaskSchema = z.object({
  taskId: z.string().uuid('ID de tarea inválido'),
  groupIds: z.array(z.string().uuid('ID de grupo inválido')).min(1, 'Debe asignar al menos un grupo'),
});

export const CompleteTaskSchema = z.object({
  taskId: z.string().uuid('ID de tarea inválido'),
  memberId: z.string().uuid('ID de miembro inválido'),
});

export const TaskIdSchema = z.object({
  id: z.string().uuid('ID de tarea inválido'),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type AssignTaskInput = z.infer<typeof AssignTaskSchema>;
export type CompleteTaskInput = z.infer<typeof CompleteTaskSchema>;
