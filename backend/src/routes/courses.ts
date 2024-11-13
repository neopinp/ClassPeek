// src/routes/courses.ts
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { restrictTo } from '../middleware/auth.middleware';

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to get base course code
const getBaseCourseCode = (courseCode: string) => courseCode.split('-')[0];

router.get('/courses', async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        professor: { select: { id: true, name: true } },
        subject: true,
        majors: true,
        prerequisites: true
      }
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

router.get('/courses/:id', (req: Request, res: Response) => {
  const fetchCourse = async () => {
    try {
      const course = await prisma.course.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          professor: {
            select: {
              name: true
            }
          },
          subject: {
            select: {
              name: true,
              code: true
            }
          },
          prerequisites: {
            select: {
              id: true,
              course_code: true,
              title: true
            }
          },
          required_for: true,
          majors: true
        }
      });

      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // Group prerequisites by base course code
      const groupedPrerequisites = course.prerequisites.reduce((acc: any[], prereq) => {
        const baseCode = getBaseCourseCode(prereq.course_code);
        if (!acc.some(p => getBaseCourseCode(p.course_code) === baseCode)) {
          acc.push({
            id: prereq.id,
            course_code: baseCode,
            title: prereq.title.split('(')[0].trim()
          });
        }
        return acc;
      }, []);

      res.json({
        ...course,
        prerequisites: groupedPrerequisites
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch course' });
    }
  };

  fetchCourse();
});

// PROFESSOR restricted actions
router.post('/courses', restrictTo(["PROFESSOR"]), async (req: Request, res: Response) => {
  const createCourse = async () => {
    try {
      // Log the incoming payload for debugging
      console.log("Incoming course payload:", req.body);
  
      // Extract necessary fields from the request body and attempt to create the course
      const { title, course_code, description, credits, professor, subject, prerequisites, majors } = req.body;
      const course = await prisma.course.create({
        data: {
          title,
          course_code,
          description,
          credits,
          professor: {
            connect: { id: professor.connect.id }
          },
          subject: {
            connect: { id: subject?.connect?.id }
          },
          prerequisites: prerequisites?.length > 0
            ? { connect: prerequisites.map((prereq: { id: number }) => ({ id: prereq.id })) }
            : undefined,
          majors: majors?.length > 0
            ? { connect: majors.map((major: { id: number }) => ({ id: major.id })) }
            : undefined
        },
        include: {
          professor: true,
          subject: true,
          majors: true
        }
      });
  
      // Respond with the created course
      res.status(201).json(course);
    } catch (error: any) {
      console.error("Error creating course:", error);
        res.status(500).json({ error: "Failed to create course." });
      }
    }
    createCourse();
  });

  router.put('/courses/:id', restrictTo(["PROFESSOR"]), async (req: Request, res: Response) => {
    const updateCourse = async () => {
      try {
        const { title, course_code, description, credits, professor, subject, prerequisites, majors } = req.body;
    
        const courseId = parseInt(req.params.id);
    
        // Log incoming payload for debugging
        console.log("Updating course with payload:", req.body);
    
        // Fetch existing course with prerequisites and majors
        const existingCourse = await prisma.course.findUnique({
          where: { id: courseId },
          include: {
            prerequisites: { select: { id: true } },
            majors: { select: { id: true } },
          },
        });
    
        if (!existingCourse) {
          return res.status(404).json({ error: 'Course not found.' });
        }
    
        // Normalize majors and prerequisites payload
        const majorConnect = majors?.connect?.map((major: { id: number }) => ({ id: major.id })) || [];
        const prereqConnect = prerequisites?.map((prereq: { id: number }) => ({ id: prereq.id })) || [];
        const majorDisconnect =
          existingCourse.majors?.map((major) => ({ id: major.id })) || [];
        const prereqDisconnect =
          existingCourse.prerequisites?.map((prereq) => ({ id: prereq.id })) || [];
    
        // Update the course
        const updatedCourse = await prisma.course.update({
          where: { id: courseId },
          data: {
            title,
            course_code,
            description,
            credits,
            professor: professor?.connect?.id
              ? { connect: { id: professor.connect.id } }
              : undefined,
            subject: subject?.connect?.id
              ? { connect: { id: subject.connect.id } }
              : undefined,
            prerequisites: {
              disconnect: prereqDisconnect,
              connect: prereqConnect,
            },
            majors: {
              disconnect: majorDisconnect,
              connect: majorConnect,
            },
          },
          include: {
            professor: true,
            subject: true,
            majors: true,
            prerequisites: true,
          },
        });
    
        res.json(updatedCourse);
      } catch (error: any) {
        console.error("Error updating course:", error);
        res.status(500).json({ error: 'Failed to update course.' });
      }
    }
    updateCourse();
  });

router.delete('/courses/:id', restrictTo(["PROFESSOR"]), async (req: Request, res: Response) => {
  try {
    await prisma.course.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

export default router;