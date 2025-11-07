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
          members: true,
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
        members: group.members.map((m) => ({
          id: m.id,
          name: m.name,
          experience: m.experience,
          gold: m.gold,
          energy: m.energy,
        })),
        memberCount: group.members.length,
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
          members: true,
        },
        orderBy: { created_at: 'desc' },
      });

      return groups.map((group) => ({
        id: group.id,
        name: group.name,
        courseId: group.course_id,
        createdAt: group.created_at,
        updatedAt: group.updated_at,
        members: group.members.map((m) => ({
          id: m.id,
          name: m.name,
          experience: m.experience,
          gold: m.gold,
          energy: m.energy,
        })),
        memberCount: group.members.length,
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

  static async assignMembers(data: AssignMembersDTO): Promise<void> {
    try {
      const group = await prisma.groups.findUnique({
        where: { id: data.groupId },
      });

      if (!group) {
        throw new Error('Grupo no encontrado');
      }

      await prisma.members.updateMany({
        where: {
          id: { in: data.memberIds },
        },
        data: {
          group_id: data.groupId,
        },
      });
    } catch (error) {
      console.error('Error assigning members:', error);
      throw error;
    }
  }

  static async removeMemberFromGroup(memberId: string): Promise<void> {
    try {
      await prisma.members.update({
        where: { id: memberId },
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
          members: true,
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

      const totalMembers = group.members.length;
      const averageExperience =
        totalMembers > 0
          ? group.members.reduce((sum, m) => sum + m.experience, 0) / totalMembers
          : 0;
      const averageGold =
        totalMembers > 0 ? group.members.reduce((sum, m) => sum + m.gold, 0) / totalMembers : 0;
      const averageEnergy =
        totalMembers > 0 ? group.members.reduce((sum, m) => sum + m.energy, 0) / totalMembers : 0;

      const totalQuizzes = group.quizzes.length;
      const completedQuizzes = group.quizzes.reduce(
        (sum, quiz) => sum + quiz.quizzes_history.length,
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
              members: true,
            },
          },
        },
      });

      if (!course) {
        throw new Error('Curso no encontrado');
      }

      const assignedMemberNames = course.groups.flatMap((g) => g.members.map((m) => m.name));

      const unassignedUsers = course.inscriptions
        .filter((i) => !assignedMemberNames.includes(i.user.name))
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
