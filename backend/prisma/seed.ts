import { PrismaClient, UserType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seed() {
  const testUsers = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Test Student',
        user_type: UserType.STUDENT,
        dob: new Date('2000-01-01'),
        credentials: {
          create: {
            school_email: 'test.student@university.edu',
            password: await bcrypt.hash('password123', 10)
          }
        },
        profile: {
          create: {
            blurb: 'Test student account for development',
            description: 'This is a test account used for development and testing purposes.'
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
  const professors = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Mary Johnson',
        user_type: UserType.PROFESSOR,
        dob: new Date('1980-03-20'),
        credentials: {
          create: {
            school_email: 'mary.johnson@university.edu',
            password: await bcrypt.hash('password123', 10)
          }
        },
        professor_page: {
          create: {
            bio: 'PhD in Mathematics, specializing in Abstract Algebra',
            office_hours: 'TR 1-3PM',
            office_location: 'HC3020'
          }
        }
      }
    }),
    prisma.user.create({
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
    }),
    prisma.user.create({
      data: {
        name: 'Sarah Chen',
        user_type: UserType.PROFESSOR,
        dob: new Date('1982-08-10'),
        credentials: {
          create: {
            school_email: 'sarah.chen@university.edu',
            password: await bcrypt.hash('password123', 10)
          }
        },
        professor_page: {
          create: {
            bio: 'PhD in Physics, research focus on Quantum Computing',
            office_hours: 'MW 10AM-12PM',
            office_location: 'SC2010'
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        name: 'Michael Brown',
        user_type: UserType.PROFESSOR,
        dob: new Date('1978-11-25'),
        credentials: {
          create: {
            school_email: 'michael.brown@university.edu',
            password: await bcrypt.hash('password123', 10)
          }
        },
        professor_page: {
          create: {
            bio: 'PhD in Chemistry, specializing in Organic Chemistry',
            office_hours: 'TR 9-11AM',
            office_location: 'SC1050'
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        name: 'Emily Taylor',
        user_type: UserType.PROFESSOR,
        dob: new Date('1983-04-30'),
        credentials: {
          create: {
            school_email: 'emily.taylor@university.edu',
            password: await bcrypt.hash('password123', 10)
          }
        },
        professor_page: {
          create: {
            bio: 'PhD in Biology, research in Genetics',
            office_hours: 'MWF 1-3PM',
            office_location: 'SC3030'
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        name: 'David Wilson',
        user_type: UserType.PROFESSOR,
        dob: new Date('1977-09-05'),
        credentials: {
          create: {
            school_email: 'david.wilson@university.edu',
            password: await bcrypt.hash('password123', 10)
          }
        },
        professor_page: {
          create: {
            bio: 'PhD in Computer Science, specializing in Operating Systems and Computer Architecture',
            office_hours: 'MW 3-5PM',
            office_location: 'HC4070'
          }
        }
      }
    })
  ]);
  

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
  const [profMary, profJohn, profSarah, profMichael, profEmily, profDavid] = professors;
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