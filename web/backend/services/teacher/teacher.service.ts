import { prisma } from '@/backend/config/prisma';
import type {
  Teacher,
  CreateTeacherDTO,
  UpdateTeacherDTO,
  TeacherResponse,
  TeachersListResponse,
} from '@/backend/types/teacher.types';

/**
 * Teacher Service
 * Gestión de profesores (conversión de users a teachers)
 */
export class TeacherService {
  /**
   * Verificar si un usuario es teacher
   */
  static async isTeacher(userId: string): Promise<boolean> {
    try {
      const teacherRecord = await prisma.teachers.findUnique({
        where: {
          user_id: userId,
        },
      });

      return !!teacherRecord;
    } catch (error) {
      console.error('Error checking if user is teacher:', error);
      return false;
    }
  }

  /**
   * Convertir un user en teacher
   */
  static async createTeacher(data: CreateTeacherDTO): Promise<TeacherResponse> {
    try {
      // Verificar que el user existe
      const user = await prisma.users.findUnique({
        where: { id: data.userId },
      });

      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado',
        };
      }

      // Verificar que el user no es ya un teacher
      const existingTeacher = await prisma.teachers.findUnique({
        where: { user_id: data.userId },
      });

      if (existingTeacher) {
        return {
          success: false,
          message: 'El usuario ya es un profesor',
        };
      }

      // Si se proporciona institutionId, verificar que existe
      if (data.institutionId) {
        const institution = await prisma.institutions.findUnique({
          where: { id: data.institutionId },
        });

        if (!institution) {
          return {
            success: false,
            message: 'Institución no encontrada',
          };
        }
      }

      // Crear teacher
      const teacher = await prisma.teachers.create({
        data: {
          user_id: data.userId,
          internal_id: data.internalId || null,
          institution_id: data.institutionId || null,
        },
        include: {
          user: true,
          institution: true,
        },
      });

      const teacherResponse: Teacher = {
        id: teacher.id,
        userId: teacher.user_id,
        userName: teacher.user.name,
        userEmail: teacher.user.email,
        internalId: teacher.internal_id,
        institutionId: teacher.institution_id,
        institutionName: teacher.institution?.name || null,
        createdAt: teacher.created_at,
        updatedAt: teacher.updated_at,
      };

