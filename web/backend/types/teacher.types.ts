export interface Teacher {
  id: string;
  name: string;
  internalId: string;
  schoolId: string;
  totalCourses: number;
  totalStudents: number;
}

export interface TeacherCourse {
  id: string;
  name: string;
  description: string | null;
  teacherName: string;
  studentsCount: number;
  groupsCount: number;
  membersCount: number;
  createdAt: Date;
}

export interface CreateCourseDTO {
  name: string;
  description?: string;
}

export interface TeacherDetails extends Teacher {
  courses: TeacherCourse[];
}
