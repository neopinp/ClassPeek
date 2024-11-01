// src/routes/subjects.ts
import express, { Request, Response, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';

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

router.post('/subjects', async (req: Request, res: Response) => {
  try {
    const subject = await prisma.subject.create({
      data: req.body
    });
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

router.delete('/subjects/:id', async (req, res) => {
  try {
    await prisma.subject.delete({
      where: { id: parseInt(req.params.id)}
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ 
      error: 'Error deleting subject, are there still courses attached to it?' 
    });
  }
});

export default router;