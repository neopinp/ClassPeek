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

router.delete('/majors/:id', async (req, res) => {
  try {
    await prisma.major.delete({
      where: { id: parseInt(req.params.id)}
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ 
      error: 'Error deleting major, are there still courses attached to it?' 
    });
  }
});

export default router;