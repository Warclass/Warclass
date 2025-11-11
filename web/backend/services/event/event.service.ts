import { prisma } from '@/backend/config/prisma';
import {
  CreateEventDTO,
  UpdateEventDTO,
  ApplyEventDTO,
  RandomEvent,
  EventResponse,
  EventImpact,
  EventHistory,
} from '@/backend/types/event.types';

export class EventService {
  static async createEvent(data: CreateEventDTO): Promise<RandomEvent> {
    try {
      const event = await prisma.events.create({
        data: {
          name: data.name,
          description: data.description,
          type: data.type || 'neutral',
          rank: data.rank || 'D',
          experience: data.experience || 0,
          gold: data.gold || 0,
          health: data.health || 0,
          energy: data.energy || 0,
          is_active: data.isActive !== undefined ? data.isActive : true,
        },
      });

      return {
        id: event.id,
        name: event.name,
        description: event.description,
        type: event.type,
        rank: event.rank,
        experience: event.experience,
        gold: event.gold,
        health: event.health,
        energy: event.energy,
        isActive: event.is_active,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
      };
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  static async getAllEvents(): Promise<RandomEvent[]> {
    try {
      const events = await prisma.events.findMany({
        orderBy: { created_at: 'desc' },
      });

      return events.map((event) => ({
        id: event.id,
        name: event.name,
        description: event.description,
        type: event.type,
        rank: event.rank,
        experience: event.experience,
        gold: event.gold,
        health: event.health,
        energy: event.energy,
        isActive: event.is_active,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
      }));
    } catch (error) {
      console.error('Error getting events:', error);
      throw error;
    }
  }

  static async getEventById(eventId: string): Promise<RandomEvent> {
    try {
      const event = await prisma.events.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new Error('Evento no encontrado');
      }

      return {
        id: event.id,
        name: event.name,
        description: event.description,
        type: event.type,
        rank: event.rank,
        experience: event.experience,
        gold: event.gold,
        health: event.health,
        energy: event.energy,
        isActive: event.is_active,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
      };
    } catch (error) {
      console.error('Error getting event:', error);
      throw error;
    }
  }

  static async updateEvent(eventId: string, data: UpdateEventDTO): Promise<RandomEvent> {
    try {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.rank !== undefined) updateData.rank = data.rank;
      if (data.experience !== undefined) updateData.experience = data.experience;
      if (data.gold !== undefined) updateData.gold = data.gold;
      if (data.health !== undefined) updateData.health = data.health;
      if (data.energy !== undefined) updateData.energy = data.energy;
      if (data.isActive !== undefined) updateData.is_active = data.isActive;

      const event = await prisma.events.update({
        where: { id: eventId },
        data: updateData,
      });

      return {
        id: event.id,
        name: event.name,
        description: event.description,
        type: event.type,
        rank: event.rank,
        experience: event.experience,
        gold: event.gold,
        health: event.health,
        energy: event.energy,
        isActive: event.is_active,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
      };
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  static async deleteEvent(eventId: string): Promise<void> {
    try {
      await prisma.events.delete({
        where: { id: eventId },
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  static async applyEventToCharacters(data: ApplyEventDTO): Promise<EventResponse> {
    try {
      const event = await prisma.events.findUnique({
        where: { id: data.eventId },
      });

      if (!event) {
        throw new Error('Evento no encontrado');
      }

      const updates = data.characterIds.map(async (characterId) => {
        const character = await prisma.characters.findUnique({
          where: { id: characterId },
        });

        if (!character) {
          console.warn(`Personaje ${characterId} no encontrado`);
          return null;
        }

        await prisma.$transaction([
          prisma.events_history.create({
            data: {
              event_id: event.id,
              character_id: characterId,
            },
          }),
          prisma.characters.update({
            where: { id: characterId },
            data: {
              experience: { increment: event.experience },
              gold: { increment: event.gold },
              energy: { increment: event.energy },
              health: { increment: event.health },
            },
          }),
        ]);

        return characterId;
      });

      const results = await Promise.all(updates);
      const affectedCount = results.filter((r) => r !== null).length;

      return {
        event: {
          id: event.id,
          name: event.name,
          description: event.description,
          type: event.type,
          rank: event.rank,
          experience: event.experience,
          gold: event.gold,
          health: event.health,
          energy: event.energy,
          isActive: event.is_active,
          createdAt: event.created_at,
          updatedAt: event.updated_at,
        },
        affectedCharacters: affectedCount,
      };
    } catch (error) {
      console.error('Error applying event:', error);
      throw error;
    }
  }

  static async applyEventToGroup(eventId: string, groupId: string): Promise<EventResponse> {
    try {
      const event = await prisma.events.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new Error('Evento no encontrado');
      }

      const group = await prisma.groups.findUnique({
        where: { id: groupId },
        include: { characters: true },
      });

      if (!group) {
        throw new Error('Grupo no encontrado');
      }

      const characterIds = group.characters.map((c) => c.id);
      return await this.applyEventToCharacters({
        eventId: event.id,
        characterIds,
      });
    } catch (error) {
      console.error('Error applying event to group:', error);
      throw error;
    }
  }

  static async getEventHistory(eventId: string): Promise<EventHistory[]> {
    try {
      const history = await prisma.events_history.findMany({
        where: { event_id: eventId },
        include: {
          event: true,
          character: true,
        },
        orderBy: { applied_at: 'desc' },
      });

      return history.map((h) => ({
        id: h.id,
        eventId: h.event_id,
        characterId: h.character_id,
        appliedAt: h.applied_at,
        event: {
          id: h.event.id,
          name: h.event.name,
          description: h.event.description,
          type: h.event.type,
          rank: h.event.rank,
          experience: h.event.experience,
          gold: h.event.gold,
          health: h.event.health,
          energy: h.event.energy,
          isActive: h.event.is_active,
          createdAt: h.event.created_at,
          updatedAt: h.event.updated_at,
        },
      }));
    } catch (error) {
      console.error('Error getting event history:', error);
      throw error;
    }
  }

  static async getCharacterEventHistory(characterId: string): Promise<EventHistory[]> {
    try {
      const history = await prisma.events_history.findMany({
        where: { character_id: characterId },
        include: {
          event: true,
        },
        orderBy: { applied_at: 'desc' },
      });

      return history.map((h) => ({
        id: h.id,
        eventId: h.event_id,
        characterId: h.character_id,
        appliedAt: h.applied_at,
        event: {
          id: h.event.id,
          name: h.event.name,
          description: h.event.description,
          type: h.event.type,
          rank: h.event.rank,
          experience: h.event.experience,
          gold: h.event.gold,
          health: h.event.health,
          energy: h.event.energy,
          isActive: h.event.is_active,
          createdAt: h.event.created_at,
          updatedAt: h.event.updated_at,
        },
      }));
    } catch (error) {
      console.error('Error getting character event history:', error);
      throw error;
    }
  }
}
