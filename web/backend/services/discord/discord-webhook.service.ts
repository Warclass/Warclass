/**
 * Servicio para enviar notificaciones a Discord mediante Webhooks
 * 
 * Documentación de Discord Webhooks:
 * https://discord.com/developers/docs/resources/webhook#execute-webhook
 */

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number; // Color en formato decimal (ej: 0x00FF00 para verde)
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  timestamp?: string; // ISO 8601 timestamp
  footer?: {
    text: string;
    icon_url?: string;
  };
  author?: {
    name: string;
    icon_url?: string;
  };
  thumbnail?: {
    url: string;
  };
}

export interface DiscordWebhookPayload {
  content?: string; // Mensaje de texto (hasta 2000 caracteres)
  username?: string; // Nombre personalizado del webhook
  avatar_url?: string; // URL del avatar personalizado
  embeds?: DiscordEmbed[]; // Hasta 10 embeds
}

/**
 * Colores predefinidos para embeds de Discord
 */
export const DiscordColors = {
  // Colores de eventos
  SUCCESS: 0x00FF00, // Verde
  ERROR: 0xFF0000, // Rojo
  WARNING: 0xFFFF00, // Amarillo
  INFO: 0x0099FF, // Azul
  
  // Colores de rangos de eventos
  RANK_S: 0xFF0000, // Rojo (desastres S)
  RANK_A: 0xFF6600, // Naranja (desastres A)
  RANK_B: 0xFFCC00, // Amarillo oscuro
  RANK_C: 0xFFFF99, // Amarillo claro
  RANK_D: 0xCCCCCC, // Gris
  
  // Colores de tipos de eventos
  DISASTER: 0x8B0000, // Rojo oscuro
  FORTUNE: 0xFFD700, // Dorado
  NEUTRAL: 0x808080, // Gris
  
  // Colores de notificaciones
  QUIZ_COMPLETED: 0x9B59B6, // Púrpura
  TASK_COMPLETED: 0x3498DB, // Azul
  EVENT_APPLIED: 0xE74C3C, // Rojo coral
  CHARACTER_UPDATE: 0x2ECC71, // Verde esmeralda
};

/**
 * Enviar una notificación a Discord usando un webhook
 */
export async function sendDiscordNotification(
  webhookUrl: string,
  payload: DiscordWebhookPayload
): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Discord webhook error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      return false;
    }

    console.log('✅ Discord notification sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Error sending Discord notification:', error);
    return false;
  }
}

/**
 * Enviar notificación cuando se aplica un evento a personajes
 */
export async function notifyEventApplied(
  webhookUrl: string,
  data: {
    eventName: string;
    eventDescription: string;
    eventType: 'disaster' | 'fortune' | 'neutral';
    eventRank: 'S' | 'A' | 'B' | 'C' | 'D';
    courseName: string;
    affectedCharacters: number;
    changes: {
      health?: number;
      energy?: number;
      gold?: number;
      experience?: number;
    };
  }
): Promise<boolean> {
  const { eventName, eventDescription, eventType, eventRank, courseName, affectedCharacters, changes } = data;

  // Determinar color según el tipo y rango del evento
  let color = DiscordColors.NEUTRAL;
  if (eventType === 'disaster') {
    color = eventRank === 'S' ? DiscordColors.RANK_S :
            eventRank === 'A' ? DiscordColors.RANK_A :
            eventRank === 'B' ? DiscordColors.RANK_B :
            DiscordColors.RANK_C;
  } else if (eventType === 'fortune') {
    color = DiscordColors.FORTUNE;
  }

  // Construir campos de cambios
  const fields: Array<{ name: string; value: string; inline: boolean }> = [];
  
  if (changes.health !== undefined) {
    fields.push({
      name: '❤️ Salud',
      value: changes.health > 0 ? `+${changes.health}` : `${changes.health}`,
      inline: true,
    });
  }
  
  if (changes.energy !== undefined) {
    fields.push({
      name: '⚡ Energía',
      value: changes.energy > 0 ? `+${changes.energy}` : `${changes.energy}`,
      inline: true,
    });
  }
  
  if (changes.gold !== undefined) {
    fields.push({
      name: '💰 Oro',
      value: changes.gold > 0 ? `+${changes.gold}` : `${changes.gold}`,
      inline: true,
    });
  }
  
  if (changes.experience !== undefined) {
    fields.push({
      name: '✨ Experiencia',
      value: changes.experience > 0 ? `+${changes.experience}` : `${changes.experience}`,
      inline: true,
    });
  }

  fields.push({
    name: '👥 Personajes afectados',
    value: `${affectedCharacters}`,
    inline: true,
  });

  const embed: DiscordEmbed = {
    title: `🎲 Evento aplicado: ${eventName}`,
    description: eventDescription,
    color,
    fields,
    timestamp: new Date().toISOString(),
    footer: {
      text: `Curso: ${courseName} | Rango: ${eventRank}`,
    },
  };

  return sendDiscordNotification(webhookUrl, {
    username: 'Warclass Bot',
    embeds: [embed],
  });
}

