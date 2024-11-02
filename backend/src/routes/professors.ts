// src/routes/professors.ts
import express, { Request, Response } from 'express';
import { PrismaClient, UserType } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/professors', async (req: Request, res: Response) => {
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

router.get('/professors/:id', async (req: Request, res: Response) => {
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

router.put('/professors/:id/page', async (req: Request, res: Response) => {
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

router.delete('/professors/:id', async (req: Request, res: Response) => {
  try {
    await prisma.$transaction(async (tx) => {
      // First we have to delete the associated comments with the table.
      await tx.comment.deleteMany({
        where: { professor_page_id: parseInt(req.params.id) }
      });
      
      await tx.professorPage.delete({
        where: { id: parseInt(req.params.id) }
      });
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete professor page'});
  }
});

export default router;