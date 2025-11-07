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
}

export interface ApplyEventDTO {
  eventId: string;
  memberIds: string[];
}

export interface EventHistory {
  id: string;
  eventId: string;
  memberId: string;
  appliedAt: Date;
  event: RandomEvent;
}

export interface EventResponse {
  event: RandomEvent;
  affectedMembers: number;
}

export interface EventImpact {
  memberId: string;
  memberName: string;
  experienceChange: number;
  goldChange: number;
  healthChange: number;
  energyChange: number;
}
