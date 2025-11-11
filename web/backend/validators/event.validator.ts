import { z } from 'zod';

export const CreateEventSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  type: z.string().optional().default('neutral'),
  rank: z.enum(['S', 'A', 'B', 'C', 'D']).optional().default('D'),
  experience: z.number().optional().default(0),
  gold: z.number().optional().default(0),
  health: z.number().optional().default(0),
  energy: z.number().optional().default(0),
  isActive: z.boolean().optional().default(true),
  isGlobal: z.boolean().optional().default(true),
  courseId: z.string().uuid('ID de curso inválido').optional(),
});

export const UpdateEventSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  type: z.string().optional(),
  rank: z.enum(['S', 'A', 'B', 'C', 'D']).optional(),
  experience: z.number().optional(),
  gold: z.number().optional(),
  health: z.number().optional(),
  energy: z.number().optional(),
  isActive: z.boolean().optional(),
  isGlobal: z.boolean().optional(),
});

export const ApplyEventSchema = z.object({
  eventId: z.string().uuid('ID de evento inválido'),
  characterIds: z.array(z.string().uuid()).min(1, 'Debe seleccionar al menos un personaje'),
});
