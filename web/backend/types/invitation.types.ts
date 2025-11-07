export interface Invitation {
  id: string;
  name: string;
  code: string;
  used: boolean;
  userId: string | null;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvitationWithCourse extends Invitation {
  course: {
    id: string;
    name: string;
    description: string | null;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateInvitationDTO {
  name: string;
  courseId: string;
  email?: string;
}

export interface CreateBulkInvitationsDTO {
  courseId: string;
  emails: string[];
}

export interface ValidateInvitationDTO {
  code: string;
  userId: string;
}

export interface InvitationResponse {
  id: string;
  name: string;
  code: string;
  courseId: string;
  courseName: string;
  used: boolean;
  expiresAt?: Date;
}

export interface GeneratedInvitation {
  code: string;
  url: string;
}
