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
              teacher: {
                include: {
                  user: true,
                },
              },
              groups: {
                include: {
                  members: {
                    include: {
                      characters: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const enrolledCourses: DashboardEnrolledCourse[] = inscriptions.map((inscription) => {
        const course = inscription.course;
        
        // Calcular progreso basado en miembros del grupo
        const totalMembers = course.groups.reduce((sum, group) => sum + group.members.length, 0);
        const progress = totalMembers > 0 ? Math.min(Math.round((totalMembers / 50) * 100), 100) : 0;

        // Obtener nivel promedio de los personajes
        const characters = course.groups.flatMap((g) => g.members.map((m) => m.characters)).filter(Boolean);
        const avgLevel = characters.length > 0
          ? Math.round(characters.reduce((sum, char) => sum + (char?.experience || 0), 0) / characters.length / 100)
          : 1;

        // Color basado en el nombre del curso
        const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
        const color = colors[Math.abs(course.name.charCodeAt(0) % colors.length)];

        return {
          id: course.id,
          name: course.name,
          instructor: course.teacher.user.name, // FIXED: Acceder a través de user
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
      // Primero, encontrar los cursos donde el usuario es docente
      // Asumiendo que el usuario tiene inscripciones a cursos que enseña
      const teacherCourses = await prisma.courses.findMany({
        include: {
          teacher: true,
          groups: {
            include: {
              members: true,
            },
          },
          inscriptions: true,
        },
      });

      // Filtrar cursos donde el usuario está inscrito y es profesor
      // Por ahora, usaremos una lógica simple: buscar por inscriptions
      const userInscriptions = await prisma.inscriptions.findMany({
        where: { user_id: userId },
        select: { course_id: true },
      });

      const userCourseIds = userInscriptions.map((i) => i.course_id);

      const filteredCourses = teacherCourses.filter((course) => 
        userCourseIds.includes(course.id) && 
        course.groups.some((g) => g.members.length > 0)
      );

      const teachingCourses: DashboardCourse[] = filteredCourses.map((course) => {
        const totalStudents = course.groups.reduce((sum, group) => sum + group.members.length, 0);
        
        // Contar "quests" como número de grupos
        const quests = course.groups.length * 3; // Simulación: 3 quests por grupo

        // Calcular nivel del curso basado en estudiantes
        const allMembers = course.groups.flatMap((g) => g.members);
        const avgExp = allMembers.length > 0
          ? allMembers.reduce((sum, m) => sum + m.experience, 0) / allMembers.length
          : 100;
        const level = Math.max(1, Math.round(avgExp / 500));

        // Generar código del curso
        const code = course.name
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase())
          .join('')
          .substring(0, 3) + '-' + Math.floor(Math.random() * 900 + 100);

        // Color basado en el nombre
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
      // Obtener los cursos del usuario
      const userCourses = await prisma.inscriptions.findMany({
        where: { user_id: userId },
        include: {
          course: {
            include: {
              groups: {
                include: {
                  members: true,
                },
              },
            },
          },
        },
        take: 5,
        orderBy: { created_at: 'desc' },
      });

      const activities: DashboardActivity[] = userCourses.map((inscription, index) => {
        const course = inscription.course;
        const randomMember = course.groups[0]?.members[0];

        const activityTypes = [
          {
            type: 'quest_completed',
            description: `${randomMember?.name || 'Un estudiante'} completó una misión`,
          },
          {
            type: 'new_submission',
            description: `${course.groups[0]?.members.length || 0} nuevas entregas`,
          },
          {
            type: 'level_up',
            description: '¡Subiste de nivel!',
          },
        ];

        const activity = activityTypes[index % activityTypes.length];
        const hoursAgo = index + 1;

        return {
          id: inscription.id,
          type: activity.type,
          course: course.name,
          description: activity.description,
          time: `Hace ${hoursAgo} hora${hoursAgo > 1 ? 's' : ''}`,
          avatar: '/img/user0' + ((index % 6) + 1) + '.jpg',
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
