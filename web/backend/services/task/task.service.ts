import { prisma } from '@/backend/config/prisma';
import {
  CreateTaskDTO,
  UpdateTaskDTO,
  AssignTaskDTO,
  CompleteTaskDTO,
  TaskWithAssignments,
  TaskProgress,
} from '@/backend/types/task.types';

export class TaskService {
  static async createTask(data: CreateTaskDTO): Promise<TaskWithAssignments> {
    try {
      const task = await prisma.events.create({
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

  static async getTaskById(taskId: string): Promise<TaskWithAssignments> {
    try {
      const task = await prisma.events.findUnique({
        where: { id: taskId },
        include: {
          teachers_courses_events: {
            include: {
              member: {
                include: {
                  group: true,
                },
              },
            },
          },
        },
      });

      if (!task) {
        throw new Error('Tarea no encontrada');
      }

      const groupMap = new Map();
      task.teachers_courses_events.forEach((tce) => {
        const group = tce.member.group;
        if (!groupMap.has(group.id)) {
          groupMap.set(group.id, {
            id: group.id,
            name: group.name,
            memberCount: 0,
          });
        }
        groupMap.get(group.id).memberCount++;
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
        assignedGroups: Array.from(groupMap.values()),
        completedCount: task.teachers_courses_events.length,
        totalAssigned: task.teachers_courses_events.length,
      };
    } catch (error) {
      console.error('Error getting task:', error);
      throw error;
    }
  }

  static async getAllTasks(): Promise<TaskWithAssignments[]> {
    try {
      const tasks = await prisma.events.findMany({
        include: {
          teachers_courses_events: {
            include: {
              member: {
                include: {
                  group: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });

      return tasks.map((task) => {
        const groupMap = new Map();
        task.teachers_courses_events.forEach((tce) => {
          const group = tce.member.group;
          if (!groupMap.has(group.id)) {
            groupMap.set(group.id, {
              id: group.id,
              name: group.name,
              memberCount: 0,
            });
          }
          groupMap.get(group.id).memberCount++;
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
          assignedGroups: Array.from(groupMap.values()),
          completedCount: task.teachers_courses_events.length,
          totalAssigned: task.teachers_courses_events.length,
        };
      });
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw error;
    }
  }

  static async updateTask(taskId: string, data: UpdateTaskDTO): Promise<TaskWithAssignments> {
    try {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.experience !== undefined) updateData.experience = data.experience;
      if (data.gold !== undefined) updateData.gold = data.gold;
      if (data.health !== undefined) updateData.health = data.health;
      if (data.energy !== undefined) updateData.energy = data.energy;

      const task = await prisma.events.update({
        where: { id: taskId },
        data: updateData,
      });

      return this.getTaskById(task.id);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  static async deleteTask(taskId: string): Promise<void> {
    try {
      await prisma.events.delete({
        where: { id: taskId },
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  static async assignTaskToGroups(data: AssignTaskDTO): Promise<void> {
    try {
      const task = await prisma.events.findUnique({
        where: { id: data.taskId },
      });

      if (!task) {
        throw new Error('Tarea no encontrada');
      }

      for (const groupId of data.groupIds) {
        const group = await prisma.groups.findUnique({
          where: { id: groupId },
          include: { members: true },
        });

        if (!group) {
          throw new Error(`Grupo ${groupId} no encontrado`);
        }

        for (const member of group.members) {
          const existing = await prisma.teachers_courses_events.findUnique({
            where: {
              teacher_course_id_event_id: {
                teacher_course_id: member.id,
                event_id: data.taskId,
              },
            },
          });

          if (!existing) {
            await prisma.teachers_courses_events.create({
              data: {
                teacher_course_id: member.id,
                event_id: data.taskId,
              },
            });
          }
        }
      }
    } catch (error) {
      console.error('Error assigning task to groups:', error);
      throw error;
    }
  }

  static async completeTask(data: CompleteTaskDTO): Promise<void> {
    try {
      const task = await prisma.events.findUnique({
        where: { id: data.taskId },
      });

      if (!task) {
        throw new Error('Tarea no encontrada');
      }

      const member = await prisma.members.findUnique({
        where: { id: data.memberId },
      });

      if (!member) {
        throw new Error('Miembro no encontrado');
      }

      const existing = await prisma.teachers_courses_events.findUnique({
        where: {
          teacher_course_id_event_id: {
            teacher_course_id: data.memberId,
            event_id: data.taskId,
          },
        },
      });

      if (existing) {
        throw new Error('Esta tarea ya fue completada por este miembro');
      }

      await prisma.$transaction([
        prisma.teachers_courses_events.create({
          data: {
            teacher_course_id: data.memberId,
            event_id: data.taskId,
          },
        }),
        prisma.members.update({
          where: { id: data.memberId },
          data: {
            experience: { increment: task.experience },
            gold: { increment: task.gold },
            energy: { increment: task.energy },
          },
        }),
      ]);
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  }

  static async getTaskProgress(taskId: string): Promise<TaskProgress> {
    try {
      const task = await prisma.events.findUnique({
        where: { id: taskId },
        include: {
          teachers_courses_events: {
            include: {
              member: true,
            },
          },
        },
      });

      if (!task) {
        throw new Error('Tarea no encontrada');
      }

      const completedMembers = task.teachers_courses_events.length;
      const totalMembers = await prisma.members.count();

      return {
        taskId: task.id,
        taskName: task.name,
        totalMembers,
        completedMembers,
        progress: totalMembers > 0 ? (completedMembers / totalMembers) * 100 : 0,
      };
    } catch (error) {
      console.error('Error getting task progress:', error);
      throw error;
    }
  }

  static async getTasksByGroup(groupId: string): Promise<TaskWithAssignments[]> {
    try {
      const group = await prisma.groups.findUnique({
        where: { id: groupId },
        include: {
          members: {
            include: {
              teachers_courses_events: {
                include: {
                  event: true,
                },
              },
            },
          },
        },
      });

      if (!group) {
        throw new Error('Grupo no encontrado');
      }

      const taskMap = new Map();
      
      group.members.forEach((member) => {
        member.teachers_courses_events.forEach((tce) => {
          const task = tce.event;
          if (!taskMap.has(task.id)) {
            taskMap.set(task.id, {
              id: task.id,
              name: task.name,
              description: task.description,
              experience: task.experience,
              gold: task.gold,
              health: task.health,
              energy: task.energy,
              createdAt: task.created_at,
              updatedAt: task.updated_at,
              assignedGroups: [{ id: group.id, name: group.name, memberCount: 0 }],
              completedCount: 0,
              totalAssigned: group.members.length,
            });
          }
          taskMap.get(task.id).completedCount++;
        });
      });

      return Array.from(taskMap.values());
    } catch (error) {
      console.error('Error getting tasks by group:', error);
      throw error;
    }
  }
}
