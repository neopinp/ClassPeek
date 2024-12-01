import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { restrictTo } from '../middleware/auth.middleware';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/subjects', async (req: Request, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        courses: true
      }
    });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

router.get('/subjects/:id', async (req: Request, res: Response) => {
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        courses: true
      }
    });
    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
});

// PROFESSOR restricted actions
router.post('/subjects', restrictTo(["PROFESSOR"]), async (req: Request, res: Response) => {
  try {
    console.log("Incoming subject payload:", req.body);
    const subject = await prisma.subject.create({
      data: req.body
    });
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

router.delete('/subjects/:id', restrictTo(["PROFESSOR"]), (req, res) => {
  const deleteSubject = async () => {
    try {
      // First check how many courses are associated
      const subject = await prisma.subject.findUnique({
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

      if (!subject) {
        return res.status(404).json({ error: 'Subject not found' });
      }

      if (subject.courses.length > 0) {
        console.log("Subject deletion blocked, has courses still associated.");
        return res.status(400).json({
          error: 'Cannot delete subject with associated courses',
          message: `This subject has ${subject.courses.length} course${subject.courses.length === 1 ? '' : 's'} associated with it:`,
          courses: subject.courses.map(course => `${course.course_code} - ${course.title}`)
        });
      }

      // If no courses are associated, proceed with deletion
      await prisma.subject.delete({
        where: { id: parseInt(req.params.id) }
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete subject' });
    }
  };

  deleteSubject();
});

export default router;