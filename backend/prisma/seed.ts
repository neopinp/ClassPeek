import { PrismaClient, UserType } from '@prisma/client';
import bcrypt from 'bcrypt';

/**
 * This seed file populates the database with initial test data.
 * It creates:
 * - One professor teaching multiple courses
 * - Two subjects (CS and Math)
 * - Two majors
 * - Multiple courses with prerequisites and cross-listed requirements
 */

const prisma = new PrismaClient();

async function seed() {
  // ===== PROFESSOR CREATION =====
  const profMary = await prisma.user.create({
    data: {
      name: 'Mary Johnson',
      user_type: UserType.PROFESSOR,  // Using enum to ensure type safety
      dob: new Date('1980-03-20'),
      // Nested creation of credentials - automatically links to the user
      credentials: {
        create: {
          school_email: 'mary.johnson@university.edu',
          // Password is hashed for security
          password: await bcrypt.hash('password123', 10)
        }
      },
      // Nested creation of professor page - contains teaching-specific information
      professor_page: {
        create: {
          bio: 'PhD in Mathematics, specializing in Abstract Algebra',
          office_hours: 'TR 1-3PM',
          office_location: 'HC3020'  // Using standardized room number format
        }
      }
    }
  });

  const profJohn = await prisma.user.create({
    data: {
      name: 'John Smith',
      user_type: UserType.PROFESSOR,
      dob: new Date('1975-05-15'),
      credentials: {
        create: {
          school_email: 'john.smith@university.edu',
          password: await bcrypt.hash('password123', 10)
        }
      },
      professor_page: {
        create: {
          bio: 'PhD in Computer Science with focus on algorithms',
          office_hours: 'MWF 2-4PM',
          office_location: 'HC4050'
        }
      }
    }
  });

  // ===== SUBJECT CREATION =====
  // Creating two distinct subjects that can share courses
  // This allows for interdisciplinary teaching and cross-listed courses
  const cs = await prisma.subject.create({
    data: {
      name: 'Computer Science',
      code: 'CS',     // Department code used in course numbering
      description: 'Study of computation and information'
    }
  });

  const math = await prisma.subject.create({
    data: {
      name: 'Mathematics',
      code: 'MATH',
      description: 'Study of numbers, quantities, and shapes'
    }
  });

  // ===== MAJOR CREATION =====
  // Creating majors that can share required courses
  // This reflects how courses can be requirements for multiple programs
  const csMajor = await prisma.major.create({
    data: {
      name: 'Computer Science',
      description: 'Bachelor of Science in Computer Science'
    }
  });

  const mathMajor = await prisma.major.create({
    data: {
      name: 'Mathematics',
      description: 'Bachelor of Science in Mathematics'
    }
  });

  // ===== COURSE CREATION =====
  // Course codes follow the format: SUBJECT + NUMBER + SECTION
  // Example: CS101-01 means:
  // - CS: Computer Science
  // - 101: Course number (usually indicating level)
  // - 01: Section number
  
  // Creating intro CS course
  const cs101 = await prisma.course.create({
    data: {
      course_code: 'CS101-01',
      title: 'Introduction to Programming',
      description: 'Basic concepts of programming using Python',
      credits: 3,
      professor_id: profJohn.id,
      subject_id: cs.id,
      majors: {
        connect: [{ id: csMajor.id }]  // Required for CS majors only
      }
    }
  });

  // Advanced CS course with prerequisite
  const cs201 = await prisma.course.create({
    data: {
      course_code: 'CS201-01',
      title: 'Data Structures',
      description: 'Advanced programming concepts and data structures',
      credits: 4,
      professor_id: profJohn.id,
      subject_id: cs.id,
      majors: {
        connect: [{ id: csMajor.id }]
      },
      prerequisites: {
        connect: [{ id: cs101.id }]  // Requires CS101
      }
    }
  });

  // Multiple sections of the same course (Calculus I)
  // This demonstrates how the same course can have different sections
  const math101Section1 = await prisma.course.create({
    data: {
      course_code: 'MATH101-01',
      title: 'Calculus I (Section 01)',
      description: 'Introduction to differential calculus - Morning Section',
      credits: 4,
      professor_id: profMary.id,
      subject_id: math.id,
      majors: {
        // This course is required for both CS and Math majors
        connect: [{ id: mathMajor.id }, { id: csMajor.id }]
      }
    }
  });

  const math101Section2 = await prisma.course.create({
    data: {
      course_code: 'MATH101-02',
      title: 'Calculus I (Section 02)',
      description: 'Introduction to differential calculus - Afternoon Section',
      credits: 4,
      professor_id: profMary.id,
      subject_id: math.id,
      majors: {
        connect: [{ id: mathMajor.id }, { id: csMajor.id }]
      }
    }
  });

  // Advanced math course with multiple prerequisites
  // Shows how a course can require any one of multiple prerequisites
  const math201 = await prisma.course.create({
    data: {
      course_code: 'MATH201-01',
      title: 'Calculus II',
      description: 'Introduction to integral calculus',
      credits: 4,
      professor_id: profMary.id,
      subject_id: math.id,
      majors: {
        connect: [{ id: mathMajor.id }, { id: csMajor.id }]
      },
      prerequisites: {
        // Student must complete either section of MATH101
        connect: [{ id: math101Section1.id }, { id: math101Section2.id }]
      }
    }
  });
  console.log("Successfully seeded database with test data.")
}

// Error handling for the seeding process
seed()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();  // Clean up database connection
  });
  