import { prisma } from '@/backend/config/prisma';

export interface DashboardCourse {
  id: string;
  name: string;
  description: string | null;
  code?: string;
  color: string;
  students: number;
  quests: number;
  level: number;
}

export interface DashboardEnrolledCourse {
  id: string;
  name: string;
  instructor: string;
  progress: number;
  color: string;
  nextQuest?: string;
  level: number;
}

export interface DashboardActivity {
  id: string;
  type: string;
  course: string;
  description: string;
  time: string;
  avatar?: string;
}

export interface DashboardStats {
  enrolledCourses: number;
  teachingCourses: number;
  totalStudents: number;
  averageLevel: number;
}

export class DashboardService {
  /**
   * Get courses where user is enrolled as a student
   */
  static async getEnrolledCourses(userId: string): Promise<DashboardEnrolledCourse[]> {
    try {
      const inscriptions = await prisma.inscriptions.findMany({
        where: { user_id: userId },
        include: {
          course: {
            include: {
              // Cursos ahora se relacionan con profesores a través de teachers_courses
              teachers_courses: {
                include: {
                  teacher: {
                    include: { user: true },
                  },
                },
              },
              // Los grupos contienen personajes (characters), no miembros legacy
              groups: {
                include: {
                  characters: true,
                },
              },
            },
          },
        },
      });

      const enrolledCourses: DashboardEnrolledCourse[] = inscriptions.map((inscription) => {
        const course = inscription.course;

        // Calcular progreso basado en cantidad de personajes creados en el curso (proxy simple)
        const totalCharacters = course.groups.reduce((sum, group) => sum + group.characters.length, 0);
        const progress = totalCharacters > 0 ? Math.min(Math.round((totalCharacters / 50) * 100), 100) : 0;

        // Obtener nivel promedio de los personajes (aprox: exp/100)
        const characters = course.groups.flatMap((g) => g.characters);
        const avgLevel = characters.length > 0
          ? Math.max(1, Math.round(characters.reduce((sum, char) => sum + (char.experience || 0), 0) / characters.length / 100))
          : 1;

        // Nombre del profesor desde teachers_courses (primero asignado)
        const instructor = course.teachers_courses[0]?.teacher?.user?.name || 'Profesor asignado';

        // Color basado en el nombre del curso
        const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
        const color = colors[Math.abs(course.name.charCodeAt(0) % colors.length)];

        return {
          id: course.id,
          name: course.name,
          instructor,
          progress,
          color,
          level: avgLevel,
        };
      });

      return enrolledCourses;
    } catch (error) {
      console.error('Error getting enrolled courses:', error);
      return [];
    }
  }

  /**
   * Get courses where user is teaching (through teachers_courses relationship)
   */
  static async getTeachingCourses(userId: string): Promise<DashboardCourse[]> {
    try {
      // 1) Obtener el registro de teacher para el usuario
      const teacher = await prisma.teachers.findUnique({
        where: { user_id: userId },
        select: { id: true },
      });

      if (!teacher) {
        return [];
      }

      // 2) Obtener los cursos asociados vía teachers_courses
      const teacherCourseLinks = await prisma.teachers_courses.findMany({
        where: { teacher_id: teacher.id },
        include: {
          course: {
            include: {
              groups: { include: { characters: true } },
              inscriptions: true,
            },
          },
        },
      });

      const teachingCourses: DashboardCourse[] = teacherCourseLinks.map((link) => {
        const course = link.course;
        const totalStudents = course.inscriptions.length; // estudiantes inscritos

        // Contar "quests" como número de grupos (placeholder hasta tener misiones reales)
        const quests = course.groups.length * 3;

        // Calcular nivel del curso basado en experiencia promedio de personajes
        const allCharacters = course.groups.flatMap((g) => g.characters);
        const avgExp = allCharacters.length > 0
          ? allCharacters.reduce((sum, c) => sum + (c.experience || 0), 0) / allCharacters.length
          : 0;
        const level = Math.max(1, Math.round(avgExp / 500));

        const code = course.name
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase())
          .join('')
          .substring(0, 3) + '-' + Math.floor(Math.random() * 900 + 100);

        const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-teal-500'];
        const color = colors[Math.abs(course.name.charCodeAt(0) % colors.length)];

        return {
          id: course.id,
          name: course.name,
          description: course.description,
          code,
          color,
          students: totalStudents,
          quests,
          level,
        };
      });

      return teachingCourses;
    } catch (error) {
      console.error('Error getting teaching courses:', error);
      return [];
    }
  }

  /**
   * Get recent activity for the dashboard
   */
  static async getRecentActivity(userId: string): Promise<DashboardActivity[]> {
    try {
      // Actividad reciente simple basada en inscripciones a cursos del usuario
      const userCourses = await prisma.inscriptions.findMany({
        where: { user_id: userId },
        include: { course: true },
        take: 5,
        orderBy: { created_at: 'desc' },
      });

      const activities: DashboardActivity[] = userCourses.map((inscription) => {
        const course = inscription.course;
        return {
          id: inscription.id,
          type: 'enrollment',
          course: course.name,
          description: `Te uniste al curso ${course.name}`,
          time: 'Reciente',
          avatar: undefined,
        };
      });

      return activities;
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(userId: string): Promise<DashboardStats> {
    try {
      const [enrolledCourses, teachingCourses] = await Promise.all([
        this.getEnrolledCourses(userId),
        this.getTeachingCourses(userId),
      ]);

      const totalStudents = teachingCourses.reduce((sum, course) => sum + course.students, 0);
      
      const avgLevel = enrolledCourses.length > 0
        ? Math.round(enrolledCourses.reduce((sum, course) => sum + course.level, 0) / enrolledCourses.length)
        : 0;

      return {
        enrolledCourses: enrolledCourses.length,
        teachingCourses: teachingCourses.length,
        totalStudents,
        averageLevel: avgLevel,
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        enrolledCourses: 0,
        teachingCourses: 0,
        totalStudents: 0,
        averageLevel: 0,
      };
    }
  }

  /**
   * Get complete dashboard data
   */
  static async getDashboardData(userId: string) {
    try {
      const [enrolledCourses, teachingCourses, recentActivity, stats] = await Promise.all([
        this.getEnrolledCourses(userId),
        this.getTeachingCourses(userId),
        this.getRecentActivity(userId),
        this.getDashboardStats(userId),
      ]);

      return {
        success: true,
        data: {
          enrolledCourses,
          teachingCourses,
          recentActivity,
          stats,
        },
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      return {
        success: false,
        message: 'Error al obtener datos del dashboard',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      };
    }
  }
}
