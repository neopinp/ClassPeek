import { PrismaClient, UserType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seed() {
  const testUsers = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Admin',
        user_type: UserType.ADMIN,
        dob: new Date('1990-01-01'),
        credentials: {
          create: {
            school_email: 'admin@university.edu',
            password: await bcrypt.hash('password123', 10)
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        name: 'John Doe',
        user_type: UserType.STUDENT,
        dob: new Date('2000-01-01'),
        credentials: {
          create: {
            school_email: 'john.doe@university.edu',
            password: await bcrypt.hash('password123', 10)
          }
        },
        profile: {
          create: {
            blurb: 'Math Major',
            description: 'Likes math. Dislikes matrices'
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        name: 'Jane Doe',
        user_type: UserType.STUDENT,
        dob: new Date('2001-05-15'),
        credentials: {
          create: {
            school_email: 'jane.doe@university.edu',
            password: await bcrypt.hash('password123', 10)
          }
        },
        profile: {
          create: {
            blurb: 'Computer Science Major',
            description: 'Passionate about software development and artificial intelligence.'
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        name: 'Bob Smith',
        user_type: UserType.STUDENT,
        dob: new Date('2000-08-22'),
        credentials: {
          create: {
            school_email: 'bob.smith@university.edu',
            password: await bcrypt.hash('password123', 10)
          }
        },
        profile: {
          create: {
            blurb: 'Mathematics Major',
            description: 'Interested in pure mathematics and theoretical computer science.'
          }
        }
      }
    })
  ]);

 // ===== PROFESSORS =====
 const professorData = [
  {
    name: 'Mary Johnson',
    email: 'mary.johnson@university.edu',
    blurb: 'Dedicated to making abstract mathematics accessible to students.',
    dob: new Date('1980-03-20'),
    bio: 'PhD in Mathematics, specializing in Abstract Algebra',
    officeHours: 'TR 1-3PM',
    officeLocation: 'HC3020'
  },
  {
    name: 'John Smith',
    email: 'john.smith@university.edu',
    blurb: 'Passionate about teaching algorithms and data-driven problem-solving.',
    dob: new Date('1975-05-15'),
    bio: 'PhD in Computer Science with focus on algorithms',
    officeHours: 'MWF 2-4PM',
    officeLocation: 'HC4050'
  },
  {
    name: 'Sarah Chen',
    email: 'sarah.chen@university.edu',
    blurb: 'Inspiring students to explore quantum physics with hands-on research.',
    dob: new Date('1982-08-10'),
    bio: 'PhD in Physics, research focus on Quantum Computing',
    officeHours: 'MW 10AM-12PM',
    officeLocation: 'SC2010'
  },
  {
    name: 'Michael Brown',
    email: 'michael.brown@university.edu',
    blurb: 'Bringing organic chemistry to life with real-world applications',
    dob: new Date('1978-11-25'),
    bio: 'PhD in Chemistry, specializing in Organic Chemistry',
    officeHours: 'TR 9-11AM',
    officeLocation: 'SC1050'
  },
  {
    name: 'Emily Taylor',
    email: 'emily.taylor@university.edu',
    blurb: 'Engaging students with the wonders of genetics and biology.',
    dob: new Date('1983-04-30'),
    bio: 'PhD in Biology, research in Genetics',
    officeHours: 'MWF 1-3PM',
    officeLocation: 'SC3030'
  },
  {
    name: 'David Wilson',
    email: 'david.wilson@university.edu',
    blurb: 'Engaging students with the wonders of genetics and biology.',
    dob: new Date('1977-09-05'),
    bio: 'PhD in Computer Science, specializing in Operating Systems and Computer Architecture',
    officeHours: 'MW 3-5PM',
    officeLocation: 'HC4070'
  }
];

const professors = await Promise.all(
  professorData.map(async (prof) => {
    // Create the user first
    const user = await prisma.user.create({
      data: {
        name: prof.name,
        user_type: UserType.PROFESSOR,
        dob: prof.dob,
        profile: {
          create: {
            blurb: prof.blurb,
          }
        },
        credentials: {
          create: {
            school_email: prof.email,
            password: await bcrypt.hash('password123', 10)
          }
        },
      },
    });

    // Create the professor page separately and explicitly connect it
    const professorPage = await prisma.professorPage.create({
      data: {
        bio: prof.bio,
        office_hours: prof.officeHours,
        office_location: prof.officeLocation,
        professor: {
          connect: { id: user.id }
        }
      },
    });

    // Return both for reference
    return { user, professorPage };
  })
);

  // ===== SUBJECTS =====
  const subjects = await Promise.all([
    prisma.subject.create({
      data: {
        name: 'Computer Science',
        code: 'CS',
        description: 'Study of computation and information'
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Mathematics',
        code: 'MATH',
        description: 'Study of numbers, quantities, and shapes'
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Physics',
        code: 'PHYS',
        description: 'Study of matter, energy, and their interactions'
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Chemistry',
        code: 'CHEM',
        description: 'Study of substances, their properties, and reactions'
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Biology',
        code: 'BIO',
        description: 'Study of living organisms and their interactions'
      }
    })
  ]);

  // ===== MAJORS =====
  const majors = await Promise.all([
    prisma.major.create({
      data: {
        name: 'Computer Science',
        description: 'Bachelor of Science focusing on software development, algorithms, and computing systems. Prepares students for careers in software engineering, system architecture, and technology innovation.'
      }
    }),
    prisma.major.create({
      data: {
        name: 'Applied Mathematics',
        description: 'Bachelor of Science emphasizing practical applications of mathematical concepts in data science, financial modeling, and computational methods. Prepares students for careers in data analytics, quantitative research, and financial engineering.'
      }
    }),
    prisma.major.create({
      data: {
        name: 'Applied Physics',
        description: 'Bachelor of Science concentrating on practical applications of physics in engineering, technology, and research. Prepares students for careers in engineering physics, research and development, and technological innovation.'
      }
    }),
    prisma.major.create({
      data: {
        name: 'Applied Chemistry',
        description: 'Bachelor of Science focusing on industrial applications of chemistry in pharmaceuticals, materials science, and environmental studies. Prepares students for careers in pharmaceutical research, materials development, and environmental consulting.'
      }
    }),
    prisma.major.create({
      data: {
        name: 'Applied Biology',
        description: 'Bachelor of Science emphasizing practical applications of biology in biotechnology, healthcare, and environmental management. Prepares students for careers in biotechnology, healthcare research, and environmental conservation.'
      }
    })
  ]);

  // For easier reference in course creation
  const [cs, math, physics, chemistry, biology] = subjects;
  // Updated professor references - since professors now has both user and professorPage
  const profMary = professors[0].user;
  const profJohn = professors[1].user;
  const profSarah = professors[2].user;
  const profMichael = professors[3].user;
  const profEmily = professors[4].user;
  const profDavid = professors[5].user;
  
  const [csMajor, mathMajor, physicsMajor, chemistryMajor, bioMajor] = majors;

  // ===== COURSES =====
  // CS Basic Courses (100 level)
  const csBasicCourses = await Promise.all([
    prisma.course.create({
      data: {
        course_code: 'CS101-01',
        title: 'Introduction to Programming',
        description: 'Basic concepts of programming using Python',
        credits: 3,
        professor_id: profJohn.id,
        subject_id: cs.id,
        majors: { connect: [{ id: csMajor.id }] }
      }
    }),
    prisma.course.create({
      data: {
        course_code: 'CS101-02',
        title: 'Introduction to Programming',
        description: 'Basic concepts of programming using Python - Afternoon Section',
        credits: 3,
        professor_id: profJohn.id,
        subject_id: cs.id,
        majors: { connect: [{ id: csMajor.id }] }
      }
    })
  ]);

  // Math Basic Courses (100 level)
  const mathBasicCourses = await Promise.all([
    prisma.course.create({
      data: {
        course_code: 'MATH101-01',
        title: 'Calculus I',
        description: 'Introduction to differential calculus - Morning Section',
        credits: 4,
        professor_id: profMary.id,
        subject_id: math.id,
        majors: { connect: [{ id: mathMajor.id }] }
      }
    }),
    prisma.course.create({
      data: {
        course_code: 'MATH101-02',
        title: 'Calculus I',
        description: 'Introduction to differential calculus - Afternoon Section',
        credits: 4,
        professor_id: profMary.id,
        subject_id: math.id,
        majors: { connect: [{ id: mathMajor.id }] }
      }
    })
  ]);

  // Basic Science Courses (100 level)
  const [phys101, chem101, bio101] = await Promise.all([
    // Physics 101
    prisma.course.create({
      data: {
        course_code: 'PHYS101-01',
        title: 'General Physics I',
        description: 'Introduction to mechanics and thermodynamics',
        credits: 4,
        professor_id: profSarah.id,
        subject_id: physics.id,
        majors: { connect: [{ id: physicsMajor.id }] }
      }
    }),
    // Chemistry 101
    prisma.course.create({
      data: {
        course_code: 'CHEM101-01',
        title: 'General Chemistry I',
        description: 'Basic principles of chemistry',
        credits: 4,
        professor_id: profMichael.id,
        subject_id: chemistry.id,
        majors: { connect: [{ id: chemistryMajor.id }] }
      }
    }),
    // Biology 101
    prisma.course.create({
      data: {
        course_code: 'BIO101-01',
        title: 'Introduction to Biology',
        description: 'Fundamentals of biological sciences',
        credits: 4,
        professor_id: profEmily.id,
        subject_id: biology.id,
        majors: { connect: [{ id: bioMajor.id }] }
      }
    })
  ]);

  // CS Intermediate Courses (200 level)
  const cs200Courses = await Promise.all([
    prisma.course.create({
      data: {
        course_code: 'CS201-01',
        title: 'Data Structures',
        description: 'Advanced programming concepts and data structures',
        credits: 4,
        professor_id: profJohn.id,
        subject_id: cs.id,
        majors: { connect: [{ id: csMajor.id }] },
        prerequisites: { connect: csBasicCourses.map(c => ({ id: c.id })) }
      }
    }),
    prisma.course.create({
      data: {
        course_code: 'CS210-01',
        title: 'Object-Oriented Programming',
        description: 'Advanced programming paradigms using Java and C++',
        credits: 4,
        professor_id: profJohn.id,
        subject_id: cs.id,
        majors: { connect: [{ id: csMajor.id }] },
        prerequisites: { connect: [{ id: csBasicCourses[0].id }] }
      }
    }),
    prisma.course.create({
      data: {
        course_code: 'CS220-01',
        title: 'Database Systems',
        description: 'Introduction to database design and SQL',
        credits: 3,
        professor_id: profJohn.id,
        subject_id: cs.id,
        majors: { connect: [{ id: csMajor.id }] },
        prerequisites: { connect: [{ id: csBasicCourses[0].id }] }
      }
    }),
    prisma.course.create({
      data: {
        course_code: 'CS230-01',
        title: 'Web Development',
        description: 'Front-end and back-end web development',
        credits: 3,
        professor_id: profSarah.id,
        subject_id: cs.id,
        majors: { connect: [{ id: csMajor.id }] },
        prerequisites: { connect: [{ id: csBasicCourses[0].id }] }
      }
    })
  ]);

  // Advanced CS Courses (300 level)
  await Promise.all([
    prisma.course.create({
      data: {
        course_code: 'CS301-01',
        title: 'Algorithms',
        description: 'Design and analysis of algorithms',
        credits: 4,
        professor_id: profJohn.id,
        subject_id: cs.id,
        majors: { connect: [{ id: csMajor.id }] },
        prerequisites: { connect: [{ id: cs200Courses[0].id }] } // Requires Data Structures
      }
    }),
    prisma.course.create({
      data: {
        course_code: 'CS310-01',
        title: 'Operating Systems',
        description: 'Process management, memory management, and file systems',
        credits: 4,
        professor_id: profDavid.id,
        subject_id: cs.id,
        majors: { connect: [{ id: csMajor.id }] },
        prerequisites: { connect: [{ id: cs200Courses[0].id }] } // Requires Data Structures
      }
    }),
    prisma.course.create({
      data: {
        course_code: 'CS320-01',
        title: 'Computer Organization and Architecture',
        description: 'Computer hardware organization and architectural principles',
        credits: 4,
        professor_id: profDavid.id,
        subject_id: cs.id,
        majors: { connect: [{ id: csMajor.id }] },
        prerequisites: { connect: [{ id: cs200Courses[0].id }] } // Requires Data Structures
      }
    })
  ]);

  // Math and Science Intermediate/Advanced Courses (200 level)
  await Promise.all([
    // Math 200s
    prisma.course.create({
      data: {
        course_code: 'MATH201-01',
        title: 'Calculus II',
        description: 'Introduction to integral calculus',
        credits: 4,
        professor_id: profMary.id,
        subject_id: math.id,
        majors: { connect: [{ id: mathMajor.id }] },
        prerequisites: { connect: mathBasicCourses.map(c => ({ id: c.id })) }
      }
    }),
    prisma.course.create({
      data: {
        course_code: 'MATH210-01',
        title: 'Linear Algebra',
        description: 'Vector spaces, matrices, and linear transformations',
        credits: 3,
        professor_id: profMary.id,
        subject_id: math.id,
        majors: { connect: [{ id: mathMajor.id }] },
        prerequisites: { connect: mathBasicCourses.map(c => ({ id: c.id })) }
      }
    }),
    prisma.course.create({
      data: {
        course_code: 'MATH220-01',
        title: 'Discrete Mathematics',
        description: 'Logic, sets, relations, and graph theory',
        credits: 3,
        professor_id: profMary.id,
        subject_id: math.id,
        majors: { connect: [{ id: mathMajor.id }] },
        prerequisites: { connect: mathBasicCourses.map(c => ({ id: c.id })) }
      }
    }),

    // Physics 200s
    prisma.course.create({
      data: {
        course_code: 'PHYS201-01',
        title: 'General Physics II',
        description: 'Electricity, magnetism, and optics',
        credits: 4,
        professor_id: profSarah.id,
        subject_id: physics.id,
        majors: { connect: [{ id: physicsMajor.id }] },
        prerequisites: { connect: [{ id: phys101.id }] }
      }
    }),
    prisma.course.create({
      data: {
        course_code: 'PHYS210-01',
        title: 'Modern Physics',
        description: 'Introduction to quantum mechanics and relativity',
        credits: 3,
        professor_id: profSarah.id,
        subject_id: physics.id,
        majors: { connect: [{ id: physicsMajor.id }] },
        prerequisites: { connect: [{ id: phys101.id }] }
      }
    }),

    // Chemistry 200s
    prisma.course.create({
      data: {
        course_code: 'CHEM201-01',
        title: 'General Chemistry II',
        description: 'Advanced principles of chemistry',
        credits: 4,
        professor_id: profMichael.id,
        subject_id: chemistry.id,
        majors: { connect: [{ id: chemistryMajor.id }] },
        prerequisites: { connect: [{ id: chem101.id }] }
      }
    }),
    prisma.course.create({
      data: {
        course_code: 'CHEM210-01',
        title: 'Organic Chemistry I',
        description: 'Structure and reactions of organic compounds',
        credits: 4,
        professor_id: profMichael.id,
        subject_id: chemistry.id,
        majors: { connect: [{ id: chemistryMajor.id }] },
        prerequisites: { connect: [{ id: chem101.id }] }
      }
    }),

    // Biology 200s
    prisma.course.create({
      data: {
        course_code: 'BIO201-01',
        title: 'Cell Biology',
        description: 'Structure and function of cells',
        credits: 4,
        professor_id: profEmily.id,
        subject_id: biology.id,
        majors: { connect: [{ id: bioMajor.id }] },
        prerequisites: { connect: [{ id: bio101.id }] }
      }
    }),
    prisma.course.create({
      data: {
        course_code: 'BIO210-01',
        title: 'Genetics',
        description: 'Principles of inheritance and gene function',
        credits: 3,
        professor_id: profEmily.id,
        subject_id: biology.id,
        majors: { connect: [{ id: bioMajor.id }] },
        prerequisites: { connect: [{ id: bio101.id }] }
      }
    })
  ]);

  console.log("Successfully seeded database with expanded test data.");
}

seed()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });