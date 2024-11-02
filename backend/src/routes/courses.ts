// src/routes/courses.ts
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to get base course code
const getBaseCourseCode = (courseCode: string) => courseCode.split('-')[0];

router.get('/courses', async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        professor: true,
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
          required_for: true
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

router.post('/courses', async (req: Request, res: Response) => {
  try {
    const course = await prisma.course.create({
      data: req.body,
      include: {
        professor: true,
        subject: true,
        majors: true
      }
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create course' });
  }
});

router.put('/courses/:id', async (req: Request, res: Response) => {
  try {
    const course = await prisma.course.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
      include: {
        professor: true,
        subject: true,
        majors: true
      }
    });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update course' });
  }
});

router.delete('/courses/:id', async (req: Request, res: Response) => {
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