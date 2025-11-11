import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Warclass API',
      version: '1.0.0',
      description: 'API documentation for Warclass - Sistema de gestión educativa gamificado',
      contact: {
        name: 'Warclass Team',
        url: 'https://github.com/Warclass/Warclass',
      },
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token de autenticación',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error',
            },
            message: {
              type: 'string',
              description: 'Descripción detallada del error',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del usuario',
            },
            name: {
              type: 'string',
              description: 'Nombre completo del usuario',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
            },
            role: {
              type: 'string',
              enum: ['STUDENT', 'TEACHER', 'ADMIN'],
              description: 'Rol del usuario',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
            },
          },
        },
        Character: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del personaje',
            },
            name: {
              type: 'string',
              description: 'Nombre del personaje',
            },
            class: {
              type: 'string',
              enum: ['WARRIOR', 'MAGE', 'ROGUE', 'CLERIC'],
              description: 'Clase del personaje',
            },
            level: {
              type: 'integer',
              description: 'Nivel del personaje',
            },
            experience: {
              type: 'integer',
              description: 'Experiencia acumulada',
            },
            health: {
              type: 'integer',
              description: 'Puntos de salud',
            },
            mana: {
              type: 'integer',
              description: 'Puntos de maná',
            },
            strength: {
              type: 'integer',
              description: 'Fuerza',
            },
            intelligence: {
              type: 'integer',
              description: 'Inteligencia',
            },
            dexterity: {
              type: 'integer',
              description: 'Destreza',
            },
            constitution: {
              type: 'integer',
              description: 'Constitución',
            },
          },
        },
        Course: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del curso',
            },
            name: {
              type: 'string',
              description: 'Nombre del curso',
            },
            description: {
              type: 'string',
              description: 'Descripción del curso',
            },
            code: {
              type: 'string',
              description: 'Código del curso',
            },
            teacherId: {
              type: 'integer',
              description: 'ID del profesor',
            },
            institutionId: {
              type: 'integer',
              description: 'ID de la institución',
            },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID única de la tarea',
            },
            title: {
              type: 'string',
              description: 'Título de la tarea',
            },
            description: {
              type: 'string',
              description: 'Descripción de la tarea',
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de entrega',
            },
            experienceReward: {
              type: 'integer',
              description: 'Recompensa de experiencia',
            },
            courseId: {
              type: 'integer',
              description: 'ID del curso',
            },
          },
        },
        Quiz: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del quiz',
            },
            title: {
              type: 'string',
              description: 'Título del quiz',
            },
            description: {
              type: 'string',
              description: 'Descripción del quiz',
            },
            difficulty: {
              type: 'string',
              enum: ['EASY', 'MEDIUM', 'HARD'],
              description: 'Dificultad del quiz',
            },
            experienceReward: {
              type: 'integer',
              description: 'Recompensa de experiencia',
            },
            courseId: {
              type: 'integer',
              description: 'ID del curso',
            },
          },
        },
        Event: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del evento',
            },
            name: {
              type: 'string',
              description: 'Nombre del evento',
            },
            description: {
              type: 'string',
              description: 'Descripción del evento',
            },
            eventType: {
              type: 'string',
              enum: ['QUEST', 'BOSS', 'DUNGEON', 'PVP'],
              description: 'Tipo de evento',
            },
            difficulty: {
              type: 'string',
              enum: ['EASY', 'MEDIUM', 'HARD', 'LEGENDARY'],
              description: 'Dificultad del evento',
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de inicio',
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de fin',
            },
            experienceReward: {
              type: 'integer',
              description: 'Recompensa de experiencia',
            },
          },
        },
        Group: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del grupo',
            },
            name: {
              type: 'string',
              description: 'Nombre del grupo',
            },
            description: {
              type: 'string',
              description: 'Descripción del grupo',
            },
            courseId: {
              type: 'integer',
              description: 'ID del curso',
            },
            maxMembers: {
              type: 'integer',
              description: 'Número máximo de miembros',
            },
          },
        },
        Institution: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID única de la institución',
            },
            name: {
              type: 'string',
              description: 'Nombre de la institución',
            },
            code: {
              type: 'string',
              description: 'Código de la institución',
            },
            description: {
              type: 'string',
              description: 'Descripción de la institución',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Endpoints de autenticación y registro',
      },
      {
        name: 'Characters',
        description: 'Gestión de personajes de jugador',
      },
      {
        name: 'Courses',
        description: 'Gestión de cursos',
      },
      {
        name: 'Dashboard',
        description: 'Datos del dashboard del usuario',
      },
      {
        name: 'Events',
        description: 'Gestión de eventos y misiones',
      },
      {
        name: 'Groups',
        description: 'Gestión de grupos',
      },
      {
        name: 'Institutions',
        description: 'Gestión de instituciones educativas',
      },
      {
        name: 'Invitations',
        description: 'Gestión de invitaciones',
      },
      {
        name: 'Profile',
        description: 'Gestión del perfil de usuario',
      },
      {
        name: 'Quizzes',
        description: 'Gestión de cuestionarios',
      },
      {
        name: 'Tasks',
        description: 'Gestión de tareas',
      },
      {
        name: 'Teachers',
        description: 'Gestión de profesores',
      },
    ],
  },
  apis: [
    './app/api/**/*.ts',
    './backend/**/*.ts',
  ], // Rutas a los archivos de las API routes
};

export const swaggerSpec = swaggerJsdoc(options);
