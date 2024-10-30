// src/routes/professors.ts
import express from 'express';
import { PrismaClient, UserType } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/professors', async (req, res) => {
  try {
    const professors = await prisma.user.findMany({
      where: {
        user_type: UserType.PROFESSOR
      },
      include: {
        professor_page: true,
        courses_taught: true,
        credentials: {
          select: {
            school_email: true
          }
        }
      }
    });
    res.json(professors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch professors' });
  }
});

router.get('/professors/:id', async (req, res) => {
  try {
    const professor = await prisma.user.findFirst({
      where: {
        id: parseInt(req.params.id),
        user_type: UserType.PROFESSOR
      },
      include: {
        professor_page: true,
        courses_taught: true,
        credentials: {
          select: {
            school_email: true
          }
        }
      }
    });
    res.json(professor);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch professor' });
  }
});

router.put('/professors/:id/page', async (req, res) => {
  try {
    const professorPage = await prisma.professorPage.update({
      where: { professor_id: parseInt(req.params.id) },
      data: req.body
    });
    res.json(professorPage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update professor page' });
  }
});

export default router;