export interface Task {
  id: string;
  name: string;
  description: string | null;
  experience: number;
  gold: number;
  health: number;
  energy: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskWithAssignments extends Task {
  assignedGroups: {
    id: string;
    name: string;
    memberCount: number;
  }[];
  completedCount: number;
  totalAssigned: number;
}

export interface CreateTaskDTO {
  name: string;
  description?: string;
  experience?: number;
  gold?: number;
  health?: number;
  energy?: number;
}

export interface UpdateTaskDTO {
  name?: string;
  description?: string;
  experience?: number;
  gold?: number;
  health?: number;
  energy?: number;
}

export interface AssignTaskDTO {
  taskId: string;
  groupIds: string[];
}

export interface CompleteTaskDTO {
  taskId: string;
  memberId: string;
}

export interface TaskProgress {
  taskId: string;
  taskName: string;
  totalMembers: number;
  completedMembers: number;
  progress: number;
}
