import { prisma } from '@/backend/config/prisma';

export class TeacherService {
  /**
   * Verificar si un usuario es teacher
   */
  static async isTeacher(userId: string): Promise<boolean> {
    try {
      // Primero verificar si existe inscripción del usuario a algún curso
      // que le da acceso como teacher (inscriptions indica que el user puede ver ese curso)
      const teacherRecord = await prisma.teachers.findFirst({
        where: {
          internal_id: userId, // Asumiendo que internal_id puede ser el userId
        },
      });

      return !!teacherRecord;
    } catch (error) {
      console.error('Error checking if user is teacher:', error);
      return false;
    }
  }

  /**
   * Obtener datos del teacher por userId
   */
  static async getTeacherByUserId(userId: string) {
    try {
      const teacher = await prisma.teachers.findFirst({
        where: {
          internal_id: userId,
        },
        include: {
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
          teachers_courses: {
            include: {
              course: {
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
          },
        },
      });

      if (!teacher) {
        return null;
      }

      // Combinar courses propios y courses donde es co-teacher
      const allCourses = [
        ...teacher.courses,
        ...teacher.teachers_courses.map((tc) => tc.course),
      ];

      // Calcular estadísticas
      const totalStudents = allCourses.reduce((sum, course) => {
        return sum + course.inscriptions.length;
      }, 0);

      return {
        id: teacher.id,
        name: teacher.name,
        internalId: teacher.internal_id,
        schoolId: teacher.school_id,
        totalCourses: allCourses.length,
        totalStudents,
        courses: allCourses.map((course) => ({
          id: course.id,
          name: course.name,
          description: course.description,
          studentsCount: course.inscriptions.length,
          groupsCount: course.groups.length,
          membersCount: course.groups.reduce(
            (sum, group) => sum + group.members.length,
            0
          ),
        })),
      };
    } catch (error) {
      console.error('Error getting teacher by user ID:', error);
      throw error;
    }
  }

  /**
   * Obtener cursos donde el teacher es el creador principal
   */
  static async getTeacherCourses(teacherId: string) {
    try {
      const courses = await prisma.courses.findMany({
        where: {
          teacher_id: teacherId,
        },
        include: {
          groups: {
            include: {
              members: true,
            },
          },
          inscriptions: true,
          teacher: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      return courses.map((course) => ({
        id: course.id,
        name: course.name,
        description: course.description,
        teacherName: course.teacher.name,
        studentsCount: course.inscriptions.length,
        groupsCount: course.groups.length,
        membersCount: course.groups.reduce(
          (sum, group) => sum + group.members.length,
          0
        ),
        createdAt: course.created_at,
      }));
    } catch (error) {
      console.error('Error getting teacher courses:', error);
      throw error;
    }
  }

  /**
   * Crear un nuevo curso
   */
  static async createCourse(
    teacherId: string,
    data: {
      name: string;
      description?: string;
    }
  ) {
    try {
      const course = await prisma.courses.create({
        data: {
          name: data.name,
          description: data.description,
          teacher_id: teacherId,
        },
        include: {
          teacher: true,
        },
      });

      return {
        id: course.id,
        name: course.name,
        description: course.description,
        teacherName: course.teacher.name,
        studentsCount: 0,
        groupsCount: 0,
        membersCount: 0,
        createdAt: course.created_at,
      };
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }
}
