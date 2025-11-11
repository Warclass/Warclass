import { prisma } from '@/backend/config/prisma';
import {
  CreateGroupDTO,
  UpdateGroupDTO,
  AssignMembersDTO,
  GroupWithMembers,
  GroupWithCourse,
  GroupStatistics,
} from '@/backend/types/group.types';

export class GroupService {
  static async createGroup(data: CreateGroupDTO): Promise<GroupWithCourse> {
    try {
      const course = await prisma.courses.findUnique({
        where: { id: data.courseId },
      });

      if (!course) {
        throw new Error('Curso no encontrado');
      }

      const group = await prisma.groups.create({
        data: {
          name: data.name,
          course_id: data.courseId,
        },
        include: {
          course: true,
        },
      });

      return {
        id: group.id,
        name: group.name,
        courseId: group.course_id,
        createdAt: group.created_at,
        updatedAt: group.updated_at,
        course: {
          id: group.course.id,
          name: group.course.name,
          description: group.course.description,
        },
      };
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  static async getGroupById(groupId: string): Promise<GroupWithMembers> {
    try {
      const group = await prisma.groups.findUnique({
        where: { id: groupId },
        include: {
          characters: {
            include: {
              class: true,
              user: true
            }
          },
        },
      });

      if (!group) {
        throw new Error('Grupo no encontrado');
      }

      return {
        id: group.id,
        name: group.name,
        courseId: group.course_id,
        createdAt: group.created_at,
        updatedAt: group.updated_at,
        members: group.characters.map((c) => ({
          id: c.id,
          name: c.name,
          experience: c.experience,
          gold: c.gold,
          energy: c.energy,
        })),
        memberCount: group.characters.length,
      };
    } catch (error) {
      console.error('Error getting group:', error);
      throw error;
    }
  }

  static async getGroupsByCourse(courseId: string): Promise<GroupWithMembers[]> {
    try {
      const groups = await prisma.groups.findMany({
        where: { course_id: courseId },
        include: {
          characters: {
            include: {
              class: true,
              user: true
            }
          },
        },
        orderBy: { created_at: 'desc' },
      });

      return groups.map((group) => ({
        id: group.id,
        name: group.name,
        courseId: group.course_id,
        createdAt: group.created_at,
        updatedAt: group.updated_at,
        members: group.characters.map((c) => ({
          id: c.id,
          name: c.name,
          experience: c.experience,
          gold: c.gold,
          energy: c.energy,
        })),
        memberCount: group.characters.length,
      }));
    } catch (error) {
      console.error('Error getting groups by course:', error);
      throw error;
    }
  }

  static async updateGroup(groupId: string, data: UpdateGroupDTO): Promise<GroupWithCourse> {
    try {
      const group = await prisma.groups.update({
        where: { id: groupId },
        data: {
          name: data.name,
        },
        include: {
          course: true,
        },
      });

      return {
        id: group.id,
        name: group.name,
        courseId: group.course_id,
        createdAt: group.created_at,
        updatedAt: group.updated_at,
        course: {
          id: group.course.id,
          name: group.course.name,
          description: group.course.description,
        },
      };
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  static async deleteGroup(groupId: string): Promise<void> {
    try {
      await prisma.groups.delete({
        where: { id: groupId },
      });
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  }

  /**
   * Asignar personajes a un grupo
   * Actualiza el group_id de cada personaje
   */
  static async assignCharacters(data: { groupId: string; characterIds: string[] }): Promise<{ count: number }> {
    try {
      const group = await prisma.groups.findUnique({
        where: { id: data.groupId },
      });

      if (!group) {
        throw new Error('Grupo no encontrado');
      }

      // Actualizar el group_id de cada personaje
      const result = await prisma.characters.updateMany({
        where: {
          id: { in: data.characterIds },
        },
        data: {
          group_id: data.groupId,
        },
      });

      return { count: result.count };
    } catch (error) {
      console.error('Error assigning characters:', error);
      throw error;
    }
  }

  /**
   * @deprecated Usar assignCharacters en su lugar
   */
  static async assignMembers(data: AssignMembersDTO): Promise<void> {
    try {
      const group = await prisma.groups.findUnique({
        where: { id: data.groupId },
      });

      if (!group) {
        throw new Error('Grupo no encontrado');
      }

      // Usar characters en lugar de members (deprecated)
      throw new Error('Esta función está deprecada. Usar assignCharacters en su lugar');
    } catch (error) {
      console.error('Error assigning members:', error);
      throw error;
    }
  }

  /**
   * @deprecated Usar removeCharacterFromGroup o actualizar character.group_id directamente
   */
  static async removeMemberFromGroup(memberId: string): Promise<void> {
    try {
      // Esta función está deprecada porque members ya no existe
      throw new Error('Esta función está deprecada. Actualizar character.group_id directamente');
    } catch (error) {
      console.error('Error removing member from group:', error);
      throw error;
    }
  }

  /**
   * Remover un personaje de un grupo
   */
  static async removeCharacterFromGroup(characterId: string): Promise<void> {
    try {
      await prisma.characters.update({
        where: { id: characterId },
        data: {
          group_id: null as any,
        },
      });
    } catch (error) {
      console.error('Error removing member from group:', error);
      throw error;
    }
  }

  static async getGroupStatistics(groupId: string): Promise<GroupStatistics> {
    try {
      const group = await prisma.groups.findUnique({
        where: { id: groupId },
        include: {
          characters: true,
          quizzes: {
            include: {
              quizzes_history: true,
            },
          },
        },
      });

      if (!group) {
        throw new Error('Grupo no encontrado');
      }

      const totalMembers = group.characters.length;
      const averageExperience =
        totalMembers > 0
          ? group.characters.reduce((sum: number, c) => sum + c.experience, 0) / totalMembers
          : 0;
      const averageGold =
        totalMembers > 0 ? group.characters.reduce((sum: number, c) => sum + c.gold, 0) / totalMembers : 0;
      const averageEnergy =
        totalMembers > 0 ? group.characters.reduce((sum: number, c) => sum + c.energy, 0) / totalMembers : 0;

      const totalQuizzes = group.quizzes.length;
      const completedQuizzes = group.quizzes.reduce(
        (sum: number, quiz) => sum + quiz.quizzes_history.length,
        0
      );

      return {
        totalMembers,
        averageExperience,
        averageGold,
        averageEnergy,
        totalQuizzes,
        completedQuizzes,
      };
    } catch (error) {
      console.error('Error getting group statistics:', error);
      throw error;
    }
  }

  /**
   * Obtener usuarios no asignados a ningún grupo en un curso
   */
  static async getUnassignedMembersByCourse(courseId: string) {
    try {
      const course = await prisma.courses.findUnique({
        where: { id: courseId },
        include: {
          inscriptions: {
            include: {
              user: true,
            },
          },
          groups: {
            include: {
              characters: {
                include: {
                  user: true
                }
              },
            },
          },
        },
      });

      if (!course) {
        throw new Error('Curso no encontrado');
      }

      // Obtener IDs de usuarios que ya tienen personajes en algún grupo
      const assignedUserIds = new Set(
        course.groups.flatMap((g) => g.characters.map((c) => c.user_id))
      );

      // Filtrar usuarios inscritos que no tienen personajes
      const unassignedUsers = course.inscriptions
        .filter((i) => !assignedUserIds.has(i.user_id))
        .map((i) => ({
          userId: i.user.id,
          userName: i.user.name,
          userEmail: i.user.email,
        }));

      return unassignedUsers;
    } catch (error) {
      console.error('Error getting unassigned members:', error);
      throw error;
    }
  }
}
