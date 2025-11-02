import { PrismaClient } from '../lib/generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Limpiar datos existentes (opcional - comentar si no quieres borrar)
  console.log('🧹 Cleaning existing data...');
  await prisma.characters_abilities.deleteMany();
  await prisma.characters_events.deleteMany();
  await prisma.teachers_courses_events.deleteMany();
  await prisma.quizzes_history.deleteMany();
  await prisma.characters.deleteMany();
  await prisma.members.deleteMany();
  await prisma.quizzes.deleteMany();
  await prisma.groups.deleteMany();
  await prisma.invitations.deleteMany();
  await prisma.inscriptions.deleteMany();
  await prisma.teachers_courses.deleteMany();
  await prisma.courses.deleteMany();
  await prisma.teachers.deleteMany();
  await prisma.sessions.deleteMany();
  await prisma.users.deleteMany();
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

  // 4. Crear profesores
  console.log('👨‍🏫 Creating teachers...');
  const teacher1 = await prisma.teachers.create({
    data: {
      name: 'Dr. García',
      internal_id: 'T001',
      school_id: 'SCH001',
    },
  });

  const teacher2 = await prisma.teachers.create({
    data: {
      name: 'Prof. Martínez',
      internal_id: 'T002',
      school_id: 'SCH001',
    },
  });

  const teacher3 = await prisma.teachers.create({
    data: {
      name: 'Dra. Rodríguez',
      internal_id: 'T003',
      school_id: 'SCH001',
    },
  });

  // 5. Crear cursos
  console.log('📚 Creating courses...');
  const course1 = await prisma.courses.create({
    data: {
      name: 'Programación Web',
      description: 'Aprende desarrollo web moderno con React y Next.js',
      teacher_id: teacher3.id,
    },
  });

  const course2 = await prisma.courses.create({
    data: {
      name: 'Base de Datos',
      description: 'Fundamentos de bases de datos relacionales y SQL',
      teacher_id: teacher3.id,
    },
  });

  const course3 = await prisma.courses.create({
    data: {
      name: 'Algoritmos',
      description: 'Estructuras de datos y algoritmos fundamentales',
      teacher_id: teacher3.id,
    },
  });

  const course4 = await prisma.courses.create({
    data: {
      name: 'Inteligencia Artificial',
      description: 'Introducción a IA y Machine Learning',
      teacher_id: teacher1.id,
    },
  });

  const course5 = await prisma.courses.create({
    data: {
      name: 'Matemáticas Discretas',
      description: 'Teoría de grafos, lógica y combinatoria',
      teacher_id: teacher2.id,
    },
  });

  // 6. Crear relación teachers_courses
  console.log('🔗 Creating teacher-course relationships...');
  await prisma.teachers_courses.createMany({
    data: [
      { teacher_id: teacher3.id, course_id: course1.id },
      { teacher_id: teacher3.id, course_id: course2.id },
      { teacher_id: teacher3.id, course_id: course3.id },
      { teacher_id: teacher1.id, course_id: course4.id },
      { teacher_id: teacher2.id, course_id: course5.id },
    ],
  });

  // 7. Crear inscripciones (user1 inscrito en los cursos)
  console.log('📝 Creating course enrollments...');
  await prisma.inscriptions.createMany({
    data: [
      // user1 es estudiante en cursos 4 y 5
      { user_id: user1.id, course_id: course4.id },
      { user_id: user1.id, course_id: course5.id },
      // user2 es estudiante en curso 1
      { user_id: user2.id, course_id: course1.id },
      { user_id: user2.id, course_id: course4.id },
      // user3 es estudiante en cursos 2 y 3
      { user_id: user3.id, course_id: course2.id },
      { user_id: user3.id, course_id: course3.id },
      // teacherUser es docente en cursos 1, 2, 3
      { user_id: teacherUser.id, course_id: course1.id },
      { user_id: teacherUser.id, course_id: course2.id },
      { user_id: teacherUser.id, course_id: course3.id },
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

  // 9. Crear miembros (estudiantes en grupos)
  console.log('🎮 Creating group members...');
  const member1 = await prisma.members.create({
    data: {
      name: 'Chocce, Marcos',
      experience: 1000,
      gold: 100000,
      energy: 1000,
      group_id: group1.id,
    },
  });

  const member2 = await prisma.members.create({
    data: {
      name: 'Torres, Ismael',
      experience: 750,
      gold: 850,
      energy: 900,
      group_id: group1.id,
    },
  });

  const member3 = await prisma.members.create({
    data: {
      name: 'Rojas, Cristian',
      experience: 1200,
      gold: 1100,
      energy: 600,
      group_id: group1.id,
    },
  });

  const member4 = await prisma.members.create({
    data: {
      name: 'Jimenez, Pedro',
      experience: 650,
      gold: 750,
      energy: 900,
      group_id: group2.id,
    },
  });

  const member5 = await prisma.members.create({
    data: {
      name: 'Lopez, Tomas',
      experience: 450,
      gold: 520,
      energy: 500,
      group_id: group2.id,
    },
  });

  const member6 = await prisma.members.create({
    data: {
      name: 'Sanches, Karen',
      experience: 2000,
      gold: 1500,
      energy: 600,
      group_id: group3.id,
    },
  });

  // Miembros para grupos 4 y 5 (cursos de user1)
  const member7 = await prisma.members.create({
    data: {
      name: user1.name,
      experience: 1300,
      gold: 800,
      energy: 750,
      group_id: group4.id, // IA
    },
  });

  const member8 = await prisma.members.create({
    data: {
      name: user1.name,
      experience: 640,
      gold: 500,
      energy: 650,
      group_id: group5.id, // Matemáticas
    },
  });

  // 10. Crear personajes
  console.log('🦸 Creating characters...');
  await prisma.characters.createMany({
    data: [
      {
        name: 'Marcos el Curandero',
        experience: 1000,
        gold: 100000,
        energy: 1000,
        character_id: member1.id,
        class_id: healerClass.id,
      },
      {
        name: 'Ismael el Guerrero',
        experience: 750,
        gold: 850,
        energy: 900,
        character_id: member2.id,
        class_id: warriorClass.id,
      },
      {
        name: 'Cristian el Elfo',
        experience: 1200,
        gold: 1100,
        energy: 600,
        character_id: member3.id,
        class_id: elfClass.id,
      },
      {
        name: 'Pedro el Mago',
        experience: 650,
        gold: 750,
        energy: 900,
        character_id: member4.id,
        class_id: mageClass.id,
      },
      {
        name: 'Tomas el Guerrero',
        experience: 450,
        gold: 520,
        energy: 500,
        character_id: member5.id,
        class_id: warriorClass.id,
      },
      {
        name: 'Karen la Elfa',
        experience: 2000,
        gold: 1500,
        energy: 600,
        character_id: member6.id,
        class_id: elfClass.id,
      },
      {
        name: user1.name + ' - Aventurero IA',
        experience: 1300,
        gold: 800,
        energy: 750,
        character_id: member7.id,
        class_id: mageClass.id,
      },
      {
        name: user1.name + ' - Matemático',
        experience: 640,
        gold: 500,
        energy: 650,
        character_id: member8.id,
        class_id: mageClass.id,
      },
    ],
  });

  // 11. Crear eventos (misiones/tareas)
  console.log('🎯 Creating events/quests...');
  const event1 = await prisma.events.create({
    data: {
      name: 'Diseño Responsivo',
      description: 'Crear una página web responsive con CSS Grid',
      experience: 100,
      gold: 50,
      health: 0,
      energy: -20,
    },
  });

  const event2 = await prisma.events.create({
    data: {
      name: 'Normalización',
      description: 'Normalizar una base de datos hasta 3FN',
      experience: 80,
      gold: 40,
      health: 0,
      energy: -15,
    },
  });

  const event3 = await prisma.events.create({
    data: {
      name: 'Redes Neuronales',
      description: 'Implementar una red neuronal básica',
      experience: 150,
      gold: 75,
      health: 0,
      energy: -30,
    },
  });

  const event4 = await prisma.events.create({
    data: {
      name: 'Teoría de Grafos',
      description: 'Resolver problemas de grafos con algoritmos',
      experience: 120,
      gold: 60,
      health: 0,
      energy: -25,
    },
  });

  // 12. Crear invitaciones
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

  // 13. Crear quizzes
  console.log('📝 Creating quizzes...');
  await prisma.quizzes.createMany({
    data: [
      {
        question: '¿Qué es HTML?',
        answers: JSON.stringify([
          { text: 'HyperText Markup Language', correct: true },
          { text: 'Home Tool Markup Language', correct: false },
          { text: 'Hyperlinks Text Mark Language', correct: false },
        ]),
      },
      {
        question: '¿Qué es una clave primaria?',
        answers: JSON.stringify([
          { text: 'Un identificador único para cada registro', correct: true },
          { text: 'Una clave foránea', correct: false },
          { text: 'Un índice secundario', correct: false },
        ]),
      },
    ],
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Users: ${await prisma.users.count()}`);
  console.log(`- Teachers: ${await prisma.teachers.count()}`);
  console.log(`- Courses: ${await prisma.courses.count()}`);
  console.log(`- Groups: ${await prisma.groups.count()}`);
  console.log(`- Members: ${await prisma.members.count()}`);
  console.log(`- Characters: ${await prisma.characters.count()}`);
  console.log(`- Events: ${await prisma.events.count()}`);
  console.log(`- Abilities: ${await prisma.abilities.count()}`);
  console.log(`- Classes: ${await prisma.classes.count()}`);
  console.log(`- Invitations: ${await prisma.invitations.count()}`);
  console.log(`- Inscriptions: ${await prisma.inscriptions.count()}`);
  console.log('\n🔐 Test credentials:');
  console.log('Email: juan@example.com | Password: password123');
  console.log('Email: garcia@example.com | Password: password123');
  console.log('Email: martinez@example.com | Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
