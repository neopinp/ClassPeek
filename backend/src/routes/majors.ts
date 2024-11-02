// src/routes/majors.ts
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/majors', async (req: Request, res: Response) => {
  try {
    const majors = await prisma.major.findMany({
      include: {
        courses: true
      }
    });
    res.json(majors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch majors' });
  }
});

router.get('/majors/:id', async (req: Request, res: Response) => {
  try {
    const major = await prisma.major.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        courses: true
      }
    });
    res.json(major);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch major' });
  }
});

router.post('/majors', async (req: Request, res: Response) => {
  try {
    const major = await prisma.major.create({
      data: req.body
    });
    res.status(201).json(major);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create major' });
  }
});

router.delete('/majors/:id', (req, res) => {
  const deleteMajor = async () => {
    try {
      // First check how many courses are associated
      const major = await prisma.major.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          courses: {
            select: {
              id: true,
              course_code: true,
              title: true
            }
          }
        }
      });

      if (!major) {
        return res.status(404).json({ error: 'Major not found' });
      }

      if (major.courses.length > 0) {
        return res.status(400).json({
          error: 'Cannot delete major with associated courses',
          message: `This major has ${major.courses.length} course${major.courses.length === 1 ? '' : 's'} associated with it:`,
          courses: major.courses.map(course => `${course.course_code} - ${course.title}`)
        });
      }

      // If no courses are associated, proceed with deletion
      await prisma.major.delete({
        where: { id: parseInt(req.params.id) }
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete major' });
    }
  };

  deleteMajor();
});

export default router;