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
   * Un teacher debe existir en la tabla teachers Y tener al menos un curso en teachers_courses
   */
  static async isTeacher(userId: string): Promise<boolean> {
    try {
      const teacherRecord = await prisma.teachers.findUnique({
        where: {
          user_id: userId,
        },
        include: {
          teachers_courses: true
        }
      });

      // Es teacher si existe el registro Y tiene al menos un curso asignado
      return !!teacherRecord && teacherRecord.teachers_courses.length > 0;
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
          teachers_courses: {
            include: {
              course: {
                include: {
                  groups: true,
                },
              },
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
          teachers_courses: {
            include: {
              course: {
                include: {
                  groups: {
                    include: {
                      characters: true,
                    },
                  },
                  inscriptions: true,
                },
              },
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
          teachers_courses: true,
        },
      });

      if (!teacher) {
        return {
          success: false,
          message: 'Profesor no encontrado',
        };
      }

      // Verificar si tiene cursos asignados en teachers_courses
      if (teacher.teachers_courses.length > 0) {
        return {
          success: false,
          message: `No se puede eliminar el profesor porque tiene ${teacher.teachers_courses.length} curso(s) asignado(s)`,
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

  /**
   * Obtener cursos donde el teacher está asignado via teachers_courses
   */
  static async getTeacherCourses(teacherId: string) {
    try {
      const teacherCourses = await prisma.teachers_courses.findMany({
        where: {
          teacher_id: teacherId,
        },
        include: {
          course: {
            include: {
              groups: {
                include: {
                  characters: true,
                },
              },
              inscriptions: true,
              teachers_courses: {
                include: {
                  teacher: {
                    include: {
                      institution: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      return teacherCourses.map((tc: any) => ({
        id: tc.course.id,
        name: tc.course.name,
        description: tc.course.description,
        studentsCount: tc.course.inscriptions.length,
        groupsCount: tc.course.groups.length,
        membersCount: tc.course.groups.reduce(
          (sum: number, group: any) => sum + group.characters.length,
          0
        ),
        // Obtener info del teacher principal (primero en teachers_courses)
        institutionId: tc.course.teachers_courses[0]?.teacher?.institution_id || null,
        institutionName: tc.course.teachers_courses[0]?.teacher?.institution?.name || null,
      }));
    } catch (error) {
      console.error('Error getting teacher courses:', error);
      throw error;
    }
  }

  /**
   * Crear un curso y asociarlo automáticamente al teacher via teachers_courses
   */
  static async createCourse(
    teacherId: string,
    data: { name: string; description?: string | null }
  ): Promise<{
    id: string;
    name: string;
    description: string | null;
    teacherId: string;
    institutionId: string | null;
    institutionName: string | null;
  }> {
    try {
      // Verificar que el teacher existe
      const teacher = await prisma.teachers.findUnique({
        where: { id: teacherId },
        include: { institution: true },
      });

      if (!teacher) {
        throw new Error('Profesor no encontrado');
      }

      if (!data.name || !data.name.trim()) {
        throw new Error('El nombre del curso es requerido');
      }

      // Crear el curso (SIN teacher_id porque ese campo ya no existe)
      const course = await prisma.courses.create({
        data: {
          name: data.name.trim(),
          description: data.description?.trim() || null,
        },
      });

      // Crear automáticamente la relación en teachers_courses
      await prisma.teachers_courses.create({
        data: {
          teacher_id: teacherId,
          course_id: course.id,
        },
      });

      return {
        id: course.id,
        name: course.name,
        description: course.description,
        teacherId: teacher.id,
        institutionId: teacher.institution_id,
        institutionName: teacher.institution?.name || null,
      };
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }
}
