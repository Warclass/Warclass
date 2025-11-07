/**
 * Teacher Types
 * Types for teacher management (users who can create courses)
 */

export interface Teacher {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  internalId: string | null;
  institutionId: string | null;
  institutionName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTeacherDTO {
  userId: string;
  internalId?: string | null;
  institutionId?: string | null;
}

export interface UpdateTeacherDTO {
  internalId?: string | null;
  institutionId?: string | null;
}

export interface TeacherResponse {
  success: boolean;
  teacher?: Teacher;
  message?: string;
}

export interface TeachersListResponse {
  success: boolean;
  teachers: Teacher[];
  total: number;
}
