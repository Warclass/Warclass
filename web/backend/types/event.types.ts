export interface RandomEvent {
  id: string;
  name: string;
  description: string;
  type: string;
  rank: string;
  experience: number;
  gold: number;
  health: number;
  energy: number;
  isActive: boolean;
  isGlobal: boolean;
  courseId?: string | null;
  courseName?: string;
  teacherId?: string | null;
  teacherName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventDTO {
  name: string;
  description: string;
  type?: string;
  rank?: string;
  experience?: number;
  gold?: number;
  health?: number;
  energy?: number;
  isActive?: boolean;
  isGlobal?: boolean;
  courseId?: string;
}

export interface UpdateEventDTO {
  name?: string;
  description?: string;
  type?: string;
  rank?: string;
  experience?: number;
  gold?: number;
  health?: number;
  energy?: number;
  isActive?: boolean;
  isGlobal?: boolean;
}

export interface ApplyEventDTO {
  eventId: string;
  characterIds: string[];
}

export interface EventHistory {
  id: string;
  eventId: string;
  characterId: string;
  appliedAt: Date;
  event: RandomEvent;
}

export interface EventResponse {
  event: RandomEvent;
  affectedCharacters: number;
}

export interface EventImpact {
  characterId: string;
  characterName: string;
  experienceChange: number;
  goldChange: number;
  healthChange: number;
  energyChange: number;
}