      return {
        success: true,
        teacher: teacherResponse,
        message: 'Profesor creado exitosamente',
      };
    } catch (error) {
      console.error('Error creating teacher:', error);
      return {
        success: false,
        message: 'Error al crear el profesor',
      };
    }
  }

  /**
   * Obtener todos los teachers
   */
  static async getAllTeachers(): Promise<TeachersListResponse> {
    try {
      const teachers = await prisma.teachers.findMany({
        include: {
          user: true,
          institution: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      const teachersList: Teacher[] = teachers.map((teacher: any) => ({
        id: teacher.id,
        userId: teacher.user_id,
        userName: teacher.user.name,
        userEmail: teacher.user.email,
        internalId: teacher.internal_id,
        institutionId: teacher.institution_id,
        institutionName: teacher.institution?.name || null,
        createdAt: teacher.created_at,
        updatedAt: teacher.updated_at,
      }));

      return {
        success: true,
        teachers: teachersList,
        total: teachersList.length,
      };
    } catch (error) {
      console.error('Error getting teachers:', error);
      return {
        success: true,
        teachers: [],
        total: 0,
      };
    }
  }

  /**
   * Obtener un teacher por ID
   */
  static async getTeacherById(teacherId: string): Promise<TeacherResponse> {
    try {
      const teacher = await prisma.teachers.findUnique({
        where: { id: teacherId },
        include: {
          user: true,
          institution: true,
          courses: {
            include: {
              groups: true,
            },
          },
        },
      });

      if (!teacher) {
        return {
          success: false,
          message: 'Profesor no encontrado',
        };
      }

      const teacherResponse: Teacher = {
        id: teacher.id,
        userId: teacher.user_id,
        userName: teacher.user.name,
        userEmail: teacher.user.email,
        internalId: teacher.internal_id,
        institutionId: teacher.institution_id,
        institutionName: teacher.institution?.name || null,
        createdAt: teacher.created_at,
        updatedAt: teacher.updated_at,
      };

      return {
        success: true,
        teacher: teacherResponse,
      };
    } catch (error) {
      console.error('Error getting teacher:', error);
      return {
        success: false,
        message: 'Error al obtener el profesor',
      };
    }
  }

  /**
   * Obtener teacher por userId
   */
  static async getTeacherByUserId(userId: string): Promise<TeacherResponse> {
    try {
      const teacher = await prisma.teachers.findUnique({
        where: { user_id: userId },
        include: {
          user: true,
          institution: true,
          courses: {
            include: {
              groups: {
                include: {
                  members: true,
                },
              },
              inscriptions: true,
            },
          },
        },
      });

      if (!teacher) {
        return {
          success: false,
          message: 'Profesor no encontrado',
        };
      }

      const teacherResponse: Teacher = {
        id: teacher.id,
        userId: teacher.user_id,
        userName: teacher.user.name,
        userEmail: teacher.user.email,
        internalId: teacher.internal_id,
        institutionId: teacher.institution_id,
        institutionName: teacher.institution?.name || null,
        createdAt: teacher.created_at,
        updatedAt: teacher.updated_at,
      };

      return {
        success: true,
        teacher: teacherResponse,
      };
    } catch (error) {
      console.error('Error getting teacher by user ID:', error);
      return {
        success: false,
        message: 'Error al obtener el profesor',
      };
    }
  }

  /**
   * Actualizar internal_id o institution_id de un teacher
   */
  static async updateTeacher(
    teacherId: string,
    data: UpdateTeacherDTO
  ): Promise<TeacherResponse> {
    try {
      // Verificar que el teacher existe
      const existingTeacher = await prisma.teachers.findUnique({
        where: { id: teacherId },
      });

      if (!existingTeacher) {
        return {
          success: false,
          message: 'Profesor no encontrado',
        };
      }

      // Si se proporciona institutionId, verificar que existe
      if (data.institutionId) {
        const institution = await prisma.institutions.findUnique({
          where: { id: data.institutionId },
        });

        if (!institution) {
          return {
            success: false,
            message: 'Institución no encontrada',
          };
        }
      }

      // Actualizar teacher
      const teacher = await prisma.teachers.update({
        where: { id: teacherId },
        data: {
          internal_id: data.internalId !== undefined ? data.internalId : undefined,
          institution_id: data.institutionId !== undefined ? data.institutionId : undefined,
        },
        include: {
          user: true,
          institution: true,
        },
      });

      const teacherResponse: Teacher = {
        id: teacher.id,
        userId: teacher.user_id,
        userName: teacher.user.name,
        userEmail: teacher.user.email,
        internalId: teacher.internal_id,
        institutionId: teacher.institution_id,
        institutionName: teacher.institution?.name || null,
        createdAt: teacher.created_at,
        updatedAt: teacher.updated_at,
      };

      return {
        success: true,
        teacher: teacherResponse,
        message: 'Profesor actualizado exitosamente',
      };
    } catch (error) {
      console.error('Error updating teacher:', error);
      return {
        success: false,
        message: 'Error al actualizar el profesor',
      };
    }
  }

  /**
   * Remover rol de teacher de un usuario
   * NOTA: Esto eliminará el teacher pero NO el user
   */
  static async deleteTeacher(teacherId: string): Promise<TeacherResponse> {
    try {
      // Verificar que el teacher existe
      const teacher = await prisma.teachers.findUnique({
        where: { id: teacherId },
        include: {
          courses: true,
        },
      });

      if (!teacher) {
        return {
          success: false,
          message: 'Profesor no encontrado',
        };
      }

      // Verificar si tiene cursos asignados
      if (teacher.courses.length > 0) {
        return {
          success: false,
          message: `No se puede eliminar el profesor porque tiene ${teacher.courses.length} curso(s) asignado(s)`,
        };
      }

      // Eliminar teacher (el user se mantiene)
      await prisma.teachers.delete({
        where: { id: teacherId },
      });

      return {
        success: true,
        message: 'Rol de profesor removido exitosamente',
      };
    } catch (error) {
      console.error('Error deleting teacher:', error);
      return {
        success: false,
        message: 'Error al eliminar el profesor',
      };
    }
  }
}
