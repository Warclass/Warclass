import { PrismaClient } from '../lib/generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Limpiar datos existentes (opcional - comentar si no quieres borrar)
  console.log('🧹 Cleaning existing data...');
  await prisma.events_history.deleteMany();
  await prisma.characters_abilities.deleteMany();
  await prisma.characters_tasks.deleteMany();
  await prisma.teachers_courses_tasks.deleteMany();
  await prisma.quizzes_history.deleteMany();
  await prisma.characters.deleteMany();
  await prisma.quizzes.deleteMany();
  await prisma.groups.deleteMany();
  await prisma.invitations.deleteMany();
  await prisma.inscriptions.deleteMany();
  await prisma.teachers_courses.deleteMany();
  await prisma.courses.deleteMany();
  await prisma.teachers.deleteMany();
  await prisma.institutions.deleteMany();
  await prisma.sessions.deleteMany();
  await prisma.users.deleteMany();
  await prisma.tasks.deleteMany();
  await prisma.events.deleteMany();
  await prisma.abilities.deleteMany();
  await prisma.classes.deleteMany();

  // 1. Crear clases de personajes
  console.log('🎭 Creating character classes...');
  const mageClass = await prisma.classes.create({
    data: {
      name: 'Mago',
      speed: 8,
    },
  });

  const warriorClass = await prisma.classes.create({
    data: {
      name: 'Guerrero',
      speed: 6,
    },
  });

  const healerClass = await prisma.classes.create({
    data: {
      name: 'Curandero',
      speed: 7,
    },
  });

  const elfClass = await prisma.classes.create({
    data: {
      name: 'Elfo',
      speed: 9,
    },
  });

  // 2. Crear habilidades
  console.log('⚡ Creating abilities...');
  const abilities = await Promise.all([
    prisma.abilities.create({
      data: {
        name: 'Bola de Fuego',
        description: 'Lanza una bola de fuego que causa daño masivo',
        gold: 100,
      },
    }),
    prisma.abilities.create({
      data: {
        name: 'Curación',
        description: 'Restaura la salud de un aliado',
        gold: 80,
      },
    }),
    prisma.abilities.create({
      data: {
        name: 'Escudo',
        description: 'Crea un escudo protector',
        gold: 60,
      },
    }),
    prisma.abilities.create({
      data: {
        name: 'Ataque Crítico',
        description: 'Ataque poderoso con daño crítico',
        gold: 120,
      },
    }),
  ]);

  // 3. Crear usuarios
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.users.create({
    data: {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      username: 'juanp',
      password: hashedPassword,
    },
  });

  const user2 = await prisma.users.create({
    data: {
      name: 'María García',
      email: 'maria@example.com',
      username: 'mariag',
      password: hashedPassword,
    },
  });

  const user3 = await prisma.users.create({
    data: {
      name: 'Carlos López',
      email: 'carlos@example.com',
      username: 'carlosl',
      password: hashedPassword,
    },
  });

  const teacherUser = await prisma.users.create({
    data: {
      name: 'Dr. García',
      email: 'garcia@example.com',
      username: 'drgarcia',
      password: hashedPassword,
    },
  });

  const teacherUser2 = await prisma.users.create({
    data: {
      name: 'Prof. Martínez',
      email: 'martinez@example.com',
      username: 'profmartinez',
      password: hashedPassword,
    },
  });

  // 4. Crear institución (opcional)
  console.log('🏫 Creating institution...');
  const institution = await prisma.institutions.create({
    data: {
      name: 'Universidad Tecnológica',
      phone_number: '+1234567890',
    },
  });

  // 5. Crear profesores vinculados a users
  console.log('👨‍🏫 Creating teachers...');
  const teacher1 = await prisma.teachers.create({
    data: {
      user_id: teacherUser.id,
      internal_id: 'PROF-2024-001',
      institution_id: institution.id,
    },
  });

  const teacher2 = await prisma.teachers.create({
    data: {
      user_id: teacherUser2.id,
      internal_id: 'PROF-2024-002',
      institution_id: institution.id,
    },
  });

  // Crear un teacher independiente (sin institución)
  const independentTeacherUser = await prisma.users.create({
    data: {
      name: 'Dra. Rodríguez (Independiente)',
      email: 'rodriguez@example.com',
      username: 'drarodriguez',
      password: hashedPassword,
    },
  });

  const teacher3 = await prisma.teachers.create({
    data: {
      user_id: independentTeacherUser.id,
      internal_id: null, // Sin código institucional
      institution_id: null, // Sin institución
    },
  });

  // 5. Crear cursos (SIN teacher_id - solo usar teachers_courses)
  console.log('📚 Creating courses...');
  const course1 = await prisma.courses.create({
    data: {
      name: 'Programación Web',
      description: 'Aprende desarrollo web moderno con React y Next.js',
    },
  });

  const course2 = await prisma.courses.create({
    data: {
      name: 'Base de Datos',
      description: 'Fundamentos de bases de datos relacionales y SQL',
    },
  });

  const course3 = await prisma.courses.create({
    data: {
      name: 'Algoritmos',
      description: 'Estructuras de datos y algoritmos fundamentales',
    },
  });

  const course4 = await prisma.courses.create({
    data: {
      name: 'Inteligencia Artificial',
      description: 'Introducción a IA y Machine Learning',
    },
  });

  const course5 = await prisma.courses.create({
    data: {
      name: 'Matemáticas Discretas',
      description: 'Teoría de grafos, lógica y combinatoria',
    },
  });

  // 6. Crear relación teachers_courses (individualmente para obtener IDs)
  console.log('🔗 Creating teacher-course relationships...');
  const tc1 = await prisma.teachers_courses.create({
    data: { teacher_id: teacher3.id, course_id: course1.id },
  });

  const tc2 = await prisma.teachers_courses.create({
    data: { teacher_id: teacher3.id, course_id: course2.id },
  });

  const tc3 = await prisma.teachers_courses.create({
    data: { teacher_id: teacher3.id, course_id: course3.id },
  });

  const tc4 = await prisma.teachers_courses.create({
    data: { teacher_id: teacher1.id, course_id: course4.id },
  });

  const tc5 = await prisma.teachers_courses.create({
    data: { teacher_id: teacher2.id, course_id: course5.id },
  });

  // 7. Crear inscripciones (user1 inscrito en los cursos) CON SOFT DELETE
  console.log('📝 Creating course enrollments...');
  await prisma.inscriptions.createMany({
    data: [
      // user1 es estudiante en cursos 4 y 5
      { user_id: user1.id, course_id: course4.id, is_active: true },
      { user_id: user1.id, course_id: course5.id, is_active: true },
      // user2 es estudiante en curso 1 y 4
      { user_id: user2.id, course_id: course1.id, is_active: true },
      { user_id: user2.id, course_id: course4.id, is_active: true },
      // user3 es estudiante en cursos 2 y 3
      { user_id: user3.id, course_id: course2.id, is_active: true },
      { user_id: user3.id, course_id: course3.id, is_active: true },
      // teacherUser NO necesita inscripciones (es profesor, no alumno)
    ],
  });

  // 8. Crear grupos
  console.log('👥 Creating groups...');
  const group1 = await prisma.groups.create({
    data: {
      name: 'Grupo A - Programación Web',
      course_id: course1.id,
    },
  });

  const group2 = await prisma.groups.create({
    data: {
      name: 'Grupo A - Base de Datos',
      course_id: course2.id,
    },
  });

  const group3 = await prisma.groups.create({
    data: {
      name: 'Grupo A - Algoritmos',
      course_id: course3.id,
    },
  });

  const group4 = await prisma.groups.create({
    data: {
      name: 'Grupo A - Inteligencia Artificial',
      course_id: course4.id,
    },
  });

  const group5 = await prisma.groups.create({
    data: {
      name: 'Grupo A - Matemáticas Discretas',
      course_id: course5.id,
    },
  });

  // 9. Crear usuarios estudiantes adicionales (necesarios para characters con user_id)
  console.log('👨‍� Creating additional student users...');
  const student1 = await prisma.users.create({
    data: {
      name: 'Chocce, Marcos',
      email: 'marcos.chocce@example.com',
      username: 'mchocce',
      password: hashedPassword,
    },
  });

  const student2 = await prisma.users.create({
    data: {
      name: 'Torres, Ismael',
      email: 'ismael.torres@example.com',
      username: 'itorres',
      password: hashedPassword,
    },
  });

  const student3 = await prisma.users.create({
    data: {
      name: 'Rojas, Cristian',
      email: 'cristian.rojas@example.com',
      username: 'crojas',
      password: hashedPassword,
    },
  });

  const student4 = await prisma.users.create({
    data: {
      name: 'Jimenez, Pedro',
      email: 'pedro.jimenez@example.com',
      username: 'pjimenez',
      password: hashedPassword,
    },
  });

  const student5 = await prisma.users.create({
    data: {
      name: 'Lopez, Tomas',
      email: 'tomas.lopez@example.com',
      username: 'tlopez',
      password: hashedPassword,
    },
  });

  const student6 = await prisma.users.create({
    data: {
      name: 'Sanches, Karen',
      email: 'karen.sanches@example.com',
      username: 'ksanches',
      password: hashedPassword,
    },
  });

  // 10. Crear personajes directamente (SIN tabla members)
  // Characters ahora tiene user_id + group_id directamente
  console.log('🦸 Creating characters...');
  
  // Personajes del grupo 1 (Programación Web)
  const char1 = await prisma.characters.create({
    data: {
      name: 'Marcos el Curandero',
      user_id: student1.id,
      course_id: course1.id, // Programación Web
      group_id: group1.id,    // Asignado a Grupo A
      class_id: healerClass.id,
      experience: 1000,
      gold: 100000,
      energy: 1000,
      health: 100,
      appearance: {
        Hair: 'Brown',
        Eyes: 'Green',
        Skin: 'Light',
      },
    },
  });

  const char2 = await prisma.characters.create({
    data: {
      name: 'Ismael el Guerrero',
      user_id: student2.id,
      course_id: course1.id, // Programación Web
      group_id: group1.id,    // Asignado a Grupo A
      class_id: warriorClass.id,
      experience: 750,
      gold: 850,
      energy: 900,
      health: 100,
    },
  });

  const char3 = await prisma.characters.create({
    data: {
      name: 'Cristian el Elfo',
      user_id: student3.id,
      course_id: course1.id, // Programación Web
      group_id: group1.id,    // Asignado a Grupo A
      class_id: elfClass.id,
      experience: 1200,
      gold: 1100,
      energy: 600,
      health: 100,
    },
  });

  // Personajes del grupo 2 (Base de Datos)
  const char4 = await prisma.characters.create({
    data: {
      name: 'Pedro el Mago',
      user_id: student4.id,
      course_id: course2.id, // Base de Datos
      group_id: group2.id,    // Asignado a Grupo A
      class_id: mageClass.id,
      experience: 650,
      gold: 750,
      energy: 900,
      health: 100,
    },
  });

  const char5 = await prisma.characters.create({
    data: {
      name: 'Tomas el Guerrero',
      user_id: student5.id,
      course_id: course2.id, // Base de Datos
      group_id: group2.id,    // Asignado a Grupo A
      class_id: warriorClass.id,
      experience: 450,
      gold: 520,
      energy: 500,
      health: 100,
    },
  });

  // Personaje del grupo 3 (Algoritmos)
  const char6 = await prisma.characters.create({
    data: {
      name: 'Karen la Elfa',
      user_id: student6.id,
      course_id: course3.id, // Algoritmos
      group_id: group3.id,    // Asignado a Grupo A
      class_id: elfClass.id,
      experience: 2000,
      gold: 1500,
      energy: 600,
      health: 100,
    },
  });

  // Personajes de user1 (inscrito en cursos 4 y 5)
  const char7 = await prisma.characters.create({
    data: {
      name: user1.name + ' - Aventurero IA',
      user_id: user1.id,
      course_id: course4.id, // Inteligencia Artificial
      group_id: group4.id,    // Asignado a Grupo A - IA
      class_id: mageClass.id,
      experience: 1300,
      gold: 800,
      energy: 750,
      health: 100,
    },
  });

  const char8 = await prisma.characters.create({
    data: {
      name: user1.name + ' - Matemático',
      user_id: user1.id,
      course_id: course5.id, // Matemáticas Discretas
      group_id: group5.id,    // Asignado a Grupo A - Matemáticas
      class_id: mageClass.id,
      experience: 640,
      gold: 500,
      energy: 650,
      health: 100,
    },
  });

  console.log('🎯 Creating tasks...');
  const task1 = await prisma.tasks.create({
    data: {
      name: 'Diseño Responsivo',
      description: 'Crear una página web responsive con CSS Grid',
      experience: 100,
      gold: 50,
      health: 0,
      energy: -20,
    },
  });

  const task2 = await prisma.tasks.create({
    data: {
      name: 'Normalización',
      description: 'Normalizar una base de datos hasta 3FN',
      experience: 80,
      gold: 40,
      health: 0,
      energy: -15,
    },
  });

  const task3 = await prisma.tasks.create({
    data: {
      name: 'Redes Neuronales',
      description: 'Implementar una red neuronal básica',
      experience: 150,
      gold: 75,
      health: 0,
      energy: -30,
    },
  });

  const task4 = await prisma.tasks.create({
    data: {
      name: 'Teoría de Grafos',
      description: 'Resolver problemas de grafos con algoritmos',
      experience: 120,
      gold: 60,
      health: 0,
      energy: -25,
    },
  });

  console.log('🎲 Creating random events...');
  
  // Eventos GLOBALES del sistema (is_global = true, sin course_id ni teacher_id)
  await prisma.events.createMany({
    data: [
      {
        name: '🌪️ Terremoto Devastador',
        description: 'Un terremoto de magnitud catastrófica sacude la región. La infraestructura colapsa y todos los estudiantes sufren graves heridas.',
        type: 'disaster',
        rank: 'S',
        health: -10,
        gold: -500,
        energy: -80,
        is_global: true,
        is_active: true,
      },
      {
        name: '🐉 Ataque de Dragón Ancestral',
        description: 'Un dragón legendario emerge de las montañas y ataca la ciudad. Todos pierden salud y oro considerable.',
        type: 'disaster',
        rank: 'A',
        health: -7,
        gold: -300,
        energy: -50,
        is_global: true,
        is_active: true,
      },
      {
        name: '⚡ Tormenta Mágica Intensa',
        description: 'Una tormenta mágica intensa drena la energía de todos los estudiantes.',
        type: 'disaster',
        rank: 'B',
        energy: -60,
        health: -3,
        is_global: true,
        is_active: true,
      },
      {
        name: '🌑 Eclipse Solar Prolongado',
        description: 'Un eclipse solar poco común debilita temporalmente a todos.',
        type: 'disaster',
        rank: 'C',
        energy: -30,
        health: -2,
        is_global: true,
        is_active: true,
      },
      {
        name: '🌧️ Día Lluvioso',
        description: 'Un día lluvioso normal. Todos sienten un poco de cansancio adicional.',
        type: 'neutral',
        rank: 'D',
        energy: -10,
        is_global: true,
        is_active: true,
      },
      {
        name: '💎 Tesoro Legendario Descubierto',
        description: '¡Se descubre un tesoro legendario perdido! Todos reciben riquezas y experiencia increíbles.',
        type: 'fortune',
        rank: 'S',
        gold: 1000,
        experience: 500,
        energy: 100,
        is_global: true,
        is_active: true,
      },
      {
        name: '🎁 Festival Imperial',
        description: 'El emperador celebra un gran festival. Todos reciben generosas recompensas.',
        type: 'fortune',
        rank: 'A',
        gold: 500,
        experience: 300,
        energy: 80,
        is_global: true,
        is_active: true,
      },
      {
        name: '✨ Lluvia de Estrellas',
        description: 'Una hermosa lluvia de estrellas otorga bendiciones a todos.',
        type: 'fortune',
        rank: 'B',
        energy: 50,
        gold: 200,
        experience: 100,
        is_global: true,
        is_active: true,
      },
      {
        name: '🎉 Celebración Local',
        description: 'El pueblo celebra una festividad tradicional. Todos se sienten renovados.',
        type: 'fortune',
        rank: 'C',
        gold: 100,
        energy: 30,
        is_global: true,
        is_active: true,
      },
      {
        name: '☀️ Día Soleado Agradable',
        description: 'Un día soleado perfecto que anima a todos. Solo una descripción para agregar ambiente.',
        type: 'neutral',
        rank: 'D',
        energy: 10,
        is_global: true,
        is_active: true,
      },
    ],
  });

  // Eventos CUSTOM creados por profesores específicos para sus cursos
  console.log('🎨 Creating custom events...');
  
  // Eventos custom de teacher3 para curso1 (Programación Web)
  await prisma.events.create({
    data: {
      name: '💻 Hackathon Exitoso',
      description: 'El equipo ganó el hackathon de programación web. ¡Felicitaciones!',
      type: 'fortune',
      rank: 'A',
      experience: 200,
      gold: 300,
      energy: -20,
      is_global: false,
      is_active: true,
      course_id: course1.id,
      teacher_id: teacher3.id,
    },
  });

  await prisma.events.create({
    data: {
      name: '🐛 Bug Crítico en Producción',
      description: 'Se detectó un bug grave en el código. Todos deben trabajar tiempo extra.',
      type: 'disaster',
      rank: 'B',
      energy: -40,
      gold: -50,
      is_global: false,
      is_active: true,
      course_id: course1.id,
      teacher_id: teacher3.id,
    },
  });

  await prisma.events.create({
    data: {
      name: '🤖 Modelo Entrenado con Éxito',
      description: 'Tu red neuronal alcanzó 99% de precisión. ¡Excelente trabajo!',
      type: 'fortune',
      rank: 'A',
      experience: 250,
      gold: 400,
      energy: 20,
      is_global: false,
      is_active: true,
      course_id: course4.id,
      teacher_id: teacher1.id,
    },
  });

  await prisma.events.create({
    data: {
      name: '📐 Demostración Matemática Perfecta',
      description: 'Resolviste el problema del profesor de manera elegante.',
      type: 'fortune',
      rank: 'B',
      experience: 150,
      gold: 200,
      is_global: false,
      is_active: true,
      course_id: course5.id,
      teacher_id: teacher2.id,
    },
  });

  console.log('✉️ Creating invitations...');
  await prisma.invitations.createMany({
    data: [
      {
        name: 'Invitación Curso Web',
        code: 'WEB-2025-A1',
        used: false,
        course_id: course1.id,
      },
      {
        name: 'Invitación Curso BD',
        code: 'DB-2025-A1',
        used: false,
        course_id: course2.id,
      },
      {
        name: 'Invitación Curso Algo',
        code: 'ALG-2025-A1',
        used: false,
        course_id: course3.id,
      },
      {
        name: 'Invitación Curso IA',
        code: 'IA-2025-A1',
        used: true,
        user_id: user1.id,
        course_id: course4.id,
      },
      {
        name: 'Invitación Curso Math',
        code: 'MATH-2025-A1',
        used: true,
        user_id: user1.id,
        course_id: course5.id,
      },
    ],
  });

  // 13. Crear quizzes tipo Kahoot
  console.log('📝 Creating quizzes...');
  
  // Quizzes para Desarrollo Web (group1) - creados por teacher3
  const quiz1 = await prisma.quizzes.create({
    data: {
      question: '¿Qué significa HTML?',
      answers: JSON.stringify([
        { text: 'HyperText Markup Language', isCorrect: true },
        { text: 'Home Tool Markup Language', isCorrect: false },
        { text: 'Hyperlinks Text Mark Language', isCorrect: false },
        { text: 'High Tech Modern Language', isCorrect: false },
      ]),
      correct_answer_index: 0,
      difficulty: 'easy',
      points: 100,
      time_limit: 30,
      group_id: group1.id,
      course_id: course1.id,      // ⭐ NUEVO
      teacher_id: teacher3.id,     // ⭐ NUEVO
    },
  });

  const quiz2 = await prisma.quizzes.create({
    data: {
      question: '¿Cuál es la forma correcta de crear una función en JavaScript?',
      answers: JSON.stringify([
        { text: 'function myFunc() {}', isCorrect: true },
        { text: 'def myFunc():', isCorrect: false },
        { text: 'func myFunc() {}', isCorrect: false },
        { text: 'function: myFunc() {}', isCorrect: false },
      ]),
      correct_answer_index: 0,
      difficulty: 'medium',
      points: 150,
      time_limit: 45,
      group_id: group1.id,
      course_id: course1.id,      // ⭐ NUEVO
      teacher_id: teacher3.id,     // ⭐ NUEVO
    },
  });

  const quiz3 = await prisma.quizzes.create({
    data: {
      question: '¿Qué método se usa para agregar un elemento al final de un array en JavaScript?',
      answers: JSON.stringify([
        { text: 'push()', isCorrect: true },
        { text: 'append()', isCorrect: false },
        { text: 'add()', isCorrect: false },
        { text: 'insert()', isCorrect: false },
      ]),
      correct_answer_index: 0,
      difficulty: 'easy',
      points: 100,
      time_limit: 30,
      group_id: group1.id,
      course_id: course1.id,      // ⭐ NUEVO
      teacher_id: teacher3.id,     // ⭐ NUEVO
    },
  });

  // Quizzes para Bases de Datos (group2) - creados por teacher3
  const quiz4 = await prisma.quizzes.create({
    data: {
      question: '¿Qué es una clave primaria (Primary Key)?',
      answers: JSON.stringify([
        { text: 'Un identificador único para cada registro en una tabla', isCorrect: true },
        { text: 'Una clave que se usa para encriptar datos', isCorrect: false },
        { text: 'Un índice secundario opcional', isCorrect: false },
        { text: 'Una referencia a otra tabla', isCorrect: false },
      ]),
      correct_answer_index: 0,
      difficulty: 'easy',
      points: 100,
      time_limit: 30,
      group_id: group2.id,
      course_id: course2.id,      // ⭐ NUEVO
      teacher_id: teacher3.id,     // ⭐ NUEVO
    },
  });

  const quiz5 = await prisma.quizzes.create({
    data: {
      question: '¿Qué comando SQL se usa para recuperar datos de una tabla?',
      answers: JSON.stringify([
        { text: 'SELECT', isCorrect: true },
        { text: 'GET', isCorrect: false },
        { text: 'FETCH', isCorrect: false },
        { text: 'RETRIEVE', isCorrect: false },
      ]),
      correct_answer_index: 0,
      difficulty: 'easy',
      points: 100,
      time_limit: 25,
      group_id: group2.id,
      course_id: course2.id,      // ⭐ NUEVO
      teacher_id: teacher3.id,     // ⭐ NUEVO
    },
  });

  const quiz6 = await prisma.quizzes.create({
    data: {
      question: '¿Qué tipo de JOIN devuelve todos los registros cuando hay coincidencia en alguna tabla?',
      answers: JSON.stringify([
        { text: 'FULL OUTER JOIN', isCorrect: true },
        { text: 'INNER JOIN', isCorrect: false },
        { text: 'LEFT JOIN', isCorrect: false },
        { text: 'RIGHT JOIN', isCorrect: false },
      ]),
      correct_answer_index: 0,
      difficulty: 'hard',
      points: 200,
      time_limit: 60,
      group_id: group2.id,
      course_id: course2.id,      // ⭐ NUEVO
      teacher_id: teacher3.id,     // ⭐ NUEVO
    },
  });

  // Quizzes para Algoritmos (group3) - creados por teacher3
  const quiz7 = await prisma.quizzes.create({
    data: {
      question: '¿Cuál es la complejidad temporal del algoritmo de búsqueda binaria?',
      answers: JSON.stringify([
        { text: 'O(log n)', isCorrect: true },
        { text: 'O(n)', isCorrect: false },
        { text: 'O(n²)', isCorrect: false },
        { text: 'O(1)', isCorrect: false },
      ]),
      correct_answer_index: 0,
      difficulty: 'medium',
      points: 150,
      time_limit: 45,
      group_id: group3.id,
      course_id: course3.id,      // ⭐ NUEVO
      teacher_id: teacher3.id,     // ⭐ NUEVO
    },
  });

  const quiz8 = await prisma.quizzes.create({
    data: {
      question: '¿Qué estructura de datos usa el principio LIFO (Last In, First Out)?',
      answers: JSON.stringify([
        { text: 'Stack (Pila)', isCorrect: true },
        { text: 'Queue (Cola)', isCorrect: false },
        { text: 'List (Lista)', isCorrect: false },
        { text: 'Tree (Árbol)', isCorrect: false },
      ]),
      correct_answer_index: 0,
      difficulty: 'easy',
      points: 100,
      time_limit: 30,
      group_id: group3.id,
      course_id: course3.id,      // ⭐ NUEVO
      teacher_id: teacher3.id,     // ⭐ NUEVO
    },
  });

  // Quizzes para IA (group4) - creados por teacher1
  const quiz9 = await prisma.quizzes.create({
    data: {
      question: '¿Qué tipo de aprendizaje automático usa datos etiquetados?',
      answers: JSON.stringify([
        { text: 'Aprendizaje Supervisado', isCorrect: true },
        { text: 'Aprendizaje No Supervisado', isCorrect: false },
        { text: 'Aprendizaje por Refuerzo', isCorrect: false },
        { text: 'Aprendizaje Profundo', isCorrect: false },
      ]),
      correct_answer_index: 0,
      difficulty: 'medium',
      points: 150,
      time_limit: 40,
      group_id: group4.id,
      course_id: course4.id,      // ⭐ NUEVO
      teacher_id: teacher1.id,     // ⭐ NUEVO (diferente profesor)
    },
  });

  const quiz10 = await prisma.quizzes.create({
    data: {
      question: '¿Qué función de activación se usa comúnmente en redes neuronales para clasificación binaria?',
      answers: JSON.stringify([
        { text: 'Sigmoid', isCorrect: true },
        { text: 'ReLU', isCorrect: false },
        { text: 'Tanh', isCorrect: false },
        { text: 'Softmax', isCorrect: false },
      ]),
      correct_answer_index: 0,
      difficulty: 'hard',
      points: 200,
      time_limit: 60,
      group_id: group4.id,
      course_id: course4.id,      // ⭐ NUEVO
      teacher_id: teacher1.id,     // ⭐ NUEVO
    },
  });

  // Quizzes para Matemáticas (group5) - creados por teacher2
  const quiz11 = await prisma.quizzes.create({
    data: {
      question: '¿Cuál es el valor de π (pi) aproximadamente?',
      answers: JSON.stringify([
        { text: '3.14159', isCorrect: true },
        { text: '2.71828', isCorrect: false },
        { text: '1.61803', isCorrect: false },
        { text: '4.66920', isCorrect: false },
      ]),
      correct_answer_index: 0,
      difficulty: 'easy',
      points: 100,
      time_limit: 20,
      group_id: group5.id,
      course_id: course5.id,      // ⭐ NUEVO
      teacher_id: teacher2.id,     // ⭐ NUEVO (diferente profesor)
    },
  });

  const quiz12 = await prisma.quizzes.create({
    data: {
      question: '¿Qué teorema establece la relación entre los lados de un triángulo rectángulo?',
      answers: JSON.stringify([
        { text: 'Teorema de Pitágoras', isCorrect: true },
        { text: 'Teorema de Tales', isCorrect: false },
        { text: 'Teorema de Fermat', isCorrect: false },
        { text: 'Teorema del Seno', isCorrect: false },
      ]),
      correct_answer_index: 0,
      difficulty: 'easy',
      points: 100,
      time_limit: 30,
      group_id: group5.id,
      course_id: course5.id,      // ⭐ NUEVO
      teacher_id: teacher2.id,     // ⭐ NUEVO
    },
  });

  // Crear historial de quizzes para algunos characters
  console.log('📊 Creating quiz history...');
  await prisma.quizzes_history.createMany({
    data: [
      // char1 responde algunos quizzes del grupo 1
      {
        quiz_id: quiz1.id,
        character_id: char1.id,
        selected_answer: 0,
        is_correct: true,
        points_earned: 120,
        time_taken: 15,
        is_on_quest: false,
      },
      {
        quiz_id: quiz2.id,
        character_id: char1.id,
        selected_answer: 0,
        is_correct: true,
        points_earned: 180,
        time_taken: 30,
        is_on_quest: true,
      },
      // char2 responde quiz1
      {
        quiz_id: quiz1.id,
        character_id: char2.id,
        selected_answer: 1,
        is_correct: false,
        points_earned: 0,
        time_taken: 28,
        is_on_quest: false,
      },
      // char4 responde quizzes del grupo 2
      {
        quiz_id: quiz4.id,
        character_id: char4.id,
        selected_answer: 0,
        is_correct: true,
        points_earned: 110,
        time_taken: 20,
        is_on_quest: false,
      },
      {
        quiz_id: quiz5.id,
        character_id: char4.id,
        selected_answer: 0,
        is_correct: true,
        points_earned: 125,
        time_taken: 18,
        is_on_quest: false,
      },
      // char7 responde quizzes del grupo 4 (IA)
      {
        quiz_id: quiz9.id,
        character_id: char7.id,
        selected_answer: 0,
        is_correct: true,
        points_earned: 175,
        time_taken: 25,
        is_on_quest: true,
      },
    ],
  });

  console.log('🎯 Creating task assignments (teachers_courses_tasks)...');
  await prisma.teachers_courses_tasks.createMany({
    data: [
      // Asignar task1 a curso1 (Programación Web - teacher3)
      { teacher_course_id: tc1.id, task_id: task1.id },
      // Asignar task2 a curso2 (Base de Datos - teacher3)
      { teacher_course_id: tc2.id, task_id: task2.id },
      // Asignar task3 a curso4 (IA - teacher1)
      { teacher_course_id: tc4.id, task_id: task3.id },
      // Asignar task4 a curso5 (Matemáticas - teacher2)
      { teacher_course_id: tc5.id, task_id: task4.id },
    ],
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Users: ${await prisma.users.count()}`);
  console.log(`- Teachers: ${await prisma.teachers.count()}`);
  console.log(`- Teachers-Courses: ${await prisma.teachers_courses.count()}`);
  console.log(`- Courses: ${await prisma.courses.count()}`);
  console.log(`- Groups: ${await prisma.groups.count()}`);
  console.log(`- Characters: ${await prisma.characters.count()}`);
  console.log(`- Tasks: ${await prisma.tasks.count()}`);
  console.log(`- Random Events: ${await prisma.events.count()}`);
  console.log(`- Abilities: ${await prisma.abilities.count()}`);
  console.log(`- Classes: ${await prisma.classes.count()}`);
  console.log(`- Invitations: ${await prisma.invitations.count()}`);
  console.log(`- Inscriptions: ${await prisma.inscriptions.count()}`);
  console.log(`- Task Assignments: ${await prisma.teachers_courses_tasks.count()}`);
  console.log(`- Quizzes: ${await prisma.quizzes.count()}`);
  console.log(`- Quiz History: ${await prisma.quizzes_history.count()}`);
  console.log('\n🔐 Test credentials:');
  console.log('Email: juan@example.com | Password: password123');
  console.log('Email: garcia@example.com | Password: password123');
  console.log('Email: martinez@example.com | Password: password123');
  console.log('\n👨‍🎓 Student credentials:');
  console.log('Email: marcos.chocce@example.com | Password: password123');
  console.log('Email: ismael.torres@example.com | Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
