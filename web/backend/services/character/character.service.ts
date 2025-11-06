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
  memberId: string; // El ID del member al que pertenece el personaje
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
    // Buscar si el usuario tiene alguna inscripción con un member que tenga character
    const inscriptions = await prisma.inscriptions.findMany({
      where: { user_id: userId },
      include: {
        course: {
          include: {
            groups: {
              include: {
                members: {
                  include: {
                    characters: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Verificar si algún member tiene un character
    for (const inscription of inscriptions) {
      for (const group of inscription.course.groups) {
        for (const member of group.members) {
          if (member.characters) {
            return true;
          }
        }
      }
    }

    return false;
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
    // Buscar la inscripción del usuario al curso
    const inscription = await prisma.inscriptions.findUnique({
      where: {
        user_id_course_id: {
          user_id: userId,
          course_id: courseId
        }
      },
      include: {
        course: {
          include: {
            groups: {
              include: {
                members: {
                  include: {
                    characters: {
                      include: {
                        class: true,
                        abilities: {
                          include: {
                            ability: true
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!inscription) {
      return null;
    }

    // Buscar el member y character correspondiente
    for (const group of inscription.course.groups) {
      for (const member of group.members) {
        if (member.characters) {
          const char = member.characters;
          return {
            id: char.id,
            name: char.name,
            experience: char.experience,
            gold: char.gold,
            energy: char.energy,
            className: char.class.name,
            classSpeed: char.class.speed,
            abilities: char.abilities.map(ca => ({
              id: ca.ability.id,
              name: ca.ability.name,
              description: ca.ability.description,
              gold: ca.ability.gold
            }))
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error al obtener personaje del usuario:', error);
    return null;
  }
}

/**
 * Crea un nuevo personaje para un member
 */
export async function createCharacter(data: CreateCharacterInput): Promise<CharacterData> {
  try {
    // Verificar que el member existe
    const member = await prisma.members.findUnique({
      where: { id: data.memberId }
    });

    if (!member) {
      throw new Error('Member no encontrado');
    }

    // Verificar que el member no tiene ya un personaje
    const existingCharacter = await prisma.characters.findUnique({
      where: { character_id: data.memberId }
    });

    if (existingCharacter) {
      throw new Error('Este member ya tiene un personaje');
    }

    // Verificar que la clase existe
    const characterClass = await prisma.classes.findUnique({
      where: { id: data.classId }
    });

    if (!characterClass) {
      throw new Error('Clase de personaje no encontrada');
    }

    // Crear el personaje
    const character = await prisma.characters.create({
      data: {
        name: data.name,
        character_id: data.memberId,
        class_id: data.classId,
        experience: member.experience,
        gold: member.gold,
        energy: member.energy
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
      abilities: character.abilities.map(ca => ({
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
 * Obtiene el member ID de un usuario para un curso específico
 */
export async function getUserMemberForCourse(userId: string, courseId: string): Promise<string | null> {
  try {
    const inscription = await prisma.inscriptions.findUnique({
      where: {
        user_id_course_id: {
          user_id: userId,
          course_id: courseId
        }
      },
      include: {
        course: {
          include: {
            groups: {
              include: {
                members: true
              }
            }
          }
        }
      }
    });

    if (!inscription) {
      return null;
    }

    // Por ahora, devolvemos el primer member del primer grupo
    // TODO: Implementar lógica para asignar correctamente el member
    for (const group of inscription.course.groups) {
      if (group.members.length > 0) {
        return group.members[0].id;
      }
    }

    return null;
  } catch (error) {
    console.error('Error al obtener member del usuario:', error);
    return null;
  }
}