/**
 * Enviar notificación cuando un estudiante completa un quiz
 */
export async function notifyQuizCompleted(
  webhookUrl: string,
  data: {
    characterName: string;
    quizQuestion: string;
    isCorrect: boolean;
    pointsEarned: number;
    timeTaken: number;
    courseName: string;
  }
): Promise<boolean> {
  const { characterName, quizQuestion, isCorrect, pointsEarned, timeTaken, courseName } = data;

  const embed: DiscordEmbed = {
    title: isCorrect ? '✅ Quiz Completado' : '❌ Quiz Fallado',
    description: `**${characterName}** ha respondido un quiz`,
    color: isCorrect ? DiscordColors.SUCCESS : DiscordColors.ERROR,
    fields: [
      {
        name: '❓ Pregunta',
        value: quizQuestion.length > 100 ? quizQuestion.substring(0, 97) + '...' : quizQuestion,
        inline: false,
      },
      {
        name: '🏆 Puntos',
        value: `${pointsEarned}`,
        inline: true,
      },
      {
        name: '⏱️ Tiempo',
        value: `${timeTaken}s`,
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: `Curso: ${courseName}`,
    },
  };

  return sendDiscordNotification(webhookUrl, {
    username: 'Warclass Bot',
    embeds: [embed],
  });
}

/**
 * Enviar notificación cuando un estudiante completa una tarea
 */
export async function notifyTaskCompleted(
  webhookUrl: string,
  data: {
    characterName: string;
    taskName: string;
    taskDescription: string;
    rewards: {
      experience: number;
      gold: number;
    };
    courseName: string;
  }
): Promise<boolean> {
  const { characterName, taskName, taskDescription, rewards, courseName } = data;

  const embed: DiscordEmbed = {
    title: '✅ Tarea Completada',
    description: `**${characterName}** ha completado una tarea`,
    color: DiscordColors.TASK_COMPLETED,
    fields: [
      {
        name: '📋 Tarea',
        value: taskName,
        inline: false,
      },
      {
        name: '📝 Descripción',
        value: taskDescription.length > 100 ? taskDescription.substring(0, 97) + '...' : taskDescription,
        inline: false,
      },
      {
        name: '✨ Experiencia',
        value: `+${rewards.experience}`,
        inline: true,
      },
      {
        name: '💰 Oro',
        value: `+${rewards.gold}`,
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: `Curso: ${courseName}`,
    },
  };

  return sendDiscordNotification(webhookUrl, {
    username: 'Warclass Bot',
    embeds: [embed],
  });
}

/**
 * Enviar un resumen de leaderboard (ranking)
 */
export async function notifyLeaderboard(
  webhookUrl: string,
  data: {
    courseName: string;
    topCharacters: Array<{
      rank: number;
      name: string;
      score: number;
    }>;
  }
): Promise<boolean> {
  const { courseName, topCharacters } = data;

  const leaderboardText = topCharacters
    .map((char) => `**${char.rank}.** ${char.name} - ${char.score} puntos`)
    .join('\n');

  const embed: DiscordEmbed = {
    title: '🏆 Ranking del Curso',
    description: leaderboardText,
    color: DiscordColors.INFO,
    timestamp: new Date().toISOString(),
    footer: {
      text: `Curso: ${courseName}`,
    },
  };

  return sendDiscordNotification(webhookUrl, {
    username: 'Warclass Bot',
    embeds: [embed],
  });
}

/**
 * Enviar notificación personalizada
 */
export async function notifyCustomMessage(
  webhookUrl: string,
  data: {
    title: string;
    description: string;
    color?: number;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
  }
): Promise<boolean> {
  const { title, description, color, fields } = data;

  const embed: DiscordEmbed = {
    title,
    description,
    color: color || DiscordColors.INFO,
    fields,
    timestamp: new Date().toISOString(),
  };

  return sendDiscordNotification(webhookUrl, {
    username: 'Warclass Bot',
    embeds: [embed],
  });
}
