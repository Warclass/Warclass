import { prisma } from '@/backend/config/prisma';
import {
  CreateTaskDTO,
  UpdateTaskDTO,
  AssignTaskDTO,
  CompleteTaskDTO,
  TaskWithAssignments,
  TaskProgress,
} from '@/backend/types/task.types';
import { notifyTaskCompleted } from '@/backend/services/discord/discord-webhook.service';

export class TaskService {
  static async createTask(data: CreateTaskDTO): Promise<TaskWithAssignments> {
    try {
      const task = await prisma.tasks.create({
        data: {
          name: data.name,
          description: data.description,
          experience: data.experience || 0,
          gold: data.gold || 0,
          health: data.health || 0,
          energy: data.energy || 0,
        },
      });

      return {
        id: task.id,
        name: task.name,
        description: task.description,
        experience: task.experience,
        gold: task.gold,
        health: task.health,
        energy: task.energy,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        assignedGroups: [],
        completedCount: 0,
        totalAssigned: 0,
      };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * @deprecated Esta función usa teachers_courses_tasks que es legacy. Usar getTasksByGroupForCharacter en su lugar
   */
  static async getTaskById(taskId: string): Promise<TaskWithAssignments> {
    try {
      const task = await prisma.tasks.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        throw new Error('Tarea no encontrada');
      }

      return {
        id: task.id,
        name: task.name,
        description: task.description,
        experience: task.experience,
        gold: task.gold,
        health: task.health,
        energy: task.energy,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        assignedGroups: [],
        completedCount: 0,
        totalAssigned: 0,
      };
    } catch (error) {
      console.error('Error getting task by id:', error);
      throw error;
    }
  }

  /**
   * @deprecated Esta función usa teachers_courses_tasks que es legacy
   */
  static async getAllTasks(): Promise<TaskWithAssignments[]> {
    throw new Error('getAllTasks está deprecado');
  }

  /**
   * @deprecated Usar getTasksByGroupForCharacter para obtener info de tareas por personaje
   */
  static async updateTask(taskId: string, data: UpdateTaskDTO): Promise<TaskWithAssignments> {
    throw new Error('updateTask está deprecado');
  }

  /**
   * @deprecated No se usa en la nueva arquitectura
   */
  static async deleteTask(taskId: string): Promise<void> {
    throw new Error('deleteTask está deprecado');
  }

  /**
   * @deprecated Usar characters_tasks directamente. Esta función usa teachers_courses_tasks legacy
   */
  static async assignTaskToGroups(data: AssignTaskDTO): Promise<void> {
    throw new Error('assignTaskToGroups está deprecado. Los tasks se asignan por course, no por grupos individuales');
  }

  static async completeTask(data: CompleteTaskDTO): Promise<void> {
    try {
      const task = await prisma.tasks.findUnique({
        where: { id: data.taskId },
      });

      if (!task) {
        throw new Error('Tarea no encontrada');
      }

      const character = await prisma.characters.findUnique({
        where: { id: data.characterId },
        include: {
          course: true,
        },
      });

      if (!character) {
        throw new Error('Personaje no encontrado');
      }

      const existing = await prisma.characters_tasks.findUnique({
        where: {
          character_id_task_id: {
            character_id: data.characterId,
            task_id: data.taskId,
          },
        },
      });

      if (existing) {
        throw new Error('Esta tarea ya fue completada por este personaje');
      }

      await prisma.$transaction([
        prisma.characters_tasks.create({
          data: {
            character_id: data.characterId,
            task_id: data.taskId,
          },
        }),
        prisma.characters.update({
          where: { id: data.characterId },
          data: {
            experience: { increment: task.experience },
            gold: { increment: task.gold },
            energy: { increment: task.energy },
          },
        }),
      ]);

      // 🔔 Enviar notificación a Discord si el curso tiene webhook configurado
      if (character.course_id) {
        try {
          const teacherCourse = await prisma.teachers_courses.findFirst({
            where: {
              course_id: character.course_id,
              discord_webhook_url: { not: null },
            },
          });

          if (teacherCourse?.discord_webhook_url) {
            await notifyTaskCompleted(teacherCourse.discord_webhook_url, {
              characterName: character.name,
              taskName: task.name,
              taskDescription: task.description || '',
              rewards: {
                experience: task.experience,
                gold: task.gold,
              },
              courseName: character.course?.name || 'Curso desconocido',
            });
          }
        } catch (webhookError) {
          console.error('❌ Error al enviar notificación de tarea a Discord:', webhookError);
          // No lanzamos error para no interrumpir el flujo principal
        }
      }
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  }

  /**
   * @deprecated Usar characters_tasks para tracking de progreso
   */
  static async getTaskProgress(taskId: string): Promise<TaskProgress> {
    throw new Error('getTaskProgress está deprecado. Usar characters_tasks para calcular progreso');
  }

  /**
   * @deprecated Usar getTasksByGroupForCharacter en su lugar
   */
  static async getTasksByGroup(groupId: string): Promise<TaskWithAssignments[]> {
    try {
      const group = await prisma.groups.findUnique({
        where: { id: groupId },
        include: { characters: true },
      });

      if (!group) {
        throw new Error('Grupo no encontrado');
      }

      const tasks = await prisma.tasks.findMany();

      return tasks.map((task) => ({
        id: task.id,
        name: task.name,
        description: task.description,
        experience: task.experience,
        gold: task.gold,
        health: task.health,
        energy: task.energy,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        assignedGroups: [{ id: group.id, name: group.name, memberCount: group.characters.length }],
        completedCount: 0,
        totalAssigned: group.characters.length,
      }));
    } catch (error) {
      console.error('Error getting tasks by group:', error);
      throw error;
    }
  }

  /**
   * Obtener una tarea y si está completada por un character concreto
   */
  static async getTaskByIdForCharacter(taskId: string, characterId?: string): Promise<TaskWithAssignments & { completed?: boolean } > {
    const taskData = await this.getTaskById(taskId);
    if (!characterId) return taskData;

    const completed = await prisma.characters_tasks.findUnique({
      where: { character_id_task_id: { character_id: characterId, task_id: taskId } },
      select: { task_id: true },
    });

    return { ...taskData, completed: !!completed };
  }

  /**
   * Obtener tasks de un grupo con estado de completitud por character
   */
  static async getTasksByGroupForCharacter(
    groupId: string,
    characterId: string
  ): Promise<TaskWithAssignments[]> {
    try {
      const group = await prisma.groups.findUnique({
        where: { id: groupId },
        include: {
          characters: true,
        },
      });

      if (!group) {
        throw new Error('Grupo no encontrado');
      }

      // Obtener todas las tareas con su estado de completitud para este personaje
      const tasks = await prisma.tasks.findMany({
        include: {
          characters_tasks: {
            where: {
              character_id: characterId,
            },
          },
        },
      });

      return tasks.map((task) => ({
        id: task.id,
        name: task.name,
        description: task.description,
        experience: task.experience,
        gold: task.gold,
        health: task.health,
        energy: task.energy,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        assignedGroups: [{ id: group.id, name: group.name, memberCount: group.characters.length }],
        completedCount: task.characters_tasks.length,
        totalAssigned: group.characters.length,
        completed: task.characters_tasks.length > 0,
      }));
    } catch (error) {
      console.error('Error getting tasks by group for character:', error);
      throw error;
    }
  }
}
