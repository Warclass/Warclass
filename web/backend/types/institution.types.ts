/**
 * Institution Types
 * Types for educational institutions management
 */

export interface Institution {
  id: string;
  name: string;
  phoneNumber: string | null;
  teachersCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InstitutionWithTeachers extends Institution {
  teachers: Array<{
    id: string;
    userName: string;
    userEmail: string;
    internalId: string | null;
  }>;
}

export interface CreateInstitutionDTO {
  name: string;
  phoneNumber?: string | null;
}

export interface UpdateInstitutionDTO {
  name?: string;
  phoneNumber?: string | null;
}

export interface AssignTeacherDTO {
  teacherId: string;
  internalId?: string | null;
}

export interface InstitutionResponse {
  success: boolean;
  institution?: Institution | InstitutionWithTeachers;
  message?: string;
}

export interface InstitutionsListResponse {
  success: boolean;
  institutions: Institution[];
  total: number;
}
