import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export interface CharacterData {
  id: string;
  name: string;
  experience: number;
  gold: number;
  energy: number;
  className: string;
  classSpeed: number;
  abilities: Array<{
    id: string;
    name: string;
    description: string | null;
    gold: number;
  }>;
}

export interface CreateCharacterInput {
  name: string;
  classId: string;
  userId: string; // El ID del usuario propietario del character
  groupId: string; // El ID del grupo al que pertenece
  appearance?: {
    Hair?: string;
    Eyes?: string;
    Skin?: string;
  };
}

/**
 * Verifica si un usuario tiene al menos un personaje creado
 */
export async function userHasCharacter(userId: string): Promise<boolean> {
  try {
    // Buscar directamente si el usuario tiene algún character
    const characterCount = await prisma.characters.count({
      where: { user_id: userId }
    });

    return characterCount > 0;
  } catch (error) {
    console.error('Error al verificar si usuario tiene personaje:', error);
    return false;
  }
}

/**
 * Obtiene el personaje de un usuario para un curso específico
 */
export async function getUserCharacterForCourse(userId: string, courseId: string): Promise<CharacterData | null> {
  try {
    // Verificar que el usuario está inscrito en el curso
    const inscription = await prisma.inscriptions.findUnique({
      where: {
        user_id_course_id: {
          user_id: userId,
          course_id: courseId
        },
        is_active: true // Solo inscripciones activas
      }
    });

    if (!inscription) {
      return null;
    }

    // Buscar el character del usuario en algún grupo de este curso
    const character = await prisma.characters.findFirst({
      where: {
        user_id: userId,
        group: {
          course_id: courseId
        }
      },
      include: {
        class: true,
        abilities: {
          include: {
            ability: true
          }
        }
      }
    });

    if (!character) {
      return null;
    }

    return {
      id: character.id,
      name: character.name,
      experience: character.experience,
      gold: character.gold,
      energy: character.energy,
      className: character.class.name,
      classSpeed: character.class.speed,
      abilities: character.abilities.map((ca: any) => ({
        id: ca.ability.id,
        name: ca.ability.name,
        description: ca.ability.description,
        gold: ca.ability.gold
      }))
    };
  } catch (error) {
    console.error('Error al obtener personaje del usuario:', error);
    return null;
  }
}

/**
 * Crea un nuevo personaje para un usuario en un grupo específico
 */
export async function createCharacter(data: CreateCharacterInput): Promise<CharacterData> {
  try {
    // Verificar que el grupo existe
    const group = await prisma.groups.findUnique({
      where: { id: data.groupId }
    });

    if (!group) {
      throw new Error('Grupo no encontrado');
    }

    // Verificar que el usuario está inscrito en el curso del grupo
    const inscription = await prisma.inscriptions.findUnique({
      where: {
        user_id_course_id: {
          user_id: data.userId,
          course_id: group.course_id
        },
        is_active: true
      }
    });

    if (!inscription) {
      throw new Error('Usuario no inscrito en el curso de este grupo');
    }

    // Verificar que el usuario no tiene ya un personaje en este grupo
    const existingCharacter = await prisma.characters.findUnique({
      where: {
        user_id_group_id: {
          user_id: data.userId,
          group_id: data.groupId
        }
      }
    });

    if (existingCharacter) {
      throw new Error('Ya tienes un personaje en este grupo');
    }

    // Verificar que la clase existe
    const characterClass = await prisma.classes.findUnique({
      where: { id: data.classId }
    });

    if (!characterClass) {
      throw new Error('Clase de personaje no encontrada');
    }

    // Crear el personaje con stats iniciales
    const character = await prisma.characters.create({
      data: {
        name: data.name,
        user_id: data.userId,
        group_id: data.groupId,
        class_id: data.classId,
        experience: 0,
        gold: 500, // Oro inicial
        energy: 100, // Energía inicial
        health: 100, // Salud inicial
        appearance: data.appearance ? JSON.parse(JSON.stringify(data.appearance)) : undefined
      },
      include: {
        class: true,
        abilities: {
          include: {
            ability: true
          }
        }
      }
    });

    return {
      id: character.id,
      name: character.name,
      experience: character.experience,
      gold: character.gold,
      energy: character.energy,
      className: character.class.name,
      classSpeed: character.class.speed,
      abilities: character.abilities.map((ca: any) => ({
        id: ca.ability.id,
        name: ca.ability.name,
        description: ca.ability.description,
        gold: ca.ability.gold
      }))
    };
  } catch (error) {
    console.error('Error al crear personaje:', error);
    throw error;
  }
}

/**
 * Obtiene todas las clases de personaje disponibles
 */
export async function getCharacterClasses() {
  try {
    return await prisma.classes.findMany({
      select: {
        id: true,
        name: true,
        speed: true
      }
    });
  } catch (error) {
    console.error('Error al obtener clases de personaje:', error);
    throw new Error('No se pudieron obtener las clases de personaje');
  }
}

/**
 * Obtiene los grupos disponibles para un usuario en un curso
 * (donde puede crear un personaje si aún no tiene uno)
 */
export async function getAvailableGroupsForUser(userId: string, courseId: string): Promise<Array<{ id: string; name: string; hasCharacter: boolean }> | null> {
  try {
    // Verificar que está inscrito
    const inscription = await prisma.inscriptions.findUnique({
      where: {
        user_id_course_id: {
          user_id: userId,
          course_id: courseId
        },
        is_active: true
      }
    });

    if (!inscription) {
      return null;
    }

    // Obtener todos los grupos del curso
    const groups = await prisma.groups.findMany({
      where: { course_id: courseId },
      select: {
        id: true,
        name: true
      }
    });

    // Verificar en cuáles tiene personaje
    const characters = await prisma.characters.findMany({
      where: {
        user_id: userId,
        group_id: {
          in: groups.map(g => g.id)
        }
      },
      select: {
        group_id: true
      }
    });

    const characterGroupIds = new Set(characters.map(c => c.group_id));

    return groups.map(group => ({
      id: group.id,
      name: group.name,
      hasCharacter: characterGroupIds.has(group.id)
    }));
  } catch (error) {
    console.error('Error al obtener grupos disponibles:', error);
    return null;
  }
}
