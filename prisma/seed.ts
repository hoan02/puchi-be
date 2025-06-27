import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { clerkId: 'user_2sample1' },
    update: {},
    create: {
      clerkId: 'user_2sample1',
      email: 'user1@example.com',
      firstName: 'John',
      lastName: 'Doe',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { clerkId: 'user_2sample2' },
    update: {},
    create: {
      clerkId: 'user_2sample2',
      email: 'user2@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
    },
  });

  console.log('✅ Users created:', { user1: user1.id, user2: user2.id });

  // Create sample lessons
  const lesson1 = await prisma.lesson.upsert({
    where: { id: 'lesson_1' },
    update: {},
    create: {
      id: 'lesson_1',
      title: 'Chào hỏi cơ bản',
      description: 'Học cách chào hỏi trong tiếng Việt',
      durationMinutes: 15,
      createdBy: user1.clerkId,
    },
  });

  const lesson2 = await prisma.lesson.upsert({
    where: { id: 'lesson_2' },
    update: {},
    create: {
      id: 'lesson_2',
      title: 'Số đếm từ 1-10',
      description: 'Học đếm số từ 1 đến 10',
      durationMinutes: 20,
      createdBy: user1.clerkId,
    },
  });

  const lesson3 = await prisma.lesson.upsert({
    where: { id: 'lesson_3' },
    update: {},
    create: {
      id: 'lesson_3',
      title: 'Màu sắc',
      description: 'Học tên các màu sắc cơ bản',
      durationMinutes: 18,
      createdBy: user2.clerkId,
    },
  });

  console.log('✅ Lessons created:', { lesson1: lesson1.id, lesson2: lesson2.id, lesson3: lesson3.id });

  // Create sample user progress
  const progress1 = await prisma.userProgress.upsert({
    where: { id: 'progress_1' },
    update: {},
    create: {
      id: 'progress_1',
      userId: user1.clerkId,
      lessonId: lesson1.id,
      progress: 75,
      completed: false,
    },
  });

  const progress2 = await prisma.userProgress.upsert({
    where: { id: 'progress_2' },
    update: {},
    create: {
      id: 'progress_2',
      userId: user1.clerkId,
      lessonId: lesson2.id,
      progress: 100,
      completed: true,
    },
  });

  const progress3 = await prisma.userProgress.upsert({
    where: { id: 'progress_3' },
    update: {},
    create: {
      id: 'progress_3',
      userId: user2.clerkId,
      lessonId: lesson3.id,
      progress: 50,
      completed: false,
    },
  });

  console.log('✅ User progress created:', {
    progress1: progress1.id,
    progress2: progress2.id,
    progress3: progress3.id
  });

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 