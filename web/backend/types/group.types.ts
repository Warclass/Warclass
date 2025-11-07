export interface Group {
  id: string;
  name: string;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupWithMembers extends Group {
  members: {
    id: string;
    name: string;
    experience: number;
    gold: number;
    energy: number;
  }[];
  memberCount: number;
}

export interface GroupWithCourse extends Group {
  course: {
    id: string;
    name: string;
    description: string | null;
  };
}

export interface CreateGroupDTO {
  name: string;
  courseId: string;
}

export interface UpdateGroupDTO {
  name?: string;
}

export interface AssignMembersDTO {
  groupId: string;
  memberIds: string[];
}

export interface GroupStatistics {
  totalMembers: number;
  averageExperience: number;
  averageGold: number;
  averageEnergy: number;
  totalQuizzes: number;
  completedQuizzes: number;
}
