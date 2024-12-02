import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    console.log('Starting database reset...');
    
    // Delete all records from all tables
    await prisma.rating.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.course.deleteMany({});
    await prisma.professorPage.deleteMany({});
    await prisma.profile.deleteMany({});
    await prisma.user_Credentials.deleteMany({});
    await prisma.major.deleteMany({});
    await prisma.subject.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.file.deleteMany({});
    
    // Reset all sequences
    console.log('Resetting ID sequences...');
    await prisma.$executeRaw`ALTER SEQUENCE "Rating_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "Comment_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "Course_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "ProfessorPage_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "Profile_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "User_Credentials_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "Major_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "Subject_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 1;`;
    await prisma.$executeRaw`ALTER SEQUENCE "File_id_seq" RESTART WITH 1;`;
    
    console.log('Database reset and sequences reset completed successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if this script is executed directly
if (require.main === module) {
  resetDatabase();
}

export { resetDatabase };
